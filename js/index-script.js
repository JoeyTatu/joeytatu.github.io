document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const rightTop = document.getElementById("side-image-top");
  const rightBottom = document.getElementById("side-image-bottom");
  const rightTopText = document.getElementById("side-text-top");
  const rightBottomText = document.getElementById("side-text-bottom");

  let current = 0;

  const sideTexts = [
    "Catch all your favourites!",
    "Never miss a show!",
    "Your entertainment, your way!",
    "Stay tuned for more!",
    "Binge-watch made easy!",
    "All your shows in one place!",
    "Watch what you love, anytime!",
    "Discover something new today!",
    "Entertainment at your fingertips!",
    "Find your next favourite series!",
    "Streamlined TV schedules just for you!",
    "Movies, series, and more!",
    "Your ultimate TV guide!",
    "Keep your evenings fun!",
    "Explore top channels now!",
    "Plan your perfect watchlist!",
    "Shows you'll never forget!",
    "Family fun starts here!",
    "Catch up on the latest hits!",
    "Entertainment made simple!",
    "Your guide to tonight's shows!",
    "All your favourites, no hassle!",
    "From classics to new releases!",
    "TV made easy for everyone!",
    "One place for all your entertainment!"
  ];

  // Main slider show
  const showSlide = (index) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  };

  // Auto-slide every 5s
  setInterval(() => {
    current = (current + 1) % slides.length;
    showSlide(current);
  }, 8000);

  // Smooth fade for right-side images
  const fadeImageIn = (imgElement, newSrc) => {
    imgElement.style.opacity = 0;
    setTimeout(() => {
      imgElement.src = newSrc;
      imgElement.style.opacity = 1;
    }, 200);
  };

  // Update right-side sections
  const updateRightSide = () => {
    fetch('images-list.php')
      .then(res => res.json())
      .then(images => {
        // Top image
        let randTop = images[Math.floor(Math.random() * images.length)];
        fadeImageIn(rightTop, randTop);

        // Bottom image (different)
        let randBottom;
        do {
          randBottom = images[Math.floor(Math.random() * images.length)];
        } while (images.length > 1 && randBottom === randTop);
        fadeImageIn(rightBottom, randBottom);
      });

    // Random text
    rightTopText.textContent = sideTexts[Math.floor(Math.random() * sideTexts.length)];
    rightBottomText.textContent = sideTexts[Math.floor(Math.random() * sideTexts.length)];
  };

  // Initial load
  updateRightSide();

  // Update every 5 seconds
  setInterval(updateRightSide, 8000);

  // Update footer year
  const yearSpan = document.getElementById("footer-year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
