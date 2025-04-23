document.addEventListener('DOMContentLoaded', function () {
  const submitBtn = document.getElementById('submit-url-btn');
  const urlInput = document.getElementById('bandcamp-url');
  const titlesContainer = document.getElementById('titles-container');

  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();

      const userUrl = urlInput.value.trim();
      if (!userUrl || !userUrl.startsWith('https://')) {
        alert('Please enter a valid Bandcamp URL.');
        return;
      }

      // Store the user's Bandcamp URL
      sessionStorage.setItem('bandcampUrl', userUrl);

      // Fetch available titles
      fetch(`https://script.google.com/macros/s/AKfycbwey6XSKId9EXJu8EG7PepDuetf1AQgVuBIpZyNTGTdLUIkaYOkm1S4xJvVeZVFxU6M/exec?bandcampUrl=${encodeURIComponent(userUrl)}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            titlesContainer.innerHTML = '';
            data.forEach(item => {
              const div = document.createElement('div');
              div.className = 'player-box';
              div.innerHTML = `
                <h3>${item.title}</h3>
                <p>Status: ${item.status}</p>
                ${item.status === 'Add To Collection' 
                  ? `<button class="redeem-btn" data-title="${item.title}">Add To Collection</button>` 
                  : `<button disabled>In Collection</button>`
                }
              `;
              titlesContainer.appendChild(div);
            });

            // Show the titles
            titlesContainer.style.display = 'flex';
            titlesContainer.style.flexWrap = 'wrap';
            titlesContainer.style.justifyContent = 'center';

            // Hide prompt
            document.querySelector('.prompt-box').style.display = 'none';

            // Add redeem click events
            document.querySelectorAll('.redeem-btn').forEach(btn => {
              btn.addEventListener('click', function () {
                const title = this.getAttribute('data-title');
                const bandcampUrl = sessionStorage.getItem('bandcampUrl');

                fetch('https://script.google.com/macros/s/AKfycbwey6XSKId9EXJu8EG7PepDuetf1AQgVuBIpZyNTGTdLUIkaYOkm1S4xJvVeZVFxU6M/exec', {
                  method: 'POST',
                  body: JSON.stringify({ title, bandcampUrl }),
                })
                  .then(res => res.json())
                  .then(response => {
                    if (response && response.code) {
                      window.location.href = `https://bandcamp.com/yum?code=${response.code}`;
                    } else {
                      alert('No available code or redemption failed.');
                    }
                  });
              });
            });

          } else {
            titlesContainer.innerHTML = '<p>No titles available.</p>';
            titlesContainer.style.display = 'block';
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('There was a problem fetching available titles.');
        });
    });
  }
});
