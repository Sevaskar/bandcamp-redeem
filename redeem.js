<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">                                                                                    
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sevaskar</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: black;
      color: red;
      text-align: center;
      margin: 0;
      padding: 0;
    }
    .banner {
      background: url('https://f4.bcbits.com/img/0037956683_100.png') no-repeat center center;
      background-size: contain;
      width: 100%;
      height: 200px;
      margin-bottom: 20px;
    }
    .player-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      padding: 20px;
    }
    .player-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 350px;
      background-color: #333;
      padding: 10px;
      border-radius: 10px;
      text-align: center;
    }
    .redeem-button {
      margin-top: 10px;
      background-color: red;
      color: white;
      border: none;
      padding: 10px 20px;
      cursor: pointer;
      border-radius: 5px;
      font-size: 16px;
    }
    .footer {
      margin-top: 30px;
      padding: 20px;
      background-color: #222;
      color: white;
    }
    .prompt-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .prompt-box {
      background: #222;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      color: white;
    }
    .prompt-box input {
      padding: 10px;
      width: 80%;
      margin-bottom: 10px;
    }
    .prompt-box button {
      padding: 10px 20px;
      background-color: red;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .prompt-box button:hover {
      background-color: darkred;
    }
  </style>
</head>
<body>

<div class="banner"></div>

<div class="player-container">
  <div class="player-box">
    <iframe src="https://bandcamp.com/EmbeddedPlayer/album=2458287885/size=large/bgcol=333333/linkcol=0f91ff/tracklist=false/transparent=true/" style="border:0;width:350px;height:470px;"></iframe>
    <button class="redeem-button" data-title="Pandemonium" onclick="redeemCode(this)">Redeem Code</button>
  </div>
  <!-- Add more albums here similarly -->
</div>

<div class="prompt-overlay" id="bandcampOverlay">
  <div class="prompt-box">
    <p>Please enter your Bandcamp URL:</p>
    <input type="text" id="bandcampUrl" placeholder="https://yourname.bandcamp.com">
    <br>
    <button onclick="submitBandcampURL()">Submit</button>
  </div>
</div>

<form id="hidden-redeem-form" action="https://sevaskar.bandcamp.com/yum" method="get" target="_blank" style="display: none;">
  <input name="code" type="text" />
  <input type="submit" />
</form>

<div class="footer">
  <a href="https://PayPal.me/sevaskar" target="_blank">
    <img src="https://raw.githubusercontent.com/Sevaskar/bandcamp-redeem/refs/heads/main/Screenshot_2025-03-25-10-57-59-353.jpg" alt="Support on PayPal" style="max-width: 150px;">
  </a><br>
  &copy; 2025 Sevaskar. All rights reserved.
</div>

<script>
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
</script>

</body>
</html>
