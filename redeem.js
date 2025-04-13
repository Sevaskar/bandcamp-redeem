let userBandcampURL = "";

function redeemCodePrompt() {
  // Triggered when any "Redeem Code" button is clicked
  document.getElementById('bandcampOverlay').style.display = 'flex';
}

function submitBandcampURL() {
  const url = document.getElementById('bandcampUrl').value.trim();
  if (url && url.includes('bandcamp.com')) {
    userBandcampURL = url;
    document.getElementById('bandcampOverlay').style.display = 'none';
    loadTitlesPopup();
  } else {
    alert('Please enter a valid Bandcamp URL.');
  }
}

function loadTitlesPopup() {
  fetch(`https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?url=${encodeURIComponent(userBandcampURL)}`)
    .then(res => res.json())
    .then(data => {
      showTitlesTable(data.titles); // Expecting an array of objects: [{ title: "Title A", status: "Already In Collection" | "Add To Collection" | "No Available Codes" }]
    })
    .catch(err => {
      console.error(err);
      alert("Error loading titles.");
    });
}

function showTitlesTable(titles) {
  const popup = document.getElementById('titlesPopup');
  const table = popup.querySelector('tbody');
  table.innerHTML = '';

  titles.forEach(entry => {
    const row = document.createElement('tr');

    const titleCell = document.createElement('td');
    titleCell.textContent = entry.title;

    const actionCell = document.createElement('td');
    if (entry.status === "Add To Collection") {
      const button = document.createElement('button');
      button.textContent = "Add To Collection";
      button.onclick = () => redeemCode(entry.title, button);
      actionCell.appendChild(button);
    } else {
      const span = document.createElement('span');
      span.textContent = entry.status;
      actionCell.appendChild(span);
    }

    row.appendChild(titleCell);
    row.appendChild(actionCell);
    table.appendChild(row);
  });

  popup.style.display = 'block';
}

function redeemCode(title, button) {
  fetch(`https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec?url=${encodeURIComponent(userBandcampURL)}&title=${encodeURIComponent(title)}`)
    .then(res => res.json())
    .then(data => {
      if (data.code) {
        // Update UI
        button.disabled = true;
        button.textContent = "In Collection";

        // Submit to Bandcamp form
        const form = document.getElementById("hidden-redeem-form");
        form.querySelector("input[name=code]").value = data.code;
        form.submit();
      } else {
        alert("Code unavailable or already redeemed.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error redeeming code.");
    });
}
