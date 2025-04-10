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
    entry["Bandcamp URL"].trim().replace(/\/+$/, "") === bandcampURL &&
    entry["Release"].trim() === releaseTitle.trim()
  );

  if (alreadyRedeemed) {
    alert("Already in Collection");
    return;
  }

  // Fetch Codes
  const codesRes = await fetch("https://opensheet.elk.sh/1OakaRoUNoq3dMqPY5PDRw-5ibG5rCz10TMlFD9kheVM/Codes");
  const codes = await codesRes.json();

  const availableCode = codes.find(code =>
    code.Release === releaseTitle && (!code.Used || code.Used.toLowerCase() !== "true")
  );

  if (!availableCode) {
    alert("No more codes available for this release.");
    return;
  }

  // Redeem code
  const form = document.createElement("form");
  form.action = "https://bandcamp.com/yum";
  form.method = "POST";
  form.target = "_blank";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "code";
  input.value = availableCode.Code;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();

  alert(`Code redeemed: ${availableCode.Code}`);
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
