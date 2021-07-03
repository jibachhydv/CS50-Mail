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
  load_mailbox('inbox');

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
        load_mailbox('sent')
        
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




