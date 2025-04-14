const scriptUrl = 'https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec';

let userBandcampUrl = '';
let availableCodes = {};

document.getElementById('submitUrl').addEventListener('click', () => {
  const urlInput = document.getElementById('bandcampUrl').value.trim();
  if (!urlInput.startsWith('https://bandcamp.com/')) {
    alert('Please enter a valid Bandcamp profile URL.');
    return;
  }

  userBandcampUrl = urlInput;
  document.getElementById('bandcampPrompt').style.display = 'none';
  fetchTitlesAndStatus();
});

async function fetchTitlesAndStatus() {
  try {
    const res = await fetch(`${scriptUrl}?action=getTitles&bandcampUrl=${encodeURIComponent(userBandcampUrl)}`);
    const data = await res.json();
    if (!data || !data.titles) throw new Error("Invalid response");

    availableCodes = data.availableCodes || {};
    renderTitles(data.titles, data.redeemedTitles);
  } catch (err) {
    console.error('Error fetching titles:', err);
    alert('Failed to load titles. Please try again.');
  }
}

function renderTitles(allTitles, redeemedTitles) {
  const container = document.getElementById('titles');
  container.innerHTML = '';

  allTitles.forEach(title => {
    const titleDiv = document.createElement('div');
    titleDiv.className = 'title-entry';

    const status = redeemedTitles.includes(title)
      ? 'Already In Collection'
      : !availableCodes[title] || availableCodes[title].length === 0
        ? 'No Available Codes'
        : 'Add To Collection';

    const button = document.createElement('button');
    button.textContent = status;
    button.disabled = (status !== 'Add To Collection');
    button.dataset.title = title;
    button.addEventListener('click', handleRedeem);

    titleDiv.innerHTML = `<strong>${title}</strong> `;
    titleDiv.appendChild(button);
    container.appendChild(titleDiv);
  });

  document.getElementById('titleContainer').style.display = 'block';
}

async function handleRedeem(event) {
  const title = event.target.dataset.title;
  const confirmRedeem = confirm(`Redeem code for "${title}"?`);
  if (!confirmRedeem) return;

  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'redeemCode',
        bandcampUrl: userBandcampUrl,
        title: title
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    if (data.success) {
      alert(`Success! Your code for "${title}" is: ${data.code}`);
      event.target.textContent = 'In Collection';
      event.target.disabled = true;
    } else {
      alert(`Failed: ${data.message || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('Redemption error:', err);
    alert('Failed to redeem code. Please try again.');
  }
}
