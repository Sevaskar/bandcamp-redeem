document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("redeem-button").addEventListener("click", function () {
        let userUrl = document.getElementById("bandcamp-url").value;
        if (!userUrl) {
            alert("Please enter your Bandcamp URL.");
            return;
        }

        fetch("https://script.google.com/macros/s/AKfycbz_UhnHUo4atYBVxwOU8kRVb3LC-1BX-UqWOyT25Qw/devL", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userUrl: userUrl })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.open(`https://sevaskar.bandcamp.com/yum?code=${data.code}`, "_blank");
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error("Error:", error));
    });
});
