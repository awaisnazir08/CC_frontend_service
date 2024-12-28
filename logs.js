function formatMB(bytes) {
    if (bytes === 0) return "0 MB";
    const mb = 1024 * 1024;
    return (bytes / mb).toFixed(2) + " MB";
}

// Fetch complete summary data
window.onload = () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Unauthorized! Please log in.");
        window.location.href = "index.html";
        return;
    }

    const completeSummaryUrl = "https://usage-monitoring-service-901574415199.us-central1.run.app/api/usage/complete-summary";
    const dailySummaryUrl = "https://usage-monitoring-service-901574415199.us-central1.run.app/api/usage/daily-summary";

    // Fetch daily summary data
    fetch(dailySummaryUrl, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const totalUsed = data.total_data_bandwidth_used || 0;
        const remaining = data.remaining_bandwidth || 0;

        // Update the daily summary section
        const dailySummary = document.getElementById("dailySummary");
        dailySummary.innerHTML = `
            <h2>Daily Usage Summary</h2>
            <p><strong>Total Bandwidth Used:</strong> ${formatMB(totalUsed)}</p>
            <p><strong>Remaining Bandwidth:</strong> ${formatMB(remaining)}</p>
        `;
    })
    .catch(error => {
        console.error("Error fetching daily summary:", error);
        document.getElementById("dailySummary").innerHTML = "Failed to load daily summary data.";
    });

    // Fetch complete summary data
    fetch(completeSummaryUrl, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data || !data.daily_records) {
            console.error("Missing daily records in the response");
            return;
        }

        const labels = data.daily_records.map(record => new Date(record.date).toLocaleDateString());
        const uploadBandwidthData = data.daily_records.map(record => record.uploads.reduce((total, upload) => total + upload.file_size, 0));
        const deletionBandwidthData = data.daily_records.map(record => record.deletions.reduce((total, deletion) => total + deletion.file_size, 0));

        const yMax = 100 * 1024 * 1024; // 100 MB in bytes
        const stepSize = 10 * 1024 * 1024; // 10 MB in bytes

        // Render the chart with Bandwidth used for Uploads and Deletions
        const ctx = document.getElementById("usageChart").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels.reverse(),
                datasets: [
                    {
                        label: "Upload Bandwidth Used",
                        data: uploadBandwidthData.reverse(),
                        borderColor: "rgba(75, 192, 192, 1)",
                        fill: false
                    },
                    {
                        label: "Deletion Bandwidth Used",
                        data: deletionBandwidthData.reverse(),
                        borderColor: "rgba(255, 99, 132, 1)",
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: false
                    },
                    tooltip: {
                        mode: "index",
                        intersect: false,
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.dataset.label + ": " + formatMB(tooltipItem.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: yMax,
                        ticks: {
                            stepSize: stepSize,
                            callback: function(value) {
                                return formatMB(value);
                            }
                        }
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error("Error fetching complete summary:", error);
    });
};

// Logout button functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("authToken"); // Clear the token
    localStorage.removeItem("userData"); // Clear user details
    window.location.href = "index.html";
});
