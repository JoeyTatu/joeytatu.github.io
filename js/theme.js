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
