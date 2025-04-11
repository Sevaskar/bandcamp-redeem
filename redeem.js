let userBandcampURL = "";
let currentReleaseTitle = null;

function redeemCode(button) {
  currentReleaseTitle = button.dataset.title;
  if (!userBandcampURL) {
    document.getElementById('bandcampOverlay').style.display = 'flex';
  } else {
    checkRedemption(currentReleaseTitle, button);
  }
}

function submitBandcampURL() {
  const url = document.getElementById('bandcampUrl').value.trim();
  if (url && url.includes('bandcamp.com')) {
    userBandcampURL = url;
    document.getElementById('bandcampOverlay').style.display = 'none';

    // Re-attempt redeem
    const buttons = document.querySelectorAll(`.redeem-button[data-title="${currentReleaseTitle}"]`);
    if (buttons.length) checkRedemption(currentReleaseTitle, buttons[0]);
  } else {
    alert('Please enter a valid Bandcamp URL.');
  }
}

function checkRedemption(title, button) {
  fetch(`https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?url=${encodeURIComponent(userBandcampURL)}&title=${encodeURIComponent(title)}`)
    .then(res => res.json())
    .then(data => {
      if (data.redeemed) {
        button.textContent = "In Collection";
        button.disabled = true;
      } else if (data.code) {
        const form = document.getElementById("hidden-redeem-form");
        form.querySelector("input[name=code]").value = data.code;
        form.submit();
      } else {
        alert("No codes available right now.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error processing request.");
    });
}
