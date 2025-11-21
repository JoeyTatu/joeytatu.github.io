/* Note: This file is not used. However, it's kept to show how it would be used.

  References

   1. DOMContentLoaded:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
      - W3Schools: https://www.w3schools.com/jsref/event_domcontentloaded.asp
      - JavaScript.info: https://javascript.info/onload-ondomcontentloaded

   2. Selecting DOM Elements:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
      - W3Schools: https://www.w3schools.com/jsref/met_document_getelementbyid.asp
      - JavaScript.info: https://javascript.info/dom-nodes

   3. Event Listeners:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
      - W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
      - JavaScript.info: https://javascript.info/introduction-browser-events

   4. Input Events:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event
      - W3Schools: https://www.w3schools.com/jsref/event_oninput.asp
      - JavaScript.info: https://javascript.info/input-events

   5. Class Manipulation (classList):
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
      - W3Schools: https://www.w3schools.com/jsref/prop_element_classlist.asp
      - JavaScript.info: https://javascript.info/classlist

   6. Focusing Elements:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
      - W3Schools: https://www.w3schools.com/jsref/met_html_focus.asp
      - JavaScript.info: https://javascript.info/focus-blur
*/

document.addEventListener("DOMContentLoaded", () => {
  const searchContainer = document.getElementById("search-container");
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-search");

  if (searchInput && clearBtn) {
    searchInput.addEventListener("input", () => {
      if (searchInput.value.trim() !== "") {
        searchContainer.classList.add("has-text");
      } else {
        searchContainer.classList.remove("has-text");
      }
    });

    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchContainer.classList.remove("has-text");
      searchInput.focus();
    });
  }
});
