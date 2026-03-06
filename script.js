// This URL still reads your Birthdays & Holidays
const WEB_APP_URL = "https://script.google.com/macros/library/d/1bCqOoT4RbW8BtexFGYlNeuGdBUjzUzg67ZOkCs10dNBFYPjUSbKaAeXv/3";

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

// 2. Fetch dynamic Google Sheet Data (Birthdays & Holidays)
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
        console.error("Could not load calendar data.");
        document.getElementById('nextBirthday').innerText = "Offline";
        document.getElementById('nextHoliday').innerText = "Offline";
    }
}

// 3. Handle Attendance Login/Logout via Google Forms
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

    // Capitalized to perfectly match the options in your Google Form
    const actionType = isLoggedIn ? "Logout" : "Login"; 

    const originalBtnText = actionBtn.innerText;
    actionBtn.innerText = "[ PROCESSING... ]";
    actionBtn.disabled = true;

    // Your specific Google Form submission URL
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd1-RjB4IAjGpaUE3HUbXU_1ADsErMWvmUeQhnJ47u3Ed9v_Q/formResponse";
    
    // Package the data using your unique entry IDs
    const formData = new URLSearchParams();
    formData.append("entry.1765779891", userName);
    formData.append("entry.1331711757", actionType);

    try {
        // Send silently to the Form
        await fetch(formUrl, {
            method: "POST",
            mode: "no-cors", // This line is the magic that stops the Google security block
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        });

        // Update UI based on action
        if (actionType === "Login") {
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
        alert("Network error: Please check your internet connection.");
    } finally {
        actionBtn.disabled = false;
        if(!isLoggedIn) actionBtn.innerText = "[ LOGIN ]";
    }
}

// Initialize everything on load
fetchQuote();
fetchSheetData();
