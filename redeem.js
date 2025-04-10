const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec";

document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("bandcamp-url-input");
    const submitButton = document.getElementById("bandcamp-url-submit");
    const storedUrl = localStorage.getItem("bandcampUrl");

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

    if (storedUrl) {
        updateButtons();
    }

    document.querySelectorAll(".redeem-button").forEach(button => {
        button.addEventListener("click", async function () {
            const userUrl = localStorage.getItem("bandcampUrl");
            const release = this.dataset.release;

            if (!userUrl) {
                alert("Please enter your Bandcamp URL first.");
                return;
            }

            this.disabled = true;

            if (await checkIfRedeemed(userUrl, release)) {
                markButtonAsRedeemed(this, "Already In Collection");
                return;
            }

            const code = await fetchCodeFromSheet(release);
            if (!code) {
                markButtonAsRedeemed(this, "No Codes Left");
                return;
            }

            autoSubmitCode(code);
            const logSuccess = await logRedemption(userUrl, release);

            if (logSuccess) {
                markButtonAsRedeemed(this, "In Collection");
            } else {
                alert("Error logging redemption. Please try again.");
                this.textContent = "Redeem";
                this.disabled = false;
            }
        });
    });
});

// ========== Utility Functions ==========

function isValidBandcampUrl(url) {
    return url.startsWith("https://bandcamp.com/") || url.includes(".bandcamp.com");
}

async function checkIfRedeemed(userUrl, release) {
    try {
        const res = await fetch(`${WEB_APP_URL}?url=${encodeURIComponent(userUrl)}`);
        const data = await res.json();
        return data.redeemed && data.redeemed.includes(release);
    } catch (err) {
        console.error("Redemption check failed:", err);
        return false;
    }
}

async function fetchCodeFromSheet(release) {
    try {
        const res = await fetch(`${WEB_APP_URL}?release=${encodeURIComponent(release)}`);
        const data = await res.json();
        return data.code || null;
    } catch (err) {
        console.error("Code fetch failed:", err);
        return null;
    }
}

async function logRedemption(userUrl, release) {
    try {
        const res = await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bandcampUrl: userUrl, release }),
        });
        const data = await res.json();
        return data.success || true;
    } catch (err) {
        console.error("Redemption logging failed:", err);
        return false;
    }
}

function autoSubmitCode(code) {
    const form = document.createElement("form");
    form.action = "https://bandcamp.com/redeem";
    form.method = "POST";
    form.target = "_blank";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "code";
    input.value = code;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

function markButtonAsRedeemed(button, label) {
    button.textContent = label;
    button.disabled = true;
    button.style.backgroundColor = "gray";
}

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
                markButtonAsRedeemed(button, "Already In Collection");
            }
        });
    } catch (err) {
        console.error("Error updating button states:", err);
    }
}
