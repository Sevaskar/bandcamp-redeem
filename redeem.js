const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec";
document.addEventListener("DOMContentLoaded", function () {
    let bandcampUrl = localStorage.getItem("bandcampUrl");

    const urlInputContainer = document.getElementById("bandcampUrlInput");
    const urlInput = document.getElementById("bandcampUrl");
    const submitButton = document.getElementById("enterBandcampUrl");

    // Show or hide input field based on whether a Bandcamp URL is stored
    if (!bandcampUrl) {
        urlInputContainer.style.display = "block";
    } else {
        urlInputContainer.style.display = "none";
    }

    // Handle Bandcamp URL submission
    if (submitButton) {
        submitButton.addEventListener("click", function () {
            let inputUrl = urlInput.value.trim();
            if (inputUrl) {
                localStorage.setItem("bandcampUrl", inputUrl);
                urlInputContainer.style.display = "none";
                updateButtons(); // Update buttons after setting the URL
            } else {
                alert("Please enter a valid Bandcamp URL.");
            }
        });
    }

    // Ensure redeem buttons check the stored URL before allowing redemption
    document.querySelectorAll(".redeem-button").forEach(button => {
        button.addEventListener("click", function () {
            let storedUrl = localStorage.getItem("bandcampUrl");
            if (!storedUrl) {
                alert("Please refresh the page and enter your Bandcamp URL.");
                return;
            }
            redeemCode(this.dataset.release);
        });
    });

    // Load redemption status if Bandcamp URL is available
    if (bandcampUrl) {
        updateButtons();
    }
});

async function fetchCodeFromSheet(release) {
    let response = await fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?release=' + encodeURIComponent(release));
    let data = await response.json();
    console.log("Fetched data:", data);
    return data.code || null;
}

async function logRedemption(userUrl, release) {
    let response = await fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bandcampUrl: userUrl, release: release })
    });

    let result = await response.json();
    console.log("Redemption logged:", result);
}
// Function to get Bandcamp URL from the input field
function getUserBandcampUrl() {
    return localStorage.setItem("bandcampUrl") || "";
}

// Validate Bandcamp URL format
function isValidBandcampUrl(url) {
    return url.startsWith("https://bandcamp.com/") || url.includes(".bandcamp.com");
}

// Handle user input from index.html form
document.addEventListener("DOMContentLoaded", function () {
    const urlInput = document.getElementById("bandcamp-url-input");
    const submitButton = document.getElementById("bandcamp-url-submit");

    if (urlInput && submitButton) {
        submitButton.addEventListener("click", function () {
            const userUrl = urlInput.value.trim();
            if (isValidBandcampUrl(userUrl)) {
                localStorage.setItem("bandcampUrl", userUrl);
                updateButtons();
            } else {
                alert("Invalid Bandcamp URL. Please enter a valid URL.");
            }
        });
    }

    updateButtons(); // Load redemptions if the user already entered a URL
});

// Function to handle Redeem Code button click
async function redeemCode(title, button) {
    const bandcampURL = getUserBandcampUrl();
    
    if (!bandcampURL) {
        alert("Please enter your Bandcamp URL first.");
        return;
    }

    button.disabled = true;
    button.textContent = "Processing...";

    fetch(WEB_APP_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: bandcampURL, album: title }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            autoSubmitCode(data.code); // Submit code to Bandcamp
            button.textContent = "In Collection";
            button.style.background = "#888";
        } else {
            button.textContent = data.message || "No codes left";
            button.style.background = "#888";
        }
    })
    .catch(error => {
        console.error("Error redeeming code:", error);
        button.textContent = "Error. Try Again";
        button.disabled = false;
    });
}

// Function to auto-submit the redeemed code to Bandcamp
function autoSubmitCode(code) {
    const form = document.createElement("form");
    form.setAttribute("action", "https://sevaskar.bandcamp.com/yum");
    form.setAttribute("method", "get");
    form.setAttribute("target", "_blank");

    const input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", "code");
    input.setAttribute("value", code);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
}
async function checkRedemptions(bandcampURL) {
  try {
    console.log("Checking redemptions for:", bandcampURL);
    
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?url=' +
      encodeURIComponent(bandcampURL)
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Raw response:", responseData);

    // Place this line here after parsing the response
    const redeemedTitles = responseData.redeemed || [];
    console.log("Processed redeemed titles:", redeemedTitles);

    document.querySelectorAll(".redeem-button").forEach(button => {
      const albumTitle = button.getAttribute("data-title");
      console.log(`Checking button for ${albumTitle}`);
      
      if (redeemedTitles.includes(albumTitle)) {
        console.log(`Hiding redeem button for ${albumTitle}`);
        button.textContent = "In Collection";
        button.style.background = "#888";
        button.disabled = true;
      }
    });
  } catch (error) {
    console.error("Error checking redemptions:", error);
  }
}

// Update buttons based on redemption history
async function updateButtons() {
    const userUrl = getUserBandcampUrl();
    if (!userUrl) return;

    try {
        const response = await fetch(`${WEB_APP_URL}?url=${encodeURIComponent(userUrl)}`);
        const result = await response.json();

        if (result.success) {
            const redeemedTitles = result.redeemed || [];

            document.querySelectorAll(".redeem-button").forEach((button) => {
                if (redeemedTitles.includes(button.dataset.title)) {
                    button.textContent = "In Collection";
                    button.style.background = "#888";
                    button.disabled = true;
                }
            });
        }
    } catch (error) {
        console.error("Error fetching redemption history:", error);
    }
}
