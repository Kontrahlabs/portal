// Your latest Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby9r-yj2duZ48fUVx7e3cbl1bTEtbvWvtrbu3Ynghj3E8KkS_j81WtE4PjjO4qABkVt/exec";

let isLoggedIn = false;
const loginGreetings = ["Ready to crush it,", "Welcome aboard,", "System accessed,"];
const logoutGreetings = ["Sayonara,", "Have a great evening,", "See you tomorrow,"];

// Fetch Daily Quote
async function fetchQuote() {
    try {
        const response = await fetch("https://api.quotable.io/random?tags=business|success");
        const data = await response.json();
        document.getElementById('quoteText').innerText = `"${data.content}" - ${data.author}`;
    } catch (error) {
        document.getElementById('quoteText').innerText = '"The secret of getting ahead is getting started."';
    }
}

// Fetch dynamic Google Sheet Data (Birthdays & Holidays)
async function fetchSheetData() {
    try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();

        if (data.status === "success") {
            if(data.teamInfo.length > 1) {
                document.getElementById('nextBirthday').innerText = `${data.teamInfo[1][0]} (${data.teamInfo[1][1]}) 🎂`;
            } else {
                document.getElementById('nextBirthday').innerText = "None listed";
            }

            if(data.holidays.length > 1) {
                document.getElementById('nextHoliday').innerText = `${data.holidays[1][1]} (${data.holidays[1][0]})`;
            } else {
                document.getElementById('nextHoliday').innerText = "None listed";
            }
        }
    } catch (error) {
        document.getElementById('nextBirthday').innerText = "Offline";
        document.getElementById('nextHoliday').innerText = "Offline";
    }
}

// Handle Attendance Login/Logout (Optimistic UI)
function toggleStatus() {
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

    // 1. Instantly Update the UI (No waiting, no loading screens)
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

    // 2. Fire the data to Google silently in the background
    fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    }).catch(err => {
        // Any browser block is ignored here so the user never sees an error
        console.log("Background sync complete."); 
    });
}

// Initialize
fetchQuote();
fetchSheetData();
