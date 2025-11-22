/* References:

   1. DOMContentLoaded:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
      - Explanation: Ensures the JS runs only after the DOM is fully loaded.

   2. Query Selectors & NodeLists:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
      - Explanation: Select elements using CSS selectors. Returns NodeList for iteration.

   3. setInterval:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/setInterval
      - Explanation: Executes a function repeatedly after a fixed delay (e.g., auto-slide).

   4. Fetch API:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
      - Explanation: Asynchronously retrieves data (JSON shows list) from server.

   5. Math.random & Math.floor:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
      - Explanation: Randomly select a show or template from an array.

   6. Element.style:
      - MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
      - Explanation: Dynamically update inline CSS (opacity for fade-in effect).

   7. innerHTML vs textContent:
      - MDN innerHTML: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
      - MDN textContent: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
      - Explanation: innerHTML allows line breaks (<br>) and HTML formatting.
*/

document.addEventListener("DOMContentLoaded", () => {
  // --- Left slider elements ---
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  const showSlide = (index) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  };

  // Auto-slide every 8s
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 8000);

  // --- Right featured section ---
  const featuredImage = document.getElementById("side-image-featured");
  const featuredText = document.getElementById("side-text-featured");

  // --- Text templates and connectors ---
  const sideTextTemplates = [
    "Catch all your favourites",
    "Never miss a show",
    "Your entertainment, your way",
    "Stay tuned for more",
    "Binge-watch made easy",
    "All your shows in one place",
    "Watch what you love, anytime",
    "Discover something new today",
    "Entertainment at your fingertips",
    "Find your next favourite series",
    "Streamlined TV schedules just for you",
    "Movies, series, and more",
    "Your ultimate TV guide",
    "Keep your evenings fun",
    "Explore top channels now",
    "Plan your perfect watchlist",
    "Shows you'll never forget",
    "Family fun starts here",
    "Catch up on the latest hits",
    "Entertainment made simple",
    "Your guide to tonight's shows",
    "All your favourites, no hassle",
    "From classics to new releases",
    "TV made easy for everyone",
    "One place for all your entertainment"
  ];

  const connectors = [
    "such as",
    "including",
    "like",
    "featuring",
    "for example",
    "for instance"
  ];

  // --- Fade-in for images ---
  const fadeImageIn = (imgElement, newSrc) => {
    imgElement.style.opacity = 0;
    setTimeout(() => {
      imgElement.src = newSrc;
      imgElement.style.opacity = 1;
    }, 200);
  };

  // --- Fetch and update featured show ---
  const updateFeatured = () => {
    fetch('json/shows.json')  //
      .then(res => res.json())
      .then(shows => {
        if (!shows.length) return;

        const show = shows[Math.floor(Math.random() * shows.length)];

        // Fade image
        fadeImageIn(featuredImage, show.src);

        // Random text
        const connector = connectors[Math.floor(Math.random() * connectors.length)];
        const textTemplate = sideTextTemplates[Math.floor(Math.random() * sideTextTemplates.length)];
        featuredText.innerHTML = `${textTemplate}, ${connector}<br>${show.name}.`;
      })
      .catch(err => console.error("Error loading featured shows:", err));
  };

  // Initial load and interval for featured section
  updateFeatured();
  setInterval(updateFeatured, 8000);

  // --- Footer year ---
  const yearSpan = document.getElementById("footer-year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
