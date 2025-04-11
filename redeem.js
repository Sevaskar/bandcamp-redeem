async function redeemCode(releaseTitle, button) {
  let bandcampURL = localStorage.getItem("bandcampURL");

  if (!bandcampURL) {
    showBandcampPrompt(() => redeemCode(releaseTitle, button));
    return;
  }

  bandcampURL = bandcampURL.trim().replace(/\/+$/, "");

  // Fetch Redemptions
  const redemptionsRes = await fetch("https://opensheet.elk.sh/1OakaRoUNoq3dMqPY5PDRw-5ibG5rCz10TMlFD9kheVM/Redemptions");
  const redemptions = await redemptionsRes.json();

  const alreadyRedeemed = redemptions.some(entry =>
    entry["User"].trim().replace(/\/+$/, "") === bandcampURL &&
    entry["Title"].trim() === releaseTitle.trim()
  );

  if (alreadyRedeemed) {
    button.disabled = true;
    button.innerText = "In Collection";
    return;
  }

  // Fetch Codes
  const codesRes = await fetch("https://opensheet.elk.sh/1OakaRoUNoq3dMqPY5PDRw-5ibG5rCz10TMlFD9kheVM/Codes");
  const codes = await codesRes.json();

  const availableCode = codes.find(code =>
    code.Title === releaseTitle && (!code.Status || code.Status.toLowerCase() !== "redeemed")
  );

  if (!availableCode) {
    alert("No more codes available for this release.");
    return;
  }

  // Submit code to Bandcamp
  const form = document.createElement("form");
  form.action = "https://sevaskar.bandcamp.com/yum";
  form.method = "get";
  form.target = "_blank";

  const input = document.createElement("input");
  input.name = "code";
  input.type = "hidden";
  input.value = availableCode.Code;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();

  // Record redemption
  await fetch("https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec", {
    method: "POST",
    body: JSON.stringify({
      user: bandcampURL,
      title: releaseTitle,
      code: availableCode.Code
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  alert(`Code redeemed: ${availableCode.Code}`);
  button.disabled = true;
  button.innerText = "In Collection";
}

function showBandcampPrompt(callback) {
  if (document.getElementById("bandcamp-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "bandcamp-overlay";
  overlay.className = "prompt-overlay";
  overlay.innerHTML = `
    <div class="prompt-box">
      <p>Please enter your Bandcamp URL:</p>
      <input type="text" id="bandcamp-url" placeholder="https://bandcamp.com/username">
      <div class="prompt-links">
        <a href="#" id="submit-url">Enter</a>
        <a href="https://bandcamp.com/fansignup" target="_blank">Sign Up</a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("submit-url").addEventListener("click", () => {
    const urlInput = document.getElementById("bandcamp-url").value.trim();
    if (!urlInput.startsWith("https://bandcamp.com/")) {
      alert("Please enter a valid Bandcamp URL starting with https://bandcamp.com/");
      return;
    }
    localStorage.setItem("bandcampURL", urlInput.replace(/\/+$/, ""));
    overlay.remove();
    callback();
  });
}
