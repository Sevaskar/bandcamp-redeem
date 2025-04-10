document.addEventListener("DOMContentLoaded", () => {
  const bandcampURL = localStorage.getItem("bandcampURL");

  if (!bandcampURL || !bandcampURL.startsWith("https://bandcamp.com/")) {
    document.getElementById("bandcamp-prompt").style.display = "flex";
  } else {
    document.getElementById("bandcamp-prompt").style.display = "none";
  }
});

function submitBandcampURL() {
  const url = document.getElementById("bandcamp-url").value.trim();
  if (url.startsWith("https://bandcamp.com/")) {
    localStorage.setItem("bandcampURL", url);
    document.getElementById("bandcamp-prompt").style.display = "none";
  } else {
    alert("Please enter a valid Bandcamp URL starting with https://bandcamp.com/");
  }
}

async function redeemCode(releaseTitle, button) {
  const url = localStorage.getItem("bandcampURL");
  if (!url || !url.startsWith("https://bandcamp.com/")) {
    alert("Please enter a valid Bandcamp URL before redeeming.");
    return;
  }

  const normalizedUrl = url.replace(/\/+$/, "");

  try {
    const redemptionsRes = await fetch("https://opensheet.elk.sh/1OakaRoUNoq3dMqPY5PDRw-5ibG5rCz10TMlFD9kheVM/Redemptions");
    const redemptions = await redemptionsRes.json();

    const alreadyRedeemed = redemptions.some(entry =>
      entry["Bandcamp URL"].trim().replace(/\/+$/, "") === normalizedUrl &&
      entry["Release"].trim() === releaseTitle.trim()
    );

    if (alreadyRedeemed) {
      button.disabled = true;
      button.textContent = "In Collection";
      return;
    }

    const codesRes = await fetch("https://opensheet.elk.sh/1OakaRoUNoq3dMqPY5PDRw-5ibG5rCz10TMlFD9kheVM/Codes");
    const codes = await codesRes.json();

    const availableCode = codes.find(code =>
      code.Release === releaseTitle && (!code.Used || code.Used.toLowerCase() !== "true")
    );

    if (!availableCode) {
      alert("No more codes available for this release.");
      return;
    }

    // Redeem the code
    const form = document.createElement("form");
    form.action = "https://bandcamp.com/yum";
    form.method = "GET";
    form.target = "_blank";

    const input = document.createElement("input");
    input.name = "code";
    input.value = availableCode.Code;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    form.remove();

    alert(`Code redeemed: ${availableCode.Code}`);

    // Optional: You should implement logging the redemption via Google Apps Script or Forms.
    button.disabled = true;
    button.textContent = "In Collection";

  } catch (error) {
    console.error("Redemption error:", error);
    alert("There was an error processing your request.");
  }
}
