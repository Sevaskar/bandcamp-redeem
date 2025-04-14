let userBandcampURL = localStorage.getItem('bandcampURL');
let pendingAction = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.redeem-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const title = button.getAttribute('data-title');

      if (!userBandcampURL) {
        pendingAction = title;
        document.getElementById('bandcamp-prompt').style.display = 'flex';
      } else {
        handleRedemption(title, userBandcampURL);
      }
    });
  });
});

function submitBandcampURL() {
  const urlInput = document.getElementById('bandcamp-url');
  const url = urlInput.value.trim();

  if (!url || !url.startsWith("https://bandcamp.com/")) {
    alert("Please enter a valid Bandcamp URL.");
    return;
  }

  userBandcampURL = url;
  localStorage.setItem('bandcampURL', userBandcampURL);
  document.getElementById('bandcamp-prompt').style.display = 'none';

  if (pendingAction) {
    handleRedemption(pendingAction, userBandcampURL);
    pendingAction = null;
  }
}

function handleRedemption(title, url) {
  const popup = document.getElementById('popup-container');
  popup.innerHTML = `<div class="popup">Checking status for <b>${title}</b>...</div>`;

  fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?url=' + encodeURIComponent(url))
    .then(res => res.json())
    .then(userData => {
      if (userData.redeemedTitles && userData.redeemedTitles.includes(title)) {
        popup.innerHTML = `<div class="popup">${title} is already in your collection.</div>`;
        updateButtonState(title, "In Collection", true);
      } else {
        fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?title=' + encodeURIComponent(title))
          .then(res => res.json())
          .then(codeData => {
            if (!codeData.code) {
              popup.innerHTML = `<div class="popup">No available codes for ${title}.</div>`;
              updateButtonState(title, "No Available Codes", true);
            } else {
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = 'https://bandcamp.com/yum';
              form.target = '_blank';

              const inputCode = document.createElement('input');
              inputCode.type = 'hidden';
              inputCode.name = 'code';
              inputCode.value = codeData.code;
              form.appendChild(inputCode);

              document.body.appendChild(form);
              form.submit();

              popup.innerHTML = `<div class="popup">${title} added to your collection with code ${codeData.code}.</div>`;
              updateButtonState(title, "In Collection", true);

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
      popup.innerHTML = `<div class="popup">Error checking redemption status.</div>`;
    });
}

function updateButtonState(title, text, disabled) {
  const buttons = document.querySelectorAll(`.redeem-button[data-title="${title}"]`);
  buttons.forEach(btn => {
    btn.innerText = text;
    btn.disabled = disabled;
  });
}let userBandcampURL = localStorage.getItem('bandcampURL');
let pendingAction = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.redeem-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const title = button.getAttribute('data-title');

      if (!userBandcampURL) {
        pendingAction = title;
        document.getElementById('bandcamp-prompt').style.display = 'flex';
      } else {
        handleRedemption(title, userBandcampURL);
      }
    });
  });
});

function submitBandcampURL() {
  const urlInput = document.getElementById('bandcamp-url');
  const url = urlInput.value.trim();

  if (!url || !url.startsWith("https://bandcamp.com/")) {
    alert("Please enter a valid Bandcamp URL.");
    return;
  }

  userBandcampURL = url;
  localStorage.setItem('bandcampURL', userBandcampURL);
  document.getElementById('bandcamp-prompt').style.display = 'none';

  if (pendingAction) {
    handleRedemption(pendingAction, userBandcampURL);
    pendingAction = null;
  }
}

function handleRedemption(title, url) {
  const popup = document.getElementById('popup-container');
  popup.innerHTML = `<div class="popup">Checking status for <b>${title}</b>...</div>`;

  fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?url=' + encodeURIComponent(url))
    .then(res => res.json())
    .then(userData => {
      if (userData.redeemedTitles && userData.redeemedTitles.includes(title)) {
        popup.innerHTML = `<div class="popup">${title} is already in your collection.</div>`;
        updateButtonState(title, "In Collection", true);
      } else {
        fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?title=' + encodeURIComponent(title))
          .then(res => res.json())
          .then(codeData => {
            if (!codeData.code) {
              popup.innerHTML = `<div class="popup">No available codes for ${title}.</div>`;
              updateButtonState(title, "No Available Codes", true);
            } else {
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = 'https://bandcamp.com/yum';
              form.target = '_blank';

              const inputCode = document.createElement('input');
              inputCode.type = 'hidden';
              inputCode.name = 'code';
              inputCode.value = codeData.code;
              form.appendChild(inputCode);

              document.body.appendChild(form);
              form.submit();

              popup.innerHTML = `<div class="popup">${title} added to your collection with code ${codeData.code}.</div>`;
              updateButtonState(title, "In Collection", true);

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
      popup.innerHTML = `<div class="popup">Error checking redemption status.</div>`;
    });
}

function updateButtonState(title, text, disabled) {
  const buttons = document.querySelectorAll(`.redeem-button[data-title="${title}"]`);
  buttons.forEach(btn => {
    btn.innerText = text;
    btn.disabled = disabled;
  });
}
