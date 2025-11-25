document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        // Not logged in → Show Login & Register
        navbar.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
            <a href="#about-us">About Us</a>
        `;
    } else {
        try {
            // Decode token payload
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload.role;  // e.g. ROLE_ADMIN, ROLE_STAFF, ROLE_PEOPLE
            const username = payload.sub;

            let roleLink = "";
            if (role === "ROLE_ADMIN") {
                roleLink = `<a href="admin-dashboard.html">Admin Dashboard</a>`;
            } else if (role === "ROLE_STAFF") {
                roleLink = `<a href="staff-dashboard.html">Staff Dashboard</a>`;
            }

            // Show navbar with role-specific links
            navbar.innerHTML = `
                <span>👋 Hello, ${username}</span>
                ${roleLink}
                <a href="#" id="logoutBtn">Logout</a>
                <a href="#about-us">About Us</a>
            `;

            // Logout button
            document.getElementById("logoutBtn").addEventListener("click", () => {
                localStorage.removeItem("jwtToken");
                window.location.href = "index.html";
            });
        } catch (err) {
            console.error("Invalid token:", err);
            localStorage.removeItem("jwtToken");
            window.location.href = "login.html";
        }
    }
});
