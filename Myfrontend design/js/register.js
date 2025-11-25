document.getElementById("registerForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role })
    })
    .then(res => {
        if (!res.ok) throw new Error("Registration failed");
        return res.json();
    })
    .then(data => {
        alert("✅ Registration successful! Now login.");
        window.location.href = "login.html";
    })
    .catch(err => {
        console.error("❌ Registration error:", err);
        alert("Error registering. Please try again.");
    });
});
