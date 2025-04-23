document.addEventListener("DOMContentLoaded", () => {
  const sheetID = "1OakaRoUNoq3dMqPY5PDRw-5ibG5rCz10TMlFD9kheVM";
  const submitBtn = document.getElementById("submit-url-btn");
  const bandcampInput = document.getElementById("bandcamp-url");
  const titlesContainer = document.getElementById("titles-container");
  const promptBox = document.getElementById("prompt-box");

  submitBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    const bandcampURL = bandcampInput.value.trim();
    if (!bandcampURL.includes("bandcamp.com")) {
      alert("Please enter a valid Bandcamp URL.");
      return;
    }

    promptBox.style.display = "none";
    titlesContainer.innerHTML = "<p>Loading available titles...</p>";
    titlesContainer.style.display = "block";

    const titles = await fetchTitles();
    const redemptions = await fetchRedemptions();

    const userTitles = redemptions
      .filter(row => row[1] === bandcampURL)
      .map(row => row[0]);

    titlesContainer.innerHTML = "";

    titles.forEach(([title, code, status]) => {
      let buttonHTML = "";

      if (userTitles.includes(title)) {
        buttonHTML = `<span style="color: gray;">Already in Collection</span>`;
      } else if (status) {
        buttonHTML = `<span style="color: orange;">No Available Codes</span>`;
      } else {
        buttonHTML = `<a href="#" class="redeem-button" data-title="${title}" data-code="${code}">Add to Collection</a>`;
      }

      const box = document.createElement("div");
      box.innerHTML = `<p><strong>${title}</strong><br>${buttonHTML}</p>`;
      titlesContainer.appendChild(box);
    });

    document.querySelectorAll(".redeem-button").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const title = btn.getAttribute("data-title");
        const code = btn.getAttribute("data-code");

        await markCodeAsUsed(title, code);
        await logRedemption(title, bandcampURL);

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://bandcamp.com/yum";
        form.target = "_blank";

        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "code";
        hiddenInput.value = code;
        form.appendChild(hiddenInput);

        document.body.appendChild(form);
        form.submit();
      })
    );
  });

  async function fetchTitles() {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=Codes`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    return json.table.rows.map(r => r.c.map(c => (c ? c.v : "")));
  }

  async function fetchRedemptions() {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=Redemptions`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    return json.table.rows.map(r => r.c.map(c => (c ? c.v : "")));
  }

  async function markCodeAsUsed(title, code) {
    await fetch(
      `https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec`,
      {
        method: "POST",
        body: JSON.stringify({ type: "markUsed", title, code }),
      }
    );
  }

  async function logRedemption(title, bandcampURL) {
    await fetch(
      `https://script.google.com/macros/s/AKfycbzJu2oR2aYGvdrmanMV5jY7fu4zzN4d_ymCLj0JmT52m0I49r3zi5-IgMnD81JwRlvp1A/exec`,
      {
        method: "POST",
        body: JSON.stringify({ type: "logRedemption", title, bandcampURL }),
      }
    );
  }
});
