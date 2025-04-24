// Configuration
const scriptURL = "https://script.google.com/macros/s/AKfycby2rV3TvxP8EjT-oe45IvP3XwEu59vPRgvmrsYOdPqsmAF9oFu727CnwosIG6MRglMV/exec";

// State management
let bandcampURL = null;

// Initialize event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Set up event listeners
  setupBandcampPrompt();
});

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
    alert("Please enter your Bandcamp URL");
    return;
  }

  // More thorough validation
  if (!url.toLowerCase().includes("bandcamp.com/")) {
    alert("Please enter a valid Bandcamp profile URL");
    return;
  }

  // Store URL for future use
  bandcampURL = url;
  localStorage.setItem("bandcampURL", url);

  // Hide the prompt box
  document.getElementById("prompt-box").style.display = "none";

  // Fetch available titles from the server
  fetchAvailableTitles();
}

// Fetch available titles from the server
function fetchAvailableTitles() {
  fetch(`${scriptURL}?bandcamp=${encodeURIComponent(bandcampURL)}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      displayTitles(data);
    })
    .catch((error) => {
      console.error("Error fetching titles:", error);
      alert("Error fetching titles. Please try again later.");
    });
}

// Display titles in the titles-container
function displayTitles(titles) {
  const container = document.getElementById("titles-container");
  container.innerHTML = ""; // Clear any existing content

  if (!Array.isArray(titles) || titles.length === 0) {
    container.innerHTML = "<p>No titles available for redemption.</p>";
    container.style.display = "block";
    return;
  }

  titles.forEach((title) => {
    const titleElement = document.createElement("div");
    titleElement.textContent = title;
    container.appendChild(titleElement);
  });

  container.style.display = "block";
}
