/* References:

1. DOMContentLoaded Event
   - document.addEventListener("DOMContentLoaded", ...)
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
     W3Schools: https://www.w3schools.com/jsref/event_domcontentloaded.asp

2. Accessing Elements
   - document.getElementById(), form.elements
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements
     W3Schools: https://www.w3schools.com/jsref/met_document_getelementbyid.asp

3. Event Handling
   - element.addEventListener("submit", callback)
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     W3Schools: https://www.w3schools.com/js/js_htmldom_eventlistener.asp

4. Preventing Default Form Submission
   - event.preventDefault()
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
     W3Schools: https://www.w3schools.com/jsref/event_preventdefault.asp

5. String Manipulation
   - .trim(), .split(/\s+/), .filter()
     MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
     MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
     MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter

6. Regular Expressions
   - /^[^@]{2,}@[^@]{2,}\.[^@]{2,}$/ for email validation
     MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
     W3Schools: https://www.w3schools.com/js/js_regexp.asp

7. Conditional Logic
   - if statements to check validation rules
     MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else
     W3Schools: https://www.w3schools.com/js/js_if_else.asp

8. Alerts
   - alert("message")
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/alert
     W3Schools: https://www.w3schools.com/jsref/met_win_alert.asp

9. Form Reset
   - form.reset()
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset
     W3Schools: https://www.w3schools.com/jsref/met_form_reset.asp

10. Word Count Logic
    - message.split(/\s+/).filter(word => word.length > 0).length
      MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
      MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
      Explanation: splits message into words, filters out empty strings, and counts total words.

11. Script Origin
    - This script handles contact form validation for the contact.html page.
*/

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent actual form submission

    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    const message = form.elements["message"].value.trim();

    // Basic email validation
    const emailRegex = /^[^@]{2,}@[^@]{2,}\.[^@]{2,}$/;

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email (example: name@example.com).");
      return;
    }

    // Check if message has at least 20 words
    const wordCount = message.split(/\s+/).filter(word => word.length > 0).length;
    if (!message || wordCount < 20) {
      alert("Please enter a message with at least 20 words.");
      return;
    }

    // If all validation passes
    alert("Thank you! Your message has been sent.");
    form.reset();
  });
});
