// Check if the user is logged in
const token = localStorage.getItem("authToken");

if (!token) {
    alert("Unauthorized! Please log in.");
    window.location.href = "index.html";
} else {
    // Fetch user details from the backend using GET
    fetch("https://user-management-service-901574415199.us-central1.run.app/api/users/profile", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch user details. Please log in again.");
            }
            return response.json();
        })
        .then((data) => {
            // Store user data locally for modal display
            localStorage.setItem("userData", JSON.stringify(data));

            // Update welcome message
            const welcomeMessage = document.getElementById("welcomeMessage");
            welcomeMessage.textContent = `Hello, ${data.username}!`;
        })
        .catch((error) => {
            alert(error.message);
            localStorage.removeItem("authToken"); // Clear invalid token
            window.location.href = "index.html";
        });
}

// Profile Details Modal Functionality
const profileDetailsBtn = document.getElementById("profileDetailsBtn");
const profileModal = document.getElementById("profileModal");
const closeProfileModal = document.getElementById("closeProfileModal");

profileDetailsBtn.addEventListener("click", () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
        const userDetails = document.getElementById("userDetails");
        userDetails.innerHTML = `
            <p><strong>Username:</strong> ${userData.username}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>User ID:</strong> ${userData._id}</p>
        `;
        profileModal.style.display = "flex";
    } else {
        alert("Failed to load user details. Please log in again.");
    }
});

closeProfileModal.addEventListener("click", () => {
    profileModal.style.display = "none";
});

// Logout button functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("authToken"); // Clear the token
    localStorage.removeItem("userData"); // Clear user details
    alert("You have been logged out.");
    window.location.href = "index.html";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === profileModal) {
        profileModal.style.display = "none";
    }
});
