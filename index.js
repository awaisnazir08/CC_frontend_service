// Get elements
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const closeLogin = document.getElementById("closeLogin");
const closeRegister = document.getElementById("closeRegister");

// Open Login Modal
loginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
});

// Open Register Modal
registerBtn.addEventListener("click", () => {
    registerModal.style.display = "flex";
});

// Close Login Modal
closeLogin.addEventListener("click", () => {
    loginModal.style.display = "none";
});

// Close Register Modal
closeRegister.addEventListener("click", () => {
    registerModal.style.display = "none";
});

// Close Modals when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target === registerModal) {
        registerModal.style.display = "none";
    }
});

// Handle Registration Form Submission
document.querySelector("#registerModal form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from reloading the page

    // Collect form data
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("passwordReg").value;

    // API request
    const response = await fetch("https://user-management-service-901574415199.us-central1.run.app/api/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
    });

    // Handle response
    if (response.ok) {
        const result = await response.json();
        alert("Registration successful!");
        console.log(result);
        registerModal.style.display = "none"; // Close modal
    } else {
        const error = await response.json();
        alert(`Registration failed: ${error.message}`);
    }
});

// Handle Login Form Submission
document.querySelector("#loginModal form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from reloading the page

    // Collect form data
    const identifier = document.getElementById("identifier").value;
    const password = document.getElementById("password").value;

    try {
        // API request
        const response = await fetch("https://user-management-service-901574415199.us-central1.run.app/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifier, password }),
        });

        // Handle response
        if (response.ok) {
            const result = await response.json();

            // Save the token in localStorage
            localStorage.setItem("authToken", result.access_token);

            // Redirect to the dashboard page
            window.location.href = "dashboard.html";
        } else {
            const error = await response.json();
            alert(`Login failed: ${error.error}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert("Something went wrong. Please try again later.");
    }
});



// URL: https://user-management-service-901574415199.us-central1.run.app