let userBandcampUrl = null;
const apiUrl = "https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec";

document.addEventListener("DOMContentLoaded", () => {
  const redeemButtons = document.querySelectorAll(".redeem-btn");
  const urlPrompt = document.getElementById("urlPrompt");
  const urlSubmitBtn = document.getElementById("urlSubmitBtn");
  const bandcampUrlInput = document.getElementById("bandcampUrl");

  redeemButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (!userBandcampUrl) {
        urlPrompt.style.display = "block";
        urlPrompt.dataset.pendingTitle = btn.dataset.title;
      } else {
        handleRedemption(btn.dataset.title, btn);
      }
    });
  });

  urlSubmitBtn.addEventListener("click", () => {
    const inputUrl = bandcampUrlInput.value.trim();
    if (!inputUrl || !inputUrl.startsWith("https://")) {
      alert("Please enter a valid Bandcamp URL.");
      return;
    }

    userBandcampUrl = inputUrl;
    urlPrompt.style.display = "none";

    const pendingTitle = urlPrompt.dataset.pendingTitle;
    if (pendingTitle) {
      const pendingButton = [...document.querySelectorAll(".redeem-btn")].find(
        btn => btn.dataset.title === pendingTitle
      );
      if (pendingButton) {
        handleRedemption(pendingTitle, pendingButton);
      }
    }
  });
});

function handleRedemption(title, button) {
  fetch(`${apiUrl}?action=check&bandcampUrl=${encodeURIComponent(userBandcampUrl)}&title=${encodeURIComponent(title)}`)
    .then(res => res.json())
    .then(data => {
      if (data.alreadyRedeemed) {
        button.textContent = "In Collection";
        button.disabled = true;
      } else {
        fetch(`${apiUrl}?action=redeem&bandcampUrl=${encodeURIComponent(userBandcampUrl)}&title=${encodeURIComponent(title)}`)
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              window.open(`https://bandcamp.com/yum?code=${result.code}`, "_blank");
              button.textContent = "Redeemed";
              button.disabled = true;
            } else {
              alert("No codes available or an error occurred.");
            }
          });
      }
    })
    .catch(() => {
      alert("There was an error connecting to the server.");
    });
}
