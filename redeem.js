alert("redeem.js is running!");

document.addEventListener("DOMContentLoaded", function () {
    let bandcampURL = localStorage.getItem("bandcampURL");

    while (!bandcampURL) {
        bandcampURL = prompt("Please enter your Bandcamp URL:");
        if (bandcampURL) {
            localStorage.setItem("bandcampURL", bandcampURL);
        } else {
            alert("You need to enter your Bandcamp URL to continue.");
        }
    }

    checkRedemptions(bandcampURL);

    document.querySelectorAll(".redeem-btn").forEach(button => {
        button.addEventListener("click", function () {
            const album = this.getAttribute("data-album");
            redeemCode(bandcampURL, album, this);
        });
    });
});

function redeemCode(bandcampURL, album, button) {
    fetch("https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url: bandcampURL,
            album: album
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.code) {
            let code = data.code;

            // Auto-submit form with the retrieved code
            let form = document.createElement("form");
            form.setAttribute("action", "https://sevaskar.bandcamp.com/yum");
            form.setAttribute("method", "get");
            form.setAttribute("target", "_blank");

            let input = document.createElement("input");
            input.setAttribute("type", "hidden");
            input.setAttribute("name", "code");
            input.setAttribute("value", code);

            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();

            button.disabled = true;
            button.textContent = "In Collection";
        } else {
            alert(data.message || "No available codes or already redeemed.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Something went wrong. Try again.");
    });
}

function checkRedemptions(bandcampURL) {
    fetch("https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?url=" + encodeURIComponent(bandcampURL))
    .then(response => response.json())
    .then(data => {
        if (data.redeemed) {
            document.querySelectorAll(".redeem-btn").forEach(button => {
                const album = button.getAttribute("data-album");
                if (data.redeemed.includes(album)) {
                    button.disabled = true;
                    button.textContent = "In Collection";
                }
            });
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}
