const scriptURL =
  "https://script.google.com/macros/s/AKfycbxya6N9tzZCzDVC6JEM7wOhuvJQ64XMk1e9cs1fK0Q/dev";

let bandcampURL = null;
let selectedTitle = null;
let redemptionHistory = {};

document.addEventListener("DOMContentLoaded", function () {
  loadRedemptionHistory();
  setupBandcampPrompt();
  setupRedeemButtons();
  updateButtonStates();
});

function loadRedemptionHistory() {
  const savedHistory = localStorage.getItem("redemptionHistory");
  if (savedHistory) {
    redemptionHistory = JSON.parse(savedHistory);
  }
}

function saveRedemptionHistory() {
  localStorage.setItem("redemptionHistory", JSON.stringify(redemptionHistory));
}

function updateButtonStates() {
  const storedURL = localStorage.getItem("bandcampURL");
  if (!storedURL) return;

  const buttons = document.querySelectorAll(".redeem-button");
  buttons.forEach((button) => {
    const title = button.getAttribute("data-title");
    if (
      redemptionHistory[storedURL] &&
      redemptionHistory[storedURL].includes(title)
    ) {
      updateButton(button, "Already Redeemed", true);
    }
  });
}

function setupBandcampPrompt() {
  const submitBtn = document.getElementById("submit-url-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();
      submitBandcampURL();
    });
  }

  const input = document.getElementById("bandcamp-url");
  if (input) {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitBandcampURL();
      }
    });
  }
}

function submitBandcampURL() {
  const input = document.getElementById("bandcamp-url");
  const url = input.value.trim();

  if (!url || !url.toLowerCase().includes("bandcamp.com/")) {
    showToast("Please enter a valid Bandcamp profile URL");
    return;
  }

  bandcampURL = url;
  localStorage.setItem("bandcampURL", url);

  document.getElementById("bandcamp-prompt").style.display = "none";
  const overlay = document.getElementById("overlay");
  if (overlay) overlay.style.display = "none";

  fetchAvailableTitles();
}

function fetchAvailableTitles() {
  if (!bandcampURL) return;

  const titlesContainer = document.getElementById("titles-container");
  if (!titlesContainer) return;

  titlesContainer.innerHTML = "<p>Loading titles...</p>";

  fetch(`${scriptURL}?action=getTitles&bandcamp=${encodeURIComponent(bandcampURL)}`)
    .then((response) => response.json())
    .then((data) => {
      titlesContainer.innerHTML = "";

      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => {
          const box = document.createElement("div");
          box.className = "player-box";

          const status = item.status;
          const title = item.title;
          const disabled = status !== "Add To Collection";

          box.innerHTML = `
            <h3>${title}</h3>
            <p>Status: ${status}</p>
            <button class="redeem-button" data-title="${title}" ${
            disabled ? "disabled" : ""
          }>${disabled ? status : "Add To Collection"}</button>
          `;

          titlesContainer.appendChild(box);
        });

        setupRedeemButtons();
        updateButtonStates();
      } else {
        titlesContainer.innerHTML = "<p>No available titles.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching titles:", error);
      titlesContainer.innerHTML = "<p>Error loading titles.</p>";
    });
}

function setupRedeemButtons() {
  document.querySelectorAll(".redeem-button").forEach((button) => {
    button.addEventListener("click", function () {
      if (this.disabled) return;

      selectedTitle = this.getAttribute("data-title");

      if (
        redemptionHistory[bandcampURL] &&
        redemptionHistory[bandcampURL].includes(selectedTitle)
      ) {
        showToast("You've already redeemed this title");
        return;
      }

      checkRedemptionStatus(this);
    });
  });
}

function checkRedemptionStatus(button) {
  toggleLoadingSpinner(true);

  fetch(
    `${scriptURL}?bandcamp=${encodeURIComponent(
      bandcampURL
    )}&title=${encodeURIComponent(selectedTitle)}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "Already In Collection") {
        updateButton(button, "In Collection", true);
        showToast("This title is already in your collection");
        addToRedemptionHistory(selectedTitle);
      } else if (data.status === "No Available Codes") {
        updateButton(button, "No Codes", true);
        showToast("No codes available for this title");
      } else if (data.status === "Success" && data.code) {
        redeemCode(data.code);
        updateButton(button, "Redeemed!", true);
        showToast("Code redeemed successfully!");
        addToRedemptionHistory(selectedTitle);
      } else {
        updateButton(button, "Try Again", false);
        showToast("Error: " + (data.message || "Unknown error"));
      }
    })
    .catch((error) => {
      console.error("Redemption error:", error);
      updateButton(button, "Try Again", false);
      showToast("Error connecting to server.");
    })
    .finally(() => {
      toggleLoadingSpinner(false);
    });
}

function redeemCode(code) {
  const form = document.getElementById("hidden-redeem-form");
  const input = form.querySelector('input[name="code"]');
  if (form && input) {
    input.value = code;
    form.submit();
  } else {
    showToast("Could not submit code. Try manually.");
  }
}

function updateButton(button, text, disable) {
  if (!button) return;
  button.innerText = text;
  button.disabled = disable;
  button.classList.toggle("redeemed", disable);
}

function addToRedemptionHistory(title) {
  if (!bandcampURL) return;
  if (!redemptionHistory[bandcampURL]) {
    redemptionHistory[bandcampURL] = [];
  }
  if (!redemptionHistory[bandcampURL].includes(title)) {
    redemptionHistory[bandcampURL].push(title);
    saveRedemptionHistory();
  }
}

function toggleLoadingSpinner(show) {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) spinner.style.display = show ? "block" : "none";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
