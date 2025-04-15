let userBandcampURL = localStorage.getItem('bandcampURL');
let pendingTitle = null;

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.redeem-button');

  buttons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      const title = button.getAttribute('data-title');

      if (!userBandcampURL) {
        pendingTitle = title;
        showBandcampPrompt();
      } else {
        handleRedemption(title, userBandcampURL);
      }
    });
  });

  const bandcampInput = document.getElementById('bandcamp-url');
  if (bandcampInput) {
    bandcampInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitBandcampURL();
      }
    });
  }
});

function showBandcampPrompt() {
  const overlay = document.getElementById('overlay');
  const prompt = document.getElementById('bandcamp-prompt');

  if (overlay && prompt) {
    overlay.style.display = 'block';
    prompt.style.display = 'block';
  }
}

function hideBandcampPrompt() {
  const overlay = document.getElementById('overlay');
  const prompt = document.getElementById('bandcamp-prompt');

  if (overlay && prompt) {
    overlay.style.display = 'none';
    prompt.style.display = 'none';
  }
}

function submitBandcampURL() {
  const urlInput = document.getElementById('bandcamp-url');
  if (!urlInput) return;

  const url = urlInput.value.trim();
  if (!url.startsWith('https://bandcamp.com/')) {
    alert('Please enter a valid Bandcamp URL starting with https://bandcamp.com/');
    return;
  }

  localStorage.setItem('bandcampURL', url);
  userBandcampURL = url;
  hideBandcampPrompt();

  if (pendingTitle) {
    handleRedemption(pendingTitle, userBandcampURL);
    pendingTitle = null;
  }
}

function handleRedemption(title, url) {
  const popup = document.getElementById('popup-container');
  if (!popup) return;

  popup.innerHTML = `<div class="popup">Checking ${title}...</div>`;

  fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?url=' + encodeURIComponent(url))
    .then(res => res.json())
    .then(data => {
      if (data.redeemedTitles && data.redeemedTitles.includes(title)) {
        popup.innerHTML = `<div class="popup">${title} is already in your collection.</div>`;
        updateButton(title, "In Collection", true);
      } else {
        fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?title=' + encodeURIComponent(title))
          .then(res => res.json())
          .then(codeData => {
            if (!codeData.code) {
              popup.innerHTML = `<div class="popup">No codes left for ${title}.</div>`;
              updateButton(title, "No Codes", true);
            } else {
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = 'https://bandcamp.com/yum';
              form.target = '_blank';

              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'code';
              input.value = codeData.code;
              form.appendChild(input);
              document.body.appendChild(form);
              form.submit();

              popup.innerHTML = `<div class="popup">Code redeemed for ${title}!</div>`;
              updateButton(title, "In Collection", true);

              fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title, url: url })
              });
            }
          });
      }
    })
    .catch(() => {
      popup.innerHTML = `<div class="popup">Error checking ${title}. Try again.</div>`;
    });
}

function updateButton(title, text, disabled) {
  const btns = document.querySelectorAll(`.redeem-button[data-title="${title}"]`);
  btns.forEach(btn => {
    btn.innerText = text;
    btn.disabled = disabled;
  });
}
