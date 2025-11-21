/* References

   1. Immediately Invoked Function Expression (IIFE):
      - MDN: https://developer.mozilla.org/en-US/docs/Glossary/IIFE
      - W3Schools: https://www.w3schools.com/js/js_function_invocation.asp
      - JavaScript.info: https://javascript.info/function-expressions-arrows#immediately-invoked-function-expression-iife

   2. localStorage (storing user preferences):
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
      - W3Schools: https://www.w3schools.com/html/html5_webstorage.asp
      - JavaScript.info: https://javascript.info/localstorage

   3. Class toggling (classList.toggle, classList.contains):
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
      - W3Schools: https://www.w3schools.com/jsref/prop_element_classlist.asp
      - JavaScript.info: https://javascript.info/classlist

   4. DOM Manipulation (getElementById, innerHTML, setAttribute):
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerHTML
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
      - W3Schools: https://www.w3schools.com/jsref/dom_obj_all.asp

   5. Event Listeners (click):
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
      - W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
      - JavaScript.info: https://javascript.info/introduction-browser-events

   6. Accessibility (ARIA attributes):
      - MDN: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
      - W3Schools: https://www.w3schools.com/html/html5_aria.asp 
*/

(function () {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Apply saved theme from localStorage
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark-mode');

  // Function to update the button's icon and label
  function updateButton() {
    const isDark = document.body.classList.contains('dark-mode');

    // Use innerHTML to allow a line break
    btn.innerHTML = isDark
      ? '☀️<span class="theme-label">LIGHT<br>MODE</span>'
      : '🌙<span class="theme-label">DARK<br>MODE</span>';

    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  // Toggle theme on button click
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Save preference
    localStorage.setItem(
      'theme',
      document.body.classList.contains('dark-mode') ? 'dark' : 'light'
    );

    updateButton();
  });

  // Initialize button state
  updateButton();
})();
