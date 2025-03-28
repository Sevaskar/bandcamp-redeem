document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".redeem-btn").forEach(button => {
    button.addEventListener("click", async function () {
      let bandcampURL = prompt("Enter your Bandcamp URL:");
      if (!bandcampURL) {
        alert("Bandcamp URL is required.");
        return;
      }

      let album = this.getAttribute("data-album");

      try {
        let response = await fetch("https://script.google.com/macros/s/AKfycbwKsU3UpcpsTJfGgDyvROt7xMHZLNRlBylJQVcphbdIlIXXbgSuOQDhjCAguz9PEXPh/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bandcampURL: bandcampURL, album: album })
        });

        let result = await response.json();
        if (result.status === "success") {
          alert(`Code Redeemed: ${result.code}`);
          window.open(`https://sevaskar.bandcamp.com/yum?code=${result.code}`, "_blank");
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error("Request failed:", error);
        alert("Something went wrong. Try again.");
      }
    });
  });
});

      }
    });
  });
});
