document.addEventListener("DOMContentLoaded", function () {
    const redeemButtons = document.querySelectorAll(".redeem-btn");

    redeemButtons.forEach(button => {
        button.addEventListener("click", async function (event) {
            event.preventDefault();

            let bandcampURL = prompt("Enter your Bandcamp URL:");
            if (!bandcampURL) {
                alert("Bandcamp URL is required!");
                return;
            }

            let response = await fetch("https://script.google.com/macros/s/AKfycbz_UhnHUo4atYBVxwOU8kRVb3LC-1BX-UqWOyT25Qw/dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bandcampURL: bandcampURL })
            });

            let result = await response.json();
            if (result.status === "success") {
                alert("Your redemption code: " + result.code);
            } else {
                alert("Error: " + result.message);
            }
        });
    });
});
