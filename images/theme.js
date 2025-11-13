// theme.js — drop this file next to your index.html
(function () {
  const btn = document.getElementById('theme-toggle');
  const labelClass = 'theme-label';

  // Create the label span if it doesn't exist
  let label = btn.querySelector('.' + labelClass);
  if (!label) {
    label = document.createElement('span');
    label.className = labelClass;
    label.style.display = 'block';
    label.style.fontSize = '10px';
    label.style.lineHeight = '1';
    btn.appendChild(label);
  }

  // Apply saved theme
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark-mode');

  // Update the button icon and label based on current theme
  function updateButton() {
    const isDark = document.body.classList.contains('dark-mode');
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.appendChild(label); // re-attach label
    label.textContent = isDark ? 'LIGHT MODE' : 'DARK MODE';
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  // Attach click handler
  function attachHandler() {
    if (!btn) return;
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
      updateButton();
    });

    updateButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandler);
  } else {
    attachHandler();
  }
})();
