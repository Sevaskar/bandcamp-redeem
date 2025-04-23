// Configuration
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxya6N9tzZCzDVC6JEM7wOhuvJQ64XMk1e9cs1fK0Q/dev";

// State management
let selectedTitle = null;
let bandcampURL = null;
let redemptionHistory = {}; // Track redemption history

// Initialize event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Load redemption history from localStorage
  loadRedemptionHistory();

  // Set up event listeners
  setupRedeemButtons();
  setupBandcampPrompt();

  // Update button states based on redemption history
  updateButtonStates();
});

// Load redemption history from local storage
function loadRedemptionHistory() {
  const savedHistory = localStorage.getItem("redemptionHistory");
  if (savedHistory) {
    redemptionHistory = JSON.parse(savedHistory);
  }
}

// Save redemption history to local storage
function saveRedemptionHistory() {
  localStorage.setItem("redemptionHistory", JSON.stringify(redemptionHistory));
}

// Update button states based on redemption history
function updateButtonStates() {
  // Get all redeem buttons (works for both index.html and redeem-code.html)
  const buttons = document.querySelectorAll(
    ".redeem-button, .redeem-code-button"
  );

  // Get the stored bandcamp URL
  const storedURL = localStorage.getItem("bandcampURL");
  if (!storedURL) return;

  buttons.forEach((button) => {
    const title = button.getAttribute("data-title");

    // Check if this title has been redeemed by this user
    if (
      redemptionHistory[storedURL] &&
      redemptionHistory[storedURL].includes(title)
    ) {
      button.innerText = "Already Redeemed";
      button.disabled = true;
      button.classList.add("redeemed");
    }
  });
}

// Set up event listeners for redeem buttons
function setupRedeemButtons() {
  // Handle both types of button classes (for index.html and redeem-code.html)
  document
    .querySelectorAll(".redeem-button, .redeem-code-button")
    .forEach((button) => {
      button.addEventListener("click", function () {
        // Skip if button is disabled
        if (this.disabled) return;

        selectedTitle = this.getAttribute("data-title");

        // Check if we already have a bandcamp URL stored in local storage
        const storedURL = localStorage.getItem("bandcampURL");

        if (storedURL) {
          bandcampURL = storedURL;

          // Check if this user already redeemed this title
          if (
            redemptionHistory[bandcampURL] &&
            redemptionHistory[bandcampURL].includes(selectedTitle)
          ) {
            showToast("You've already redeemed this title");
            return;
          }

          checkRedemptionStatus();
        } else {
          // Show prompt to enter Bandcamp URL
          document.getElementById("bandcamp-prompt").style.display = "flex";
          if (document.getElementById("overlay")) {
            document.getElementById("overlay").style.display = "block";
          }
        }
      });
    });
}

// Set up bandcamp URL submission
function setupBandcampPrompt() {
  // Add click event for the Enter button in the prompt
  const enterButton = document.getElementById("submit-url-btn");
  if (enterButton) {
    enterButton.addEventListener("click", function (e) {
      e.preventDefault();
      submitBandcampURL();
    });
  }

  // Also allow submission by pressing Enter in the input field
  const urlInput = document.getElementById("bandcamp-url");
  if (urlInput) {
    urlInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitBandcampURL();
      }
    });
  }
}

// Process the bandcamp URL submission
function submitBandcampURL() {
  const input = document.getElementById("bandcamp-url");
  const url = input.value.trim();

  // Basic validation
  if (!url) {
    showToast("Please enter your Bandcamp URL");
    return;
  }

  // More thorough validation
  if (!url.toLowerCase().includes("bandcamp.com/")) {
    showToast("Please enter a valid Bandcamp profile URL");
    return;
  }

  // Store URL for future use
  bandcampURL = url;
  localStorage.setItem("bandcampURL", url);

  // Hide the prompt
  document.getElementById("bandcamp-prompt").style.display = "none";
  if (document.getElementById("overlay")) {
    document.getElementById("overlay").style.display = "none";
  }

  // Check if this user already redeemed this title
  if (
    redemptionHistory[bandcampURL] &&
    redemptionHistory[bandcampURL].includes(selectedTitle)
  ) {
    showToast("You've already redeemed this title");
    return;
  }

  // Show loading indicator
  toggleLoadingSpinner(true);

  // Proceed to check redemption
  checkRedemptionStatus();
}

// Check if user can redeem and get a code if available
function checkRedemptionStatus() {
  if (!bandcampURL || !selectedTitle) {
    showToast("Missing information for redemption");
    toggleLoadingSpinner(false);
    return;
  }

  // Show loading indicator
  toggleLoadingSpinner(true);

  // Find the button for this title (works for both page versions)
  const buttonSelector = `.redeem-button[data-title="${selectedTitle}"], .redeem-code-button[data-title="${selectedTitle}"]`;
  const button = document.querySelector(buttonSelector);

  // Make the request to your Google Script
  fetch(
    `${scriptURL}?bandcamp=${encodeURIComponent(
      bandcampURL
    )}&title=${encodeURIComponent(selectedTitle)}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Handle the different response statuses
      if (data.status === "Already In Collection") {
        updateButton(button, "In Collection", true);
        showToast("This title is already in your collection");

        // Track this redemption in history
        addToRedemptionHistory(selectedTitle);
      } else if (data.status === "No Available Codes") {
        updateButton(button, "No Codes", true);
        showToast("No codes available for this title");
      } else if (data.status === "Success" && data.code) {
        // Process successful redemption
        redeemCode(data.code);
        updateButton(button, "Redeemed!", true);
        showToast("Code redeemed successfully!");

        // Track this redemption in history
        addToRedemptionHistory(selectedTitle);
      } else {
        // Handle unexpected response
        updateButton(button, "Try Again", false);
        showToast("Error: " + (data.message || "Unknown error"));
      }
    })
    .catch((error) => {
      console.error("Error checking redemption:", error);
      updateButton(button, "Try Again", false);
      showToast("Error connecting to server. Please try again.");
    })
    .finally(() => {
      toggleLoadingSpinner(false);
    });
}

// Add to redemption history
function addToRedemptionHistory(title) {
  if (!bandcampURL) return;

  // Initialize user's history if not exists
  if (!redemptionHistory[bandcampURL]) {
    redemptionHistory[bandcampURL] = [];
  }

  // Add this title to the user's history if not already present
  if (!redemptionHistory[bandcampURL].includes(title)) {
    redemptionHistory[bandcampURL].push(title);
    saveRedemptionHistory();
  }
}

// Helper to update button appearance
function updateButton(button, text, disable) {
  if (!button) return;

  button.innerText = text;
  button.disabled = disable;
  if (disable) {
    button.classList.add("redeemed");
  } else {
    button.classList.remove("redeemed");
  }
}

// Submit the code to bandcamp
function redeemCode(code) {
  const form = document.getElementById("hidden-redeem-form");
  const codeInput = form.querySelector('input[name="code"]');

  if (form && codeInput) {
    codeInput.value = code;
    form.submit();
  } else {
    console.error("Form elements not found");
    showToast("Error submitting code. Please try manually.");
  }
}

// Toggle loading spinner
function toggleLoadingSpinner(show) {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.style.display = show ? "block" : "none";
  }
}

// Show a toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.innerText = message;
    toast.classList.add("show");

    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}
