document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    console.log("✅ login.js loaded, button:", loginBtn);

    loginBtn.addEventListener("click", (event) => {
        event.preventDefault(); // stop form refresh
        console.log("✅ Login button clicked");

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
        .then(res => {
            if (!res.ok) throw new Error("Login failed");
            return res.json();
        })
        .then(data => {
            console.log("✅ Login response:", data);
            localStorage.setItem("jwtToken", data.token);

            const payload = JSON.parse(atob(data.token.split('.')[1]));
            console.log("✅ Decoded JWT payload:", payload);

            const role = payload.role.replace("ROLE_", ""); // normalize
            if (role === "ADMIN") {
                window.location.href = "admin-dashboard.html";
            } else if (role === "STAFF") {
                window.location.href = "staff-dashboard.html";
            } else {
                window.location.href = "index.html";
            }
        })
        .catch(err => {
            console.error("❌ Login error:", err);
            alert("Invalid credentials");
        });
    });
});
