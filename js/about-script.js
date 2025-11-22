/* References

1. Document Ready / DOMContentLoaded
   - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
   - W3Schools: https://www.w3schools.com/js/js_htmldom_eventlistener.asp

2. Selecting Elements
   - querySelector, getElementById
     MDN querySelector: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
     MDN getElementById: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
     W3Schools: https://www.w3schools.com/jsref/met_document_queryselector.asp

3. Fetch API / JSON
   - fetch(), response.json()
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
     W3Schools: https://www.w3schools.com/js/js_api_fetch.asp

4. Array Methods
   - map(), spread operator [...]
     MDN map(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
     MDN Spread: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

5. DOM Manipulation
   - createElement(), appendChild(), setting attributes
     MDN createElement: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
     MDN appendChild: https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
     MDN setAttribute: https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute

6. Animation & Scrolling
   - requestAnimationFrame()
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
     W3Schools: https://www.w3schools.com/graphics/game_anim.asp

7. Error Handling / Console
   - console.error()
     MDN: https://developer.mozilla.org/en-US/docs/Web/API/Console/error
     W3Schools: https://www.w3schools.com/jsref/met_console_error.asp

8. Continuous Carousel Logic
   - Duplicating array to create seamless scrolling
     Explanation: clone array elements to allow a continuous loop without visual gaps
*/

document.addEventListener("DOMContentLoaded", () => {
    const carouselContainer = document.querySelector(".carousel-container");
    const carouselRow = document.getElementById("carousel-row");

    // Fetch show images
    fetch("json/shows.json")
        .then(res => res.json())
        .then(data => {
            const images = data.map(show => show.src);
            // Duplicate images for seamless scrolling
            const allImages = [...images, ...images];

            allImages.forEach(src => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = "Show image";
                carouselRow.appendChild(img);
            });

            startScrolling();
        })
        .catch(err => console.error("Error loading images:", err));

    let scrollPos = 0;
    const scrollSpeed = 0.5; // pixels per frame

    function startScrolling() {
        const totalScrollWidth = carouselRow.scrollWidth / 2; // only scroll through first set

        function animate() {
            scrollPos += scrollSpeed;
            if (scrollPos >= totalScrollWidth) scrollPos = 0;
            carouselContainer.scrollLeft = scrollPos; // <-- scroll the container
            requestAnimationFrame(animate);
        }

        animate();
    }
});
