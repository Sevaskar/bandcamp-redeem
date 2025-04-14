document.addEventListener("DOMContentLoaded", function () {
    const redeemButtons = document.querySelectorAll(".redeem-code-button");

    redeemButtons.forEach(button => {
        button.addEventListener("click", function () {
            const title = button.getAttribute("data-title");
            const existingPopup = document.getElementById("bandcamp-url-popup");

            if (!existingPopup) {
                const popup = document.createElement("div");
                popup.id = "bandcamp-url-popup";
                popup.style.position = "fixed";
                popup.style.top = "50%";
                popup.style.left = "50%";
                popup.style.transform = "translate(-50%, -50%)";
                popup.style.backgroundColor = "#fff";
                popup.style.border = "1px solid #ccc";
                popup.style.padding = "20px";
                popup.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.2)";
                popup.style.zIndex = 9999;

                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Enter your Bandcamp URL";
                input.style.marginRight = "10px";
                input.style.width = "300px";

                const submitBtn = document.createElement("button");
                submitBtn.textContent = "Submit";

                submitBtn.addEventListener("click", () => {
                    const bandcampUrl = input.value.trim();
                    if (!bandcampUrl) {
                        alert("Please enter a valid Bandcamp URL.");
                        return;
                    }

                    popup.remove();

                    // Dispatch a custom event with the Bandcamp URL
                    const urlEvent = new CustomEvent("bandcampUrlSubmitted", {
                        detail: { bandcampUrl }
                    });
                    window.dispatchEvent(urlEvent);
                });

                popup.appendChild(input);
                popup.appendChild(submitBtn);
                document.body.appendChild(popup);
            }
        });
    });
});
