// Your unique Google Apps Script Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxDTyEiwDgtIKSgN_KApdCVHOcYrVNtQEj424mzyl6THu9sQhWA8YYKgun8_aRqW6FX/exec";

let isLoggedIn = false;

// Randomized Greetings
const loginGreetings = ["Ready to crush it,", "Welcome aboard,", "System accessed,"];
const logoutGreetings = ["Sayonara,", "Have a great evening,", "See you tomorrow,"];

// Free Quote API Integration for Daily Fuel
async function fetchQuote() {
    try {
        const response = await fetch("https://api.quotable.io/random?tags=business|success");
        const data = await response.json();
        document.getElementById('quoteText').innerText = `"${data.content}" - ${data.author}`;
    } catch (error) {
        // Fallback quote if the API fails
        document.getElementById('quoteText').innerText = '"The secret of getting ahead is getting started."';
    }
}

// Core Attendance Logic
async function toggleStatus() {
    const userSelect = document.getElementById("teamSelector");
    const userName = userSelect.value;
    const actionBtn = document.getElementById("actionBtn");
    const greetingText = document.getElementById("greetingText");
    const streakCount = document.getElementById("streakCount");

    // Prevent action if no name is selected
    if (!userName) {
        alert("Please select your name first!");
        return;
    }

    // Determine if we are logging in or logging out
    const actionType = isLoggedIn ? "logout" : "login";
    
    // Create the data payload matching the backend expectations
    const payload = {
        action: actionType,
        name: userName
    };

    // UI Feedback: Show processing state to prevent double-clicks
    const originalBtnText = actionBtn.innerText;
    actionBtn.innerText = "[ PROCESSING... ]";
    actionBtn.disabled = true;
    actionBtn.style.opacity = "0.7";

    try {
        // Send the data to your Google Sheet
        await fetch(WEB_APP_URL, {
            method: "POST",
            // Using text/plain prevents complex CORS preflight issues with Google Scripts
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(payload)
        });

        // Upon successful connection, update the UI
        if (actionType === "login") {
            const randomGreet = loginGreetings[Math.floor(Math.random() * loginGreetings.length)];
            greetingText.innerText = `${randomGreet} ${userName} 🚀`;
            actionBtn.innerText = "[ LOGOUT ]";
            actionBtn.classList.add("logged-in");
            streakCount.innerText = "14 Days 🔥"; // Static for now, can be dynamic later
            isLoggedIn = true;
        } else {
            const randomBye = logoutGreetings[Math.floor(Math.random() * logoutGreetings.length)];
            greetingText.innerText = `${randomBye} ${userName} 👋`;
            actionBtn.innerText = "[ LOGIN ]";
            actionBtn.classList.remove("logged-in");
            streakCount.innerText = "--";
            isLoggedIn = false;
            userSelect.value = ""; // Reset the dropdown for the next person
        }
    } catch (error) {
        console.error("Error connecting to database:", error);
        alert("Network error: Could not log attendance. Please check your connection.");
        actionBtn.innerText = originalBtnText; // Revert button if it fails
    } finally {
        // Restore button interactivity
        actionBtn.disabled = false;
        actionBtn.style.opacity = "1";
    }
}

// Initialize the dashboard on load
fetchQuote();