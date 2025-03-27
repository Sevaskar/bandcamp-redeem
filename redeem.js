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

            let response = await fetch("https://script.google.com/macros/s/AKfycbw1bW2fq5JnNz0RiH8-u3-_OQqZb8KBNSVipR9lfHLbhvh9ONgmOfmsrFFuj5YivflT/exec", {
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
