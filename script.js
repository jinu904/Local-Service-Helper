const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const terms = document.getElementById("terms").checked;

        event.preventDefault();

        if (fullname === "") return alert("Please enter your full name.");
        if (!email.includes("@") || !email.includes(".")) return alert("Please enter a valid email address.");
        if (!/^[0-9]{10}$/.test(phone)) return alert("Please enter a valid 10-digit phone number.");
        if (password.length < 6) return alert("Password must contain at least 6 characters.");
        if (password !== confirmPassword) return alert("Password and Confirm Password do not match.");
        if (!terms) return alert("Please agree to the terms and conditions.");

        alert("Registration successful!");
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        event.preventDefault();

        if (email === "") return alert("Please enter your email address.");
        if (!email.includes("@") || !email.includes(".")) return alert("Please enter a valid email address.");
        if (password === "") return alert("Please enter your password.");
        if (password.length < 6) return alert("Password must contain at least 6 characters.");

        alert("Login successful!");
    });
}
