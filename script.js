// This URL reads your Birthdays & Holidays
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxNLmzV-tXmBa71i_nTmXYA6bcqQdxPXdq1nIvGc-JeZ0vn5tpgVKHavbTrGGw2wtRt/exec";

let isLoggedIn = false;
const loginGreetings = ["Ready to crush it,", "Welcome aboard,", "System accessed,"];
const logoutGreetings = ["Sayonara,", "Have a great evening,", "See you tomorrow,"];

// 1. Give the app "Memory"
document.getElementById("teamSelector").addEventListener("change", function() {
    const userName = this.value;
    const storedState = localStorage.getItem("status_" + userName);
    const actionBtn = document.getElementById("actionBtn");
    const streakCount = document.getElementById("streakCount");
    
    if (storedState === "logged_in") {
        actionBtn.innerText = "[ LOGOUT ]";
        actionBtn.classList.add("logged-in");
        streakCount.innerText = "Active 🔥";
        isLoggedIn = true;
    } else {
        actionBtn.innerText = "[ LOGIN ]";
        actionBtn.classList.remove("logged-in");
        streakCount.innerText = "--";
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

// 3. Fetch dynamic Google Sheet Data (Birthdays/Holidays)
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

// 4. THE BULLETPROOF GOOGLE FORM SUBMISSION
function submitToGoogleForm(userName, actionType) {
    // Create a hidden iframe
    const iframeName = "hidden_iframe_" + Math.random().toString(36).substring(7);
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Create a hidden HTML form pointing to your specific Google Form
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "
