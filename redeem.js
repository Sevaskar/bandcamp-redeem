const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec";

// Function to get Bandcamp URL from the input field
function getUserBandcampUrl() {
    return sessionStorage.getItem("bandcampUrl") || "";
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
                sessionStorage.setItem("bandcampUrl", userUrl);
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
    const userUrl = getUserBandcampUrl();
    if (!userUrl) {
        alert("Please enter your Bandcamp URL first.");
        return;
    }

    button.disabled = true;
    button.textContent = "Processing...";

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ userUrl, title }),
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();

        if (result.success) {
            autoSubmitCode(result.code);
            button.textContent = "In Collection";
            button.style.background = "#888";
        } else {
            button.textContent = result.message || "No codes left";
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
