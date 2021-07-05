document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");

  // Get the form
  const form = document.getElementById("compose-form");
  form.onsubmit = (e) => {
    // stop form from the submission
    e.preventDefault();

    // fetch emailId, subject, and body
    const to_email = document.getElementById("compose-recipients").value;
    const subject = document.getElementById("compose-subject").value;
    const body = document.getElementById("compose-body").value;

    // Log the data
    console.log(to_email, subject, body);

    // send mail
    send_mail(to_email, subject, body);
  };
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // fetch the mail
  fetch_mail(mailbox);
}

// function fetch mails
function fetch_mail(mailbox_type) {
  fetch(`emails/${mailbox_type}`)
    .then((response) => response.json())
    .then((emails) => {
      // clear the emails-view div
      const appendElement = document.getElementById("emails-view");
      // appendElement.innerHTML = "";

      emails.forEach((email) => {
        // destructure the email fields
        const {
          id,
          sender,
          recipients,
          subject,
          body,
          timestamp,
          read,
          archived,
        } = email;
        console.log(id);

        render_email(mailbox_type, id, subject, timestamp, sender, read);
      });
    });
}

// Send Mail
function send_mail(to_email, subject, body) {
  // make POST request to /emails
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: to_email,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => {
      return response.json();
    })

    .then((result) => {
      // if have error, show error message
      if (result["error"]) {
        // todo
        console.log(result["error"]);
      }

      // if success, show success message
      if (result["message"]) {
        // todo show success toast
        console.log(result["message"]);

        // load the user sent mailbox
        load_mailbox("sent");
      }
    })

    .catch((error) => {
      console.error(error);
    });
}

// Show Success toast
function success_toast() {
  // todo
}

// show Error toast
function error_toast() {
  // todo
}

// make div
function render_email(mailbox, id, subject, timestamp, sender, read) {
  // mailbox we are in
  console.log(mailbox);

  // place to append element
  const appendElement = document.getElementById("emails-view");

  // create an element
  const element = document.createElement("div");
  element.classList.add(
    "alert",
    "alert-primary",
    "d-flex",
    "justify-content-between"
  );

  if (read === true && mailbox === "inbox") {
    console.log("read already");
    element.classList.add("border-start-3", "border-danger");
    element.style.backgroundColor = "grey";
  }

  if (read === false && mailbox === "inbox") {
    element.style.backgroundColor = "white";
  }
  // id element
  const idElement = document.createElement("div");
  idElement.innerHTML = `${sender}`;

  // subject element
  const subjectElement = document.createElement("div");
  subjectElement.innerHTML = `${subject}`;

  // timestamp element
  const timestampElement = document.createElement("div");
  timestampElement.innerHTML = `${timestamp}`;

  element.appendChild(idElement);
  element.appendChild(subjectElement);
  element.appendChild(timestampElement);

  element.addEventListener("click", () => {
    console.log(`div with ${id} clicked`);
    fetch_each_mail(mailbox, id);
  });

  appendElement.append(element);
}

// fetch each email
function fetch_each_mail(mailbox, id) {
  fetch(`emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      console.log(email);

      // destructure the email fields
      const {
        id,
        sender,
        recipients,
        subject,
        body,
        timestamp,
        read,
        archived,
      } = email;

      // mark as read
      mark_read(id);

      // clear the emails-view field
      const emailview = document.getElementById("emails-view");
      emailview.innerHTML = "";

      // fill the innerHtml
      const fromElements = document.createElement("div");
      fromElements.innerHTML = `<b>From: </b> ${sender}`;
      const toElements = document.createElement("div");
      toElements.innerHTML = `<b>To: </b> ${recipients}`;
      const subjectElements = document.createElement("div");
      subjectElements.innerHTML = `<b>Subject: </b> ${subject}`;
      const timestampElements = document.createElement("div");
      timestampElements.innerHTML = `<b>Timestamp: </b> ${timestamp}`;
      const bodyElements = document.createElement("div");
      bodyElements.innerHTML = `<b>Body: </b> ${body}`;
      // emailview.innerHTML = `${id} - ${sender} - ${recipients} - ${subject} - ${body} - ${timestamp} - ${read} - ${archived}`;
      emailview.appendChild(fromElements);
      emailview.appendChild(toElements);
      emailview.appendChild(subjectElements);
      emailview.appendChild(timestampElements);
      emailview.appendChild(bodyElements);

      // append archive and unarchive btn conditionally
      const archiveBtn = document.createElement("button");
      archiveBtn.classList.add("btn", "btn-primary", "m-2");
      archiveBtn.innerHTML = "Archive";

      // Add event listener to the archive btn
      archiveBtn.addEventListener("click", () => {
        console.log("Archive btn clicked");
        toggle_archive(id, true);
        load_mailbox("archive");
      });

      // Add archive btn
      if (mailbox === "inbox") {
        emailview.appendChild(archiveBtn);
      }

      // unarchive btn
      const unarchiveBtn = document.createElement("button");
      unarchiveBtn.classList.add("btn", "btn-danger", "m-2");
      unarchiveBtn.innerHTML = "Unarchive";

      // add eventlistener to the unarhive btn
      unarchiveBtn.addEventListener("click", () => {
        console.log("unarhive btn clicked");
        toggle_archive(id, false);

        // Add time interval
        // setTimeout(load_mailbox("inbox"), 0);
        load_mailbox("inbox");
      });

      // add unarchive btn
      if (mailbox === "archive") {
        emailview.appendChild(unarchiveBtn);
      }

      // reply button
      const replyBtn = document.createElement("button");
      replyBtn.classList.add("btn", "btn-success");
      replyBtn.innerHTML = "reply";

      // add event listener to the replybtn
      replyBtn.addEventListener("click", () => {
        console.log("reply btn clicked");

        // modify subject if required
        const haveRe = subject.slice(0, 4) === "Re: ";
        var newSubject = "";
        if (subject.slice(0, 4) !== "Re: ") {
          console.log(subject.slice(0, 4));
          console.log(haveRe);
          newSubject = "Re: " + subject;
        }

        // Show compose view and hide other views
        document.querySelector("#emails-view").style.display = "none";
        document.querySelector("#compose-view").style.display = "block";

        document.querySelector("#compose-recipients").value = sender;
        document.querySelector("#compose-subject").value = haveRe
          ? subject
          : newSubject;
        document.querySelector("#compose-body").value = ` 
          
          <hr />
          On ${timestamp} ${sender} wrote: ${body}
        `;
      });

      // append reply btn
      if (mailbox === "inbox") {
        emailview.appendChild(replyBtn);
      }
    });
}

// mark as read
function mark_read(id) {
  // PUT request
  fetch(`emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

// toggle archive
function toggle_archive(id, status) {
  // PUT request
  fetch(`emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: status,
    }),
  });
}
