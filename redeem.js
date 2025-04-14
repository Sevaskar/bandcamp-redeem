document.querySelectorAll(".redeem-code-button").forEach(button => {
  button.addEventListener("click", async function () {
    const title = this.getAttribute("data-title");
    const bandcampUrl = prompt("Enter your Bandcamp URL:");

    if (!bandcampUrl) return;

    // Call API to get titles + redemption status
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec', {
        method: 'POST',
        body: JSON.stringify({
          action: "getUserRedemptionStatus",
          bandcampUrl: bandcampUrl
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!data || !data.titles) {
        alert("Redemption failed. Please try again.");
        return;
      }

      // Build dynamic popup
      const popup = document.createElement("div");
      popup.classList.add("popup");

      const list = document.createElement("ul");

      data.titles.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.title} - ${item.status}`;

        if (item.status === "Add To Collection") {
          const btn = document.createElement("button");
          btn.textContent = "Add";
          btn.addEventListener("click", async () => {
            const redeemResponse = await fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec', {
              method: 'POST',
              body: JSON.stringify({
                action: "redeemCode",
                bandcampUrl: bandcampUrl,
                title: item.title
              }),
              headers: {
                "Content-Type": "application/json"
              }
            });

            const result = await redeemResponse.json();

            if (result.success && result.code) {
              const form = document.createElement("form");
              form.classList.add("download-code-form");
              form.action = "https://sevaskar.bandcamp.com/yum";
              form.method = "get";
              form.target = "_blank";

              const input = document.createElement("input");
              input.name = "code";
              input.type = "text";
              input.value = result.code;
              form.appendChild(input);

              document.body.appendChild(form);
              form.submit();

              // Cleanup & refresh UI
              popup.remove();
              alert("Code redeemed! Refreshing list...");
              window.location.reload();
            } else {
              alert("Redemption failed. Please try again.");
            }
          });
          li.appendChild(btn);
        }

        list.appendChild(li);
      });

      popup.appendChild(list);
      document.body.appendChild(popup);

    } catch (err) {
      console.error(err);
      alert("Redemption failed. Please try again.");
    }
  });
});
