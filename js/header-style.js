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
