// PASTE YOUR WEB APP URL HERE
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxNLmzV-tXmBa71i_nTmXYA6bcqQdxPXdq1nIvGc-JeZ0vn5tpgVKHavbTrGGw2wtRt/exec";

let isLoggedIn = false;
const loginGreetings = ["Ready to crush it,", "Welcome aboard,", "System accessed,"];
const logoutGreetings = ["Sayonara,", "Have a great evening,", "See you tomorrow,"];

// 1. Fetch Daily Quote
async function fetchQuote() {
    try {
        const response = await fetch("https://api.quotable.io/random?tags=business|success");
        const data = await response.json();
        document.getElementById('quoteText').innerText = `"${data.content}" - ${data.author}`;
    } catch (error) {
        document.getElementById('quoteText').innerText = '"The secret of getting ahead is getting started."';
    }
}

// 2. NEW: Fetch dynamic Google Sheet Data (Birthdays & Holidays)
async function fetchSheetData() {
    try {
        // Calling the GET function from your Apps Script
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();

        if (data.status === "success") {
            // Assuming Row 1 is Headers, Row 2 is the next upcoming event
            // data.teamInfo[1][0] = Name, data.teamInfo[1][1] = Birthday Date
            if(data.teamInfo.length > 1) {
                document.getElementById('nextBirthday').innerText = `${data.teamInfo[1][0]} (${data.teamInfo[1][1]}) 🎂`;
            } else {
                document.getElementById('nextBirthday').innerText = "None listed";
            }

            // data.holidays[1][0] = Date, data.holidays[1][1] = Holiday Name
            if(data.holidays.length > 1) {
                document.getElementById('nextHoliday').innerText = `${data.holidays[1][1]} (${data.holidays[1][0]})`;
            } else {
                document.getElementById('nextHoliday').innerText = "None listed";
            }
        }
    } catch (error) {
        console.error("Could not load calendar data.");
        document.getElementById('nextBirthday').innerText = "Offline";
        document.getElementById('nextHoliday').innerText = "Offline";
    }
}

// 3. Handle Attendance Login/Logout
async function toggleStatus() {
    const userSelect = document.getElementById("teamSelector");
    const userName = userSelect.value;
    const actionBtn = document.getElementById("actionBtn");
    const greetingText = document.getElementById("greetingText");
    const streakCount = document.getElementById("streakCount");

    if (!userName) {
        alert("Please select your name first!");
        return;
    }

    const actionType = isLoggedIn ? "logout" : "login";
    const payload = { action: actionType, name: userName };

    const originalBtnText = actionBtn.innerText;
    actionBtn.innerText = "[ PROCESSING... ]";
    actionBtn.disabled = true;

    try {
        // Added redirect: 'follow' which helps with Google's backend routing
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
            redirect: "follow" 
        });

        // If no network error is thrown, we proceed.
        if (actionType === "login") {
            const randomGreet = loginGreetings[Math.floor(Math.random() * loginGreetings.length)];
            greetingText.innerText = `${randomGreet} ${userName} 🚀`;
            actionBtn.innerText = "[ LOGOUT ]";
            actionBtn.classList.add("logged-in");
            streakCount.innerText = "Active 🔥"; 
            isLoggedIn = true;
        } else {
            const randomBye = logoutGreetings[Math.floor(Math.random() * logoutGreetings.length)];
            greetingText.innerText = `${randomBye} ${userName} 👋`;
            actionBtn.innerText = "[ LOGIN ]";
            actionBtn.classList.remove("logged-in");
            streakCount.innerText = "--";
            isLoggedIn = false;
            userSelect.value = ""; 
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Network error: Check connection or ensure Apps Script is deployed to 'Anyone'.");
    } finally {
        actionBtn.disabled = false;
        if(!isLoggedIn) actionBtn.innerText = "[ LOGIN ]";
    }
}

// Initialize
fetchQuote();
fetchSheetData();
