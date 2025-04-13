let currentBandcampURL = "";

function submitBandcampURL() {
  const urlInput = document.getElementById("bandcamp-url");
  const url = urlInput.value.trim();

  if (!url.startsWith("https://bandcamp.com/")) {
    showToast("Please enter a valid Bandcamp URL.");
    return;
  }

  currentBandcampURL = url;

  document.getElementById("bandcamp-prompt").style.display = "none";
  document.getElementById("overlay").style.display = "none";

  const selectedTitle = document.getElementById("bandcamp-prompt").getAttribute("data-selected-title");
  const redeemButton = Array.from(document.querySelectorAll(".redeem-button")).find(
    btn => btn.getAttribute("data-title") === selectedTitle
  );

  if (selectedTitle && redeemButton) {
    redeemCode(selectedTitle, redeemButton);
  }
}

function redeemCode(title, button) {
  if (!currentBandcampURL) {
    const prompt = document.getElementById("bandcamp-prompt");
    prompt.setAttribute("data-selected-title", title);
    prompt.style.display = "flex";
    document.getElementById("overlay").style.display = "block";
    return;
  }

  // Disable button to prevent double click
  button.disabled = true;

  showToast("Contacting Sevaskar's servers...");

  fetch('https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, bandcampURL: currentBandcampURL }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Server responded with an error");
    }
    return response.json();
  })
  .then(data => {
    console.log("Response from server:", data);
    if (data.status === "success") {
      document.querySelector('input[name="code"]').value = data.code;
      document.getElementById("hidden-redeem-form").submit();
      showToast("Code assigned and form submitted.");
    } else {
      showToast(data.message || "Something went wrong.");
      button.disabled = false;
    }
  })
  .catch(error => {
    console.error("Error during fetch:", error);
    showToast("Something went wrong. Try again later.");
    button.disabled = false;
  });
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4000);
}
