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
    window.location.href = "index.html";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === profileModal) {
        profileModal.style.display = "none";
    }
});

// File upload functionality
const uploadFileBtn = document.getElementById("uploadFileBtn");
const fileInput = document.getElementById("fileInput");
const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"]; // Allow only video files

// Trigger file selection dialog
uploadFileBtn.addEventListener("click", () => {
    fileInput.click();
});

// Handle file selection and upload
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) {
        alert("No file selected.");
        return;
    }

    // Validate file type
    if (!allowedVideoTypes.includes(file.type)) {
        alert("Invalid file type. Please upload a video file.");
        fileInput.value = ""; // Clear the file input
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    // Track progress
    xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            document.getElementById("uploadProgress").textContent = `Upload Progress: ${percentComplete}%`;
        }
    });

    // Handle response
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            document.getElementById("uploadProgress").textContent = ""; // Clear progress text
            const response = JSON.parse(xhr.responseText);

            if (xhr.status === 200) {
                const storageUsed = response.storage_percentage_used.toFixed(2); // Limit to 2 decimal places
                alert(`File uploaded successfully! Storage Used: ${storageUsed}%`);
                if (response.storage_80_alert) {
                    alert("Warning: Storage usage is above 80%!");
                }
                if (response.bandwidth_checks.bandwidth_limit_approaching) {
                    alert("Warning: Bandwidth limit approaching!");
                }
                if (response.bandwidth_checks.bandwidth_limit_exceeded) {
                    alert("Error: Bandwidth limit exceeded!");
                }
            } else if (xhr.status === 400) {
                alert(`Error: ${response.error}`);
            } else if (xhr.status === 401) {
                alert("Unauthorized: Please log in again.");
                localStorage.removeItem("authToken");
                window.location.href = "index.html";
            } else if (xhr.status === 403) {
                alert(`Error: ${response.error}`);
            } else {
                alert("Unexpected error occurred.");
            }
        }
    };

    xhr.open("POST", "https://video-storage-management-service-901574415199.us-central1.run.app/upload", true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
});

// Storage Status Modal Functionality
const storageStatusBtn = document.getElementById("storageStatusBtn");
const storageStatusModal = document.getElementById("storageStatusModal");
const closeStorageStatusModal = document.getElementById("closeStorageStatusModal");

storageStatusBtn.addEventListener("click", () => {
    fetch("https://video-storage-management-service-901574415199.us-central1.run.app/storage-status", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        const storageDetails = document.getElementById("storageDetails");
        const totalStorageMB = (data.total_storage / (1024 * 1024)).toFixed(2); // Total storage in MB
        const usedStorageMB = (data.used_storage / (1024 * 1024)).toFixed(2); // Used storage in MB
        const storagePercentage = ((data.used_storage / data.total_storage) * 100).toFixed(2);

        // Update storage details
        storageDetails.innerHTML = `
            <p><strong>Total Storage:</strong> ${totalStorageMB} MB</p>
            <p><strong>Used Storage:</strong> ${usedStorageMB} MB (${storagePercentage}%)</p>
        `;

        // Update progress bars
        const progressBarUsed = document.getElementById("progressBarUsed");
        const progressBarRemaining = document.getElementById("progressBarRemaining");

        // Set the width of the progress bars based on the storage percentage
        progressBarUsed.style.width = `${storagePercentage}%`;
        progressBarRemaining.style.width = `${100 - storagePercentage}%`;

        // Apply color based on the storage usage
        if (storagePercentage > 80) {
            // High usage: Red for used storage
            progressBarUsed.style.backgroundColor = "red";
            // Remaining storage: Light gray
            progressBarRemaining.style.backgroundColor = "#e0e0e0";
        } else {
            // Safe usage: Green for used storage
            progressBarUsed.style.backgroundColor = "green";
            // Remaining storage: Light gray
            progressBarRemaining.style.backgroundColor = "#e0e0e0";
        }

        // Show the modal
        storageStatusModal.style.display = "flex";
    })
    .catch(error => {
        alert("Error fetching storage status: " + error.message);
    });
});

// Close storage status modal
closeStorageStatusModal.addEventListener("click", () => {
    storageStatusModal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === storageStatusModal) {
        storageStatusModal.style.display = "none";
    }
});

// Delete File Modal Functionality
const deleteFileBtn = document.getElementById("deleteFileBtn");
const deleteFileModal = document.getElementById("deleteFileModal");
const closeDeleteFileModal = document.getElementById("closeDeleteFileModal");

deleteFileBtn.addEventListener("click", () => {
    fetch("https://video-storage-management-service-901574415199.us-central1.run.app/storage-status", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        const fileTableBody = document.getElementById("fileTable").getElementsByTagName("tbody")[0];

        // Clear any existing rows in the table before inserting new ones
        fileTableBody.innerHTML = "";

        // Check if files exist and are valid before adding them to the table
        if (data.files && data.files.length > 0) {
            data.files.forEach(file => {
                // Ensure that file and its attributes are valid before adding to the table
                if (file.filename && file.size) {
                    const row = fileTableBody.insertRow();
                    const filenameCell = row.insertCell(0);
                    const sizeCell = row.insertCell(1);
                    const actionCell = row.insertCell(2);

                    // Display only the filename without the duplicated username
                    const fileNameWithoutUsername = file.filename.split('/').pop();
                    filenameCell.textContent = fileNameWithoutUsername;
                    sizeCell.textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB"; // Display in MB

                    // Add trash icon button
                    const trashButton = document.createElement("button");
                    trashButton.classList.add("trash-btn");
                    trashButton.innerHTML = "&#128465;"; // Trash icon
                    trashButton.addEventListener("click", () => deleteFile(file.filename)); // Send full filename here
                    actionCell.appendChild(trashButton);
                }
            });
            deleteFileModal.style.display = "flex"; // Show the modal only if files exist
        } else {
            alert("No files available to delete.");
        }
    })
    .catch(error => {
        alert("Error fetching storage status: " + error.message);
    });
});

// Close delete file modal using the close button
closeDeleteFileModal.addEventListener("click", () => {
    deleteFileModal.style.display = "none"; // Close modal when the close button is clicked
});

// Close delete file modal when clicking outside the modal (anywhere outside the modal content)
window.addEventListener("click", (event) => {
    if (event.target === deleteFileModal) {
        deleteFileModal.style.display = "none"; // Close modal when clicking outside
    }
});

// Delete file functionality
function deleteFile(filename) {
    // Remove the username part from the filename to send only the file name
    const filenameToDelete = filename.split('/').pop();

    fetch("https://video-storage-management-service-901574415199.us-central1.run.app/delete-file", {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            filename: filenameToDelete // Send the corrected filename
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "File deleted successfully") {
            alert(`${data.file_deleted} deleted successfully.`);
            deleteFileModal.style.display = "none"; // Close the modal after successful file deletion
        } else {
            alert(`Error: ${data.error}`);
        }
    })
    .catch(error => {
        alert("Error deleting file: " + error.message);
    });
}
