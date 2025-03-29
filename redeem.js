document.addEventListener("DOMContentLoaded", function () {
    const bandcampURL = localStorage.getItem("bandcampURL");

    if (!bandcampURL) {
        alert("Please enter your Bandcamp URL first.");
        return;
    }

    checkRedemptions(bandcampURL);

    document.querySelectorAll(".redeem-btn").forEach(button => {
        button.addEventListener("click", function () {
            const album = this.getAttribute("data-album");
            redeemCode(bandcampURL, album, this);
        });
    });
});

function checkRedemptions(bandcampURL) {
    fetch("https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?action=check&url=" + encodeURIComponent(bandcampURL))
        .then(response => response.json())
        .then(data => {
            document.querySelectorAll(".redeem-btn").forEach(button => {
                const album = button.getAttribute("data-album");
                if (data.redeemed.includes(album)) {
                    button.textContent = "In Collection";
                    button.disabled = true;
                    button.style.backgroundColor = "gray";
                }
            });
        })
        .catch(error => console.error("Error checking redemptions:", error));
}

function redeemCode(bandcampURL, album, button) {
    button.textContent = "Processing...";
    button.disabled = true;

    fetch("https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?action=redeem&url=" + encodeURIComponent(bandcampURL) + "&album=" + encodeURIComponent(album))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                button.textContent = "In Collection";
                button.style.backgroundColor = "gray";
            } else {
                button.textContent = "Redeem Code";
                button.disabled = false;
                alert("Redemption failed: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error redeeming code:", error);
            button.textContent = "Redeem Code";
            button.disabled = false;
            alert("An error occurred. Please try again.");
        });
}
