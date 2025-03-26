async function redeemCode() {
    let urlInput = document.getElementById("bandcamp-url").value;
    let message = document.getElementById("message");

    if (!urlInput.startsWith("https://bandcamp.com/")) {
        message.innerHTML = "❌ Please enter a valid Bandcamp profile URL.";
        return;
    }

    let username = urlInput.split("/").pop(); // Extract username from URL

    // Send request to Google Apps Script to check redemption
    let response = await fetch(`https://script.google.com/macros/s/AKfycbzvJdB-q43AFtmY-8IJtVVHDXfWxNcfNluNxsmC102pa_6xvWfYK2Vm-ie4kCDgtgt-/exec/dev/exec?username=${username}`);
    let result = await response.json();

    if (result.status === "already_redeemed") {
        message.innerHTML = "⚠️ You have already redeemed a code.";
    } else if (result.status === "success") {
        let code = result.code;
        message.innerHTML = `✅ Code Redeemed: ${code}`;

        // Auto-submit Bandcamp redemption form
        let form = document.createElement("form");
        form.className = "download-code-form";
        form.action = "https://sevaskar.bandcamp.com/yum";
        form.method = "get";
        form.target = "_blank";

        let input = document.createElement("input");
        input.name = "code";
        input.type = "hidden";
        input.value = code;

        let submit = document.createElement("input");
        submit.type = "submit";
        submit.value = "Redeem Code";

        form.appendChild(input);
        form.appendChild(submit);
        document.body.appendChild(form);
        submit.click(); // Auto-submit the form
    } else {
        message.innerHTML = "❌ Error redeeming code. Please try again.";
    }
}
