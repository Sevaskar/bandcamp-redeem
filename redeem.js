const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec";

// Function to prompt for Bandcamp URL and prevent bypassing
function getBandcampURL() {
    let userUrl = sessionStorage.getItem("bandcampUrl");

    while (!userUrl || !isValidBandcampURL(userUrl)) {
        userUrl = prompt("Enter your Bandcamp URL (e.g., https://bandcamp.com/yourname):");
        if (!userUrl) {
            alert("You must enter a valid Bandcamp URL to continue.");
            location.reload(); // Prevent access if no URL is entered
            return null;
        }
    }

    sessionStorage.setItem("bandcampUrl", userUrl);
    return userUrl;
}

// Validate the Bandcamp URL format
function isValidBandcampURL(url) {
    return url.startsWith("https://bandcamp.com/");
}

// Function to handle Redeem Code button click
async function redeemCode(title, button) {
    const userUrl = getBandcampURL();
    if (!userUrl) return;

    button.disabled = true;
    button.textContent = "Processing...";

    try {
        const response = await fetch(`${WEB_APP_URL}?userUrl=${encodeURIComponent(userUrl)}&title=${encodeURIComponent(title)}`);
        const result = await response.json();

        if (result.success && result.code) {
            autoSubmitCode(result.code);
            button.textContent = "In Collection";
            button.style.background = "#888";
        } else {
            button.textContent = result.message || "No Codes Available";
            button.style.background = "#888";
        }
    } catch (error) {
        console.error("Error:", error);
        button.textContent = "Error. Try Again";
        button.disabled = false;
    }
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

// Check previous redemptions and update buttons
async function updateButtons() {
    const userUrl = getBandcampURL();
    if (!userUrl) return;

    const buttons = document.querySelectorAll(".redeem-button");

    for (let button of buttons) {
        const title = button.dataset.title;
        
        try {
            const response = await fetch(`${WEB_APP_URL}?userUrl=${encodeURIComponent(userUrl)}&title=${encodeURIComponent(title)}`);
            const result = await response.json();

            if (!result.success && result.message === "Already Redeemed") {
                button.textContent = "In Collection";
                button.style.background = "#888";
                button.disabled = true;
            }
        } catch (error) {
            console.error("Error checking redemptions:", error);
        }
    }
}

// Run on page load
document.addEventListener("DOMContentLoaded", updateButtons);
