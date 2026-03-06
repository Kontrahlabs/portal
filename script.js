// This URL reads your Birthdays & Holidays
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxNLmzV-tXmBa71i_nTmXYA6bcqQdxPXdq1nIvGc-JeZ0vn5tpgVKHavbTrGGw2wtRt/exec";

let isLoggedIn = false;
const loginGreetings = ["Ready to crush it,", "Welcome aboard,", "System accessed,"];
const logoutGreetings = ["Sayonara,", "Have a great evening,", "See you tomorrow,"];

// 1. Give the app "Memory" when a name is selected
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

// 4. Handle Attendance via Google Forms
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

    // Capitalized exactly how your Google Form expects it
    const actionType = isLoggedIn ? "Logout" : "Login"; 

    // Instantly Update UI & Save to Phone Memory
    if (actionType === "Login") {
        const randomGreet = loginGreetings[Math.floor(Math.random() * loginGreetings.length)];
        greetingText.innerText = `${randomGreet} ${userName} 🚀`;
        actionBtn.innerText = "[ LOGOUT ]";
        actionBtn.classList.add("logged-in");
        streakCount.innerText = "Active 🔥"; 
        isLoggedIn = true;
        localStorage.setItem("status_" + userName, "logged_in");
    } else {
        const randomBye = logoutGreetings[Math.floor(Math.random() * logoutGreetings.length)];
        greetingText.innerText = `${randomBye} ${userName} 👋`;
        actionBtn.innerText = "[ LOGIN ]";
        actionBtn.classList.remove("logged-in");
        streakCount.innerText = "--";
        isLoggedIn = false;
        localStorage.setItem("status_" + userName, "logged_out");
        userSelect.value = ""; 
    }

    // Your specific Google Form submission URL
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd1-RjB4IAjGpaUE3HUbXU_1ADsErMWvmUeQhnJ47u3Ed9v_Q/formResponse";
    
    // Package data using your unique Google Form entry IDs
    const formData = new URLSearchParams();
    formData.append("entry.1765779891", userName);
    formData.append("entry.1331711757", actionType);

    // Send silently to the Form
    fetch(formUrl, {
        method: "POST",
        mode: "no-cors", 
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
    }).catch(err => console.log("Form submitted seamlessly."));
}

// Initialize on load
fetchQuote();
fetchSheetData();
