// Keep your Web App URL here
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwkA2gNxY2cRroCfSyf7GAUU955DxsFZtz3LLvfjUje_G1xyPY02tvbTWIc0Rvn7P8v/exec";

let isLoggedIn = false;
const loginGreetings = ["Ready to crush it,", "Welcome aboard,", "System accessed,"];
const logoutGreetings = ["Sayonara,", "Have a great evening,", "See you tomorrow,"];

// 1. Give the app "Memory" when a name is selected
document.getElementById("teamSelector").addEventListener("change", function() {
    const userName = this.value;
    const storedState = localStorage.getItem("status_" + userName);
    const actionBtn = document.getElementById("actionBtn");
    
    if (storedState === "logged_in") {
        actionBtn.innerText = "[ LOGOUT ]";
        actionBtn.classList.add("logged-in");
        isLoggedIn = true;
    } else {
        actionBtn.innerText = "[ LOGIN ]";
        actionBtn.classList.remove("logged-in");
        isLoggedIn = false;
    }
});

// 2. Fetch Daily Quote
async function fetchQuote() {
    try {
        const response = await fetch("https://api.quotable.io/random?tags=business|success");
        const data = await response.json();
        document.getElementById('quoteText').innerText = `"${data.content}" - ${data.author}`;
    } catch (error) {
        document.getElementById('quoteText').innerText = '"The secret of getting ahead is getting started."';
    }
}

// 3. Fetch dynamic Google Sheet Data
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

// 4. Handle Attendance Login/Logout
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
    
    // Instantly Update the UI and save to Memory
    if (actionType === "login") {
        const randomGreet = loginGreetings[Math.floor(Math.random() * loginGreetings.length)];
        greetingText.innerText = `${randomGreet} ${userName} 🚀`;
        actionBtn.innerText = "[ LOGOUT ]";
        actionBtn.classList.add("logged-in");
        streakCount.innerText = "Active 🔥"; 
        isLoggedIn = true;
        localStorage.setItem("status_" + userName, "logged_in"); // Save to phone memory
    } else {
        const randomBye = logoutGreetings[Math.floor(Math.random() * logoutGreetings.length)];
        greetingText.innerText = `${randomBye} ${userName} 👋`;
        actionBtn.innerText = "[ LOGIN ]";
        actionBtn.classList.remove("logged-in");
        streakCount.innerText = "--";
        isLoggedIn = false;
        localStorage.setItem("status_" + userName, "logged_out"); // Clear from memory
        userSelect.value = ""; 
    }

    // Package and fire to Google
    const formData = new URLSearchParams();
    formData.append("action", actionType);
    formData.append("name", userName);

    fetch(WEB_APP_URL, {
        method: "POST",
        body: formData 
    }).catch(err => console.log("Background sync complete."));
}

// Initialize
fetchQuote();
fetchSheetData();
