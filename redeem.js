document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('bandcampUrl');
  const submitBtn = document.getElementById('submitBtn');

  // Listen for button click
  submitBtn.addEventListener('click', handleSubmit);

  // Also listen for Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  });

  function handleSubmit() {
    const userUrl = input.value.trim();
    if (!userUrl) return;

    google.script.run
      .withSuccessHandler(displayTitles)
      .getAvailableTitles(userUrl);
  }

  function displayTitles(titles) {
    const container = document.getElementById('titlesContainer');
    container.innerHTML = '';

    for (const [title, info] of Object.entries(titles)) {
      const div = document.createElement('div');
      div.innerHTML = `
        <p><strong>${title}</strong> - ${info.status}</p>
        ${info.status === 'Add To Collection' ? `<button class="redeemBtn" data-title="${title}">Redeem Code</button>` : ''}
      `;
      container.appendChild(div);
    }

    document.querySelectorAll('.redeemBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.target.dataset.title;
        const userUrl = input.value.trim();

        fetch('', {
          method: 'POST',
          body: JSON.stringify({ userUrl, title }),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            window.location.href = `https://bandcamp.com/yum?code=${data.code}`;
          } else {
            alert(data.message);
          }
        });
      });
    });
  }
});
