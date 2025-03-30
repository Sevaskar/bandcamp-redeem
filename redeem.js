const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec";

// Function to prompt for Bandcamp URL on first visit
function checkUserSession() {
    let userUrl = sessionStorage.getItem("bandcampUrl");
    if (!userUrl) {
        userUrl = prompt("Enter your Bandcamp URL (e.g., https://bandcamp.com/yourname):");
        if (userUrl) {
            sessionStorage.setItem("bandcampUrl", userUrl);
        } else {
            alert("You must enter a valid Bandcamp URL to proceed.");
            return false;
        }
    }
    return userUrl;
}

// Function to handle Redeem Code button click
async function redeemCode(title, button) {
    const userUrl = checkUserSession();
    if (!userUrl) return;

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
            button.textContent = result.message;
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

// Run on page load: Check previous redemptions and update buttons
async function updateButtons() {
    const userUrl = checkUserSession();
    if (!userUrl) return;

    const buttons = document.querySelectorAll(".redeem-button");

    for (let button of buttons) {
        const title = button.dataset.title;
        
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ userUrl, title }),
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();

        if (!result.success && result.message === "Already Redeemed") {
            button.textContent = "In Collection";
            button.style.background = "#888";
            button.disabled = true;
        }
    }
}
