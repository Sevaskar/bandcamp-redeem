const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec";

// Function to prompt for Bandcamp URL and prevent bypassing
function showCustomPrompt() {
    return new Promise((resolve) => {
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.background = "rgba(0, 0, 0, 0.8)";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.zIndex = "1000";

        const box = document.createElement("div");
        box.style.background = "#222";
        box.style.padding = "20px";
        box.style.borderRadius = "10px";
        box.style.textAlign = "center";
        box.style.color = "white";

        const message = document.createElement("p");
        message.textContent = "Please enter your Bandcamp URL:";
        box.appendChild(message);

        const input = document.createElement("input");
        input.style.width = "90%";
        input.style.padding = "10px";
        input.style.marginBottom = "10px";
        input.style.borderRadius = "5px";
        input.style.border = "none";
        input.style.textAlign = "center";
        box.appendChild(input);

        const button = document.createElement("button");
        button.textContent = "Submit";
        button.style.padding = "10px 20px";
        button.style.background = "red";
        button.style.color = "white";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";
        box.appendChild(button);

        modal.appendChild(box);
        document.body.appendChild(modal);

        button.addEventListener("click", () => {
            const url = input.value.trim();
            if (url.startsWith("https://bandcamp.com/") || url.includes(".bandcamp.com")) {
                sessionStorage.setItem("bandcampUrl", url);
                document.body.removeChild(modal);
                resolve(url);
            } else {
                alert("Invalid URL. Try again.");
            }
        });
}

async function getUserBandcampUrl() {
    let userUrl = sessionStorage.getItem("bandcampUrl");
    if (!userUrl) {
        userUrl = await showCustomPrompt();
    }
    return userUrl;
}

// Validate the Bandcamp URL format
function isValidBandcampURL(url) {
    return url.startsWith("https://bandcamp.com/");
}

// Function to handle Redeem Code button click
async function redeemCode(title, button) {
    const userUrl = await getUserBandcampUrl();
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
