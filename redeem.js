const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec";

document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("bandcamp-url-input");
    const submitButton = document.getElementById("bandcamp-url-submit");

    // Handle Bandcamp URL submission
    if (urlInput && submitButton) {
        submitButton.addEventListener("click", () => {
            const userUrl = urlInput.value.trim();
            if (isValidBandcampUrl(userUrl)) {
                localStorage.setItem("bandcampUrl", userUrl);
                updateButtons();
            } else {
                alert("Invalid Bandcamp URL. Please enter a valid URL.");
            }
        });
    }

    // Check and update button states on page load
    const storedUrl = localStorage.getItem("bandcampUrl");
    if (storedUrl) {
        updateButtons();
    }

    // Add click listener to each redeem button
    document.querySelectorAll(".redeem-button").forEach(button => {
        button.addEventListener("click", async function () {
            const userUrl = localStorage.getItem("bandcampUrl");
            const release = this.dataset.release;

            if (!userUrl) {
                alert("Please enter your Bandcamp URL first.");
                return;
            }

            const redeemed = await checkIfRedeemed(userUrl, release);
            if (redeemed) {
                this.textContent = "Already In Collection";
                this.disabled = true;
                this.style.backgroundColor = "gray";
                return;
            }

            const code = await fetchCodeFromSheet(release);
            if (!code) {
                this.textContent = "No Codes Left";
                this.disabled = true;
                return;
            }

            autoSubmitCode(code); // Auto-submit to Bandcamp
            await logRedemption(userUrl, release); // Log to sheet
            this.textContent = "In Collection";
            this.disabled = true;
            this.style.backgroundColor = "gray";
        });
    });
});

// Utility: Validate Bandcamp URL
function isValidBandcampUrl(url) {
    return url.startsWith("https://bandcamp.com/") || url.includes(".bandcamp.com");
}

// Utility: Fetch redemption status
async function checkIfRedeemed(userUrl, release) {
    try {
        const res = await fetch(`${WEB_APP_URL}?url=${encodeURIComponent(userUrl)}`);
        const data = await res.json();
        return data.redeemed && data.redeemed.includes(release);
    } catch (err) {
        console.error("Redemption check error:", err);
        return false;
    }
}

// Utility: Fetch code
async function fetchCodeFromSheet(release) {
    try {
        const res = await fetch(`${WEB_APP_URL}?release=${encodeURIComponent(release)}`);
        const data = await res.json();
        return data.code || null;
    } catch (err) {
        console.error("Code fetch error:", err);
        return null;
    }
}

// Utility: Log redemption
async function logRedemption(userUrl, release) {
    try {
        const res = await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bandcampUrl: userUrl, release: release }),
        });
        const data = await res.json();
        console.log("Logged redemption:", data);
    } catch (err) {
        console.error("Log redemption error:", err);
    }
}

// Utility: Auto-submit code
function autoSubmitCode(code) {
    const form = document.createElement("form");
    form.action = "https://bandcamp.com/redeem";
    form.method = "POST";
    form.target = "_blank"; // Open in new tab

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "code";
    input.value = code;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

// Update button text if user already redeemed
async function updateButtons() {
    const userUrl = localStorage.getItem("bandcampUrl");
    if (!userUrl) return;

    try {
        const res = await fetch(`${WEB_APP_URL}?url=${encodeURIComponent(userUrl)}`);
        const data = await res.json();
        const redeemed = data.redeemed || [];

        document.querySelectorAll(".redeem-button").forEach(button => {
            const release = button.dataset.release;
            if (redeemed.includes(release)) {
                button.textContent = "Already In Collection";
                button.disabled = true;
                button.style.backgroundColor = "gray";
            }
        });
    } catch (err) {
        console.error("Error updating buttons:", err);
    }
}
