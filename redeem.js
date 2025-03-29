document.addEventListener("DOMContentLoaded", function () {
    let bandcampURL = localStorage.getItem("bandcampURL");

    if (!bandcampURL) {
        bandcampURL = prompt("Please enter your Bandcamp URL:");

        if (!bandcampURL) {
            alert("You need to enter your Bandcamp URL to continue.");
            return;
        }

        localStorage.setItem("bandcampURL", bandcampURL);
    }

    checkRedemptions(bandcampURL);

    document.querySelectorAll(".redeem-btn").forEach(button => {
        button.addEventListener("click", function () {
            const album = this.getAttribute("data-album");
            redeemCode(bandcampURL, album, this);
        });
    });
});
