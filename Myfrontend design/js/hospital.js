let selectdRating = 0;

function loadHospitalDetails(id) {
    fetch(`http://localhost:8080/hospitals/${id}`)
        .then(res => res.json())
        .then(hospital => {
            const details = document.getElementById("hospitalDetails");
            details.innerHTML = `
                <h2>${hospital.name}</h2>
                <p><strong>Area:</strong> ${hospital.area}</p>
                <p><strong>Address:</strong> ${hospital.address}</p>
                <p><strong>Contact:</strong> ${hospital.contactno}</p>
                <p><strong>Rating:</strong> <span id="hospitalRating">Loading...</span></p>
            `;
            loadHospitalRating(id);
        });
}

function loadHospitalRating(hospitalId) {
    fetch(`http://localhost:8080/hospitals/${hospitalId}/rating`)
        .then(res => res.json())
        .then(rating => {
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5 ? 1 : 0;
            const emptyStars = 5 - fullStars - halfStar;

            let starsHTML = "";
            for (let i = 0; i < fullStars; i++) starsHTML += "⭐";
            if (halfStar) starsHTML += "✨"; // Half-star style
            for (let i = 0; i < emptyStars; i++) starsHTML += "☆";

            document.getElementById("hospitalRating").innerHTML = starsHTML;
        })
        .catch(err => console.error("Error loading rating:", err));
}

function loadHospitalStats(id) {
    fetch(`http://localhost:8080/hospitals/${id}`)
        .then(res => res.json())
        .then(stats => {
            const container = document.getElementById("stats");
            container.innerHTML = `
                <div class="stat-card">
                    <img src="assets/icons/doctor.svg" class="stat-icon" alt="Doctors">
                    <div class="stat-value">${stats.availableDoctors}</div>
                    <div class="stat-label">Available Doctors</div>
                </div>
                <div class="stat-card">
                    <img src="assets/icons/bed.svg" class="stat-icon" alt="Beds">
                    <div class="stat-value">${stats.totalBeds}</div>
                    <div class="stat-label">Total Beds</div>
                </div>
                <div class="stat-card">
                    <img src="assets/icons/available-bed.svg" class="stat-icon" alt="Available Beds">
                    <div class="stat-value">${stats.availableBeds}</div>
                    <div class="stat-label">Available Beds</div>
                </div>
                <div class="stat-card">
                    <img src="assets/icons/oxygen.svg" class="stat-icon" alt="Oxygen">
                    <div class="stat-value">${stats.oxygenAvailable ? 'Yes' : 'No'}</div>
                    <div class="stat-label">Oxygen Available</div>
                </div>
                <div class="stat-card">
                    <img src="assets/icons/ventilator.svg" class="stat-icon" alt="Ventilator">
                    <div class="stat-value">${stats.ventilatorAvailable ? 'Yes' : 'No'}</div>
                    <div class="stat-label">Ventilator Available</div>
                </div>
                <div class="stat-card">
                    <img src="assets/icons/ambulance.svg" class="stat-icon" alt="Ambulance">
                    <div class="stat-value">${stats.ambulanceAvailable ? 'Yes' : 'No'}</div>
                    <div class="stat-label">Ambulance Available</div>
                </div>
                <div class="stat-card">
                    <img src="assets/icons/clock.svg" class="stat-icon" alt="24 Hours">
                    <div class="stat-value">${stats.open24Hours ? 'Yes' : 'No'}</div>
                    <div class="stat-label">Open 24 Hours</div>
                </div>
                
            `;
        })
        .catch(err => console.error("Error loading stats:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hospitalId = urlParams.get("id");
    
    if (hospitalId) {
        loadHospitalDetails(hospitalId);
        loadHospitalStats(hospitalId);
        loadFeedback(hospitalId);
    }

    document.querySelectorAll(".star-rating span").forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = parseInt(star.getAttribute("data-value"));
            document.querySelectorAll(".star-rating span").forEach(s => s.classList.remove("active"));
            star.classList.add("active");
            let prev = star.nextElementSibling;
            while (prev) {
                prev.classList.add("active");
                prev = prev.nextElementSibling;
            }
        });
    });

    document.getElementById("sendFeedback").addEventListener("click", () => {
        const name = document.getElementById("feedbackName").value.trim();
        const email = document.getElementById("feedbackEmail").value.trim();
        const message = document.getElementById("feedbackInput").value.trim();

        if (!name || !email || !message || selectedRating === 0) {
            alert("Please fill all fields and select a rating.");
            return;
        }

        const feedbackData = {
            hospitalId: parseInt(hospitalId),
            username: name,
            email: email,
            message: message,
            rating: selectedRating
        };

        fetch("http://localhost:8080/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(feedbackData)
        })
        .then(res => res.json())
        .then(savedFeedback => {
            alert("Feedback submitted!");

            // Add to DOM instantly with fade-in effect
            const list = document.querySelector(".feedback-list");
            const fbCard = document.createElement("div");
            fbCard.className = "feedback-card fade-in";
            fbCard.innerHTML = `
                <p><strong>${savedFeedback.username}</strong> (${savedFeedback.email})</p>
                <p>${savedFeedback.message}</p>
                <p>⭐ ${savedFeedback.rating}</p>
            `;
            list.prepend(fbCard);

            // Trigger fade-in
            setTimeout(() => {
                fbCard.classList.add("visible");
            }, 50);

            // Clear form
            document.getElementById("feedbackName").value = "";
            document.getElementById("feedbackEmail").value = "";
            document.getElementById("feedbackInput").value = "";
            selectedRating = 0;
            document.querySelectorAll(".star-rating span").forEach(s => s.classList.remove("active"));

            // Refresh hospital rating
            loadHospitalRating(hospitalId);
        })
        .catch(err => console.error("Error submitting feedback:", err));
    });

    document.querySelector(".toggle-feedback").addEventListener("click", () => {
        const list = document.querySelector(".feedback-list");
        list.style.display = list.style.display === "none" ? "block" : "none";
    });
});

function loadFeedback(hospitalId) {
    fetch(`http://localhost:8080/feedback/hospital/${hospitalId}`)
        .then(res => res.json())
        .then(data => {
            const list = document.querySelector(".feedback-list");
            list.innerHTML = "";

            if (data.length === 0) {
                list.innerHTML = "<p>No feedback yet.</p>";
            } else {
                data.forEach(fb => {
                    const fbCard = document.createElement("div");
                    fbCard.className = "feedback-card";
                    fbCard.innerHTML = `
                        <p><strong>${fb.username}</strong> (${fb.email})</p>
                        <p>${fb.message}</p>
                        <p>⭐ ${fb.rating}</p>
                    `;
                    list.appendChild(fbCard);
                });
            }
        })
        .catch(err => console.error("Error loading feedback:", err));
}



