const scriptURL = "https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec";

let userURL = "";

// Show Bandcamp URL prompt when redeem button is clicked
document.querySelectorAll(".redeem-button").forEach(button => {
    button.addEventListener("click", () => {
        userURL = prompt("Enter your Bandcamp profile URL:");
        if (!userURL) return;

        fetch(`${scriptURL}?action=getRedemptionStatus&bandcampURL=${encodeURIComponent(userURL)}`)
            .then(res => res.json())
            .then(data => {
                const container = document.createElement("div");
                container.className = "popup";
                let html = "<h2>Select a title to redeem:</h2><ul>";

                data.forEach(item => {
                    const { title, status } = item;
                    let statusText = "";
                    let button = "";

                    if (status === "Already In Collection") {
                        statusText = "<span style='color:green;'>Already in Collection</span>";
                    } else if (status === "No Available Codes") {
                        statusText = "<span style='color:red;'>No Available Codes</span>";
                    } else if (status === "Available") {
                        button = `<button class='add-button' data-title="${title}">Add to Collection</button>`;
                    }

                    html += `<li><strong>${title}</strong>: ${statusText || button}</li>`;
                });

                html += "</ul><button onclick='document.body.removeChild(this.parentElement)'>Close</button>";
                container.innerHTML = html;
                document.body.appendChild(container);

                // Attach listeners to "Add to Collection" buttons
                document.querySelectorAll(".add-button").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const title = btn.getAttribute("data-title");
                        redeemCode(title, userURL);
                        btn.disabled = true;
                        btn.textContent = "Processing...";
                    });
                });
            })
            .catch(err => {
                alert("Failed to load titles. Try again later.");
                console.error(err);
            });
    });
});

// Function to redeem code
function redeemCode(title, bandcampURL) {
    fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify({ action: "redeemCode", title, bandcampURL }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(response => {
        if (response.success && response.code) {
            // Auto-submit Bandcamp redemption form
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "https://bandcamp.com/yum";
            form.target = "_blank";

            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "code";
            input.value = response.code;

            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();

            alert(`Code Redeemed: ${response.code}`);
        } else {
            alert("Redemption failed: " + (response.message || "Unknown error."));
        }
    })
    .catch(error => {
        console.error("Redemption error:", error);
        alert("Error redeeming code.");
    });
}
