document.addEventListener("DOMContentLoaded", () => {
    const bookingDate = document.querySelector(".booking-date");

    if (bookingDate) {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        bookingDate.min = `${today.getFullYear()}-${month}-${day}`;
    }

    document.querySelectorAll(".review-link, .view-reviews").forEach((button) => {
        button.addEventListener("click", () => {
            const reviewBox = document.getElementById(`reviews-${button.dataset.review}`);
            if (reviewBox) reviewBox.classList.toggle("show");
        });
    });

    let selectedProfessional = null;
    const selectedBox = document.getElementById("selected-professional");

    document.querySelectorAll(".book-professional").forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".professional-card");
            const name = button.dataset.professional;
            const photo = card.querySelector("img");
            const rating = card.querySelector(".rating strong").textContent;
            const experience = card.querySelector(".experience").textContent.trim();

            selectedProfessional = { name, rating, experience, image: photo.src };
            selectedBox.innerHTML = `
                <div class="selected-person">
                    <img src="${selectedProfessional.image}" alt="${selectedProfessional.name}">
                    <div>
                        <strong>${selectedProfessional.name}</strong>
                        <span>★ ${selectedProfessional.rating} · ${selectedProfessional.experience}</span>
                    </div>
                </div>`;

            document.querySelectorAll(".book-professional").forEach((item) => {
                item.textContent = item.dataset.defaultLabel || "Book this professional";
            });
            button.dataset.defaultLabel ||= button.textContent;
            button.textContent = "Selected ✓";
            document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    document.querySelectorAll(".service-booking-form").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const service = form.querySelector(".service-select").value;
            const name = form.querySelector(".booking-name").value.trim();
            const phone = form.querySelector(".booking-phone").value.trim();
            const date = form.querySelector(".booking-date").value;
            const time = form.querySelector(".booking-time").value;
            const address = form.querySelector(".booking-address").value.trim();
            const problem = form.querySelector(".booking-problem").value.trim();
            const message = form.parentElement.querySelector(".booking-message");

            if (!selectedProfessional) return alert("Please select a professional first.");
            if (!service || !name || !phone || !date || !time || !address || !problem) return alert("Please complete every booking detail.");
            if (!/^\d{10}$/.test(phone)) return alert("Please enter a valid 10-digit phone number.");

            message.textContent = `Booking request sent for ${service} with ${selectedProfessional.name} on ${date} at ${time}. We will contact you shortly.`;
            message.hidden = false;
            form.reset();
            selectedProfessional = null;
            selectedBox.innerHTML = '<div class="selected-placeholder">Choose a professional from the list</div>';
            document.querySelectorAll(".book-professional").forEach((button) => {
                button.textContent = button.dataset.defaultLabel || "Book this professional";
            });
        });
    });
});
