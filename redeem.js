const scriptURL = 'https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec';

let selectedTitle = null;
let bandcampURL = null;

document.querySelectorAll('.redeem-button').forEach(button => {
  button.addEventListener('click', () => {
    selectedTitle = button.getAttribute('data-title');
    if (!bandcampURL) {
      document.getElementById('bandcamp-prompt').style.display = 'flex';
      document.getElementById('overlay').style.display = 'block';
    } else {
      checkRedemptionStatus();
    }
  });
});

function submitBandcampURL() {
  const input = document.getElementById('bandcamp-url');
  const url = input.value.trim();

  if (!url.startsWith('https://bandcamp.com/')) {
    alert('Please enter a valid Bandcamp URL.');
    return;
  }

  bandcampURL = url;

  // Close the prompt
  document.getElementById('bandcamp-prompt').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';

  checkRedemptionStatus();
}

function checkRedemptionStatus() {
  if (!bandcampURL || !selectedTitle) return;

  fetch(`${scriptURL}?bandcamp=${encodeURIComponent(bandcampURL)}&title=${encodeURIComponent(selectedTitle)}`)
    .then(res => res.json())
    .then(data => {
      const button = document.querySelector(`.redeem-button[data-title="${selectedTitle}"]`);

      if (data.status === 'Already In Collection') {
        button.innerText = 'In Collection';
        button.disabled = true;
        button.classList.add('redeemed');
      } else if (data.status === 'No Available Codes') {
        button.innerText = 'No Codes';
        button.disabled = true;
        button.classList.add('redeemed');
      } else if (data.status === 'Success' && data.code) {
        redeemCode(data.code);
        button.innerText = 'Redeemed!';
        button.disabled = true;
        button.classList.add('redeemed');
      } else {
        button.innerText = 'Error';
        button.disabled = true;
        button.classList.add('redeemed');
      }
    })
    .catch(err => {
      console.error('Error checking redemption status:', err);
      alert('Something went wrong. Try again later.');
    });
}

function redeemCode(code) {
  const form = document.getElementById('hidden-redeem-form');
  form.querySelector('input[name="code"]').value = code;
  form.submit();
}
