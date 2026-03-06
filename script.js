// Your latest Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwtX6VFskbwnYkfxYD90LRbilOmZagsWdDOgvyxaXlkF1d8KS3TGfew5iwHdMmat375/exec";

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
// 1. Instantly Update the UI (Optimistic UI)
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

    // THE FIX: Package the data exactly like a standard HTML form
    const formData = new URLSearchParams();
    formData.append("action", actionType);
    formData.append("name", userName);

    // 2. Fire the data to Google without CORS issues
    fetch(WEB_APP_URL, {
        method: "POST",
        body: formData // This automatically sets the correct, safe Content-Type
    })
    .then(response => console.log("Data successfully transmitted!"))
    .catch(err => console.error("Background sync failed:", err));
}

// Initialize
fetchQuote();
fetchSheetData();


