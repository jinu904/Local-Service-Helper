const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {

        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const terms = document.getElementById("terms").checked;

        if (fullname === "") {
            alert("Please enter your full name.");
            event.preventDefault();
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            alert("Please enter a valid email address.");
            event.preventDefault();
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            alert("Please enter a valid 10-digit phone number.");
            event.preventDefault();
            return;
        }

        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            event.preventDefault();
            return;
        }

        if (password !== confirmPassword) {
            alert("Password and Confirm Password do not match.");
            event.preventDefault();
            return;
        }

        if (!terms) {
            alert("Please agree to the terms and conditions.");
            event.preventDefault();
            return;
        }

        alert("Registration successful!");
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (email === "") {
            alert("Please enter your email address.");
            event.preventDefault();
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            alert("Please enter a valid email address.");
            event.preventDefault();
            return;
        }

        if (password === "") {
            alert("Please enter your password.");
            event.preventDefault();
            return;
        }

        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            event.preventDefault();
            return;
        }

        alert("Login successful!");
    });
}