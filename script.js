
// ==========================================
// HABALGO RIDER REGISTRATION SYSTEM
// JavaScript
// ==========================================

const STORAGE_KEY = "habalgo_riders";
const SESSION_KEY = "habalgo_session";

// ==========================================
// LOCAL STORAGE FUNCTIONS
// ==========================================

function getRiders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveRiders(riders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(riders));
}

function currentRider() {
    const email = sessionStorage.getItem(SESSION_KEY);

    return getRiders().find(rider => rider.email === email);
}

function updateRider(updated) {
    const riders = getRiders();

    const index = riders.findIndex(
        rider => rider.email === updated.email
    );

    if (index !== -1) {
        riders[index] = updated;
        saveRiders(riders);
    }
}

// ==========================================
// LOGIN AND REGISTRATION PAGE
// ==========================================

function showLogin() {
    document.getElementById("loginCard").classList.remove("hidden");
    document.getElementById("registerCard").classList.add("hidden");
}

function showRegister() {
    document.getElementById("loginCard").classList.add("hidden");
    document.getElementById("registerCard").classList.remove("hidden");
}

function togglePassword(id, button) {
    const input = document.getElementById(id);

    const isPassword = input.type === "password";

    input.type = isPassword ? "text" : "password";
    button.textContent = isPassword ? "HIDE" : "SHOW";
}

function showMessage(id, text, type) {
    const box = document.getElementById(id);

    box.textContent = text;
    box.className = "message " + type;
}

// ==========================================
// RIDER REGISTRATION
// ==========================================

document.getElementById("registerForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const phone = document.getElementById("regPhone").value.trim();
    const address = document.getElementById("regAddress").value.trim();
    const motorcycle = document.getElementById("regMotorcycle").value.trim();
    const plate = document.getElementById("regPlate").value.trim();

    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;

    // Check password length
    if (password.length < 8) {
        showMessage(
            "registerMessage",
            "Password must contain at least 8 characters.",
            "error"
        );
        return;
    }

    // Check password confirmation
    if (password !== confirm) {
        showMessage(
            "registerMessage",
            "Passwords do not match!",
            "error"
        );
        return;
    }

    // Check existing email
    const riders = getRiders();

    if (riders.some(rider => rider.email === email)) {
        showMessage(
            "registerMessage",
            "This email is already registered. Please sign in.",
            "error"
        );
        return;
    }

    // Create rider account
    const rider = {
        name: name,
        email: email,
        phone: phone,
        address: address,
        motorcycle: motorcycle,
        plate: plate,

        // Demo only: use server-side password hashing in production.
        password: password,

        status: "Pending",

        documents: {
            license: false,
            orcr: false,
            id: false
        },

        createdAt: new Date().toLocaleDateString()
    };

    riders.push(rider);
    saveRiders(riders);

    showMessage(
        "registerMessage",
        "Registration successful! You can now sign in.",
        "success"
    );

    document.getElementById("registerForm").reset();

    setTimeout(function() {
        showLogin();
    }, 1500);

});


// ==========================================
// RIDER LOGIN
// ==========================================

document.getElementById("loginForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    const rider = getRiders().find(function(rider) {

        return rider.email === email &&
               rider.password === password;

    });

    if (!rider) {

        showMessage(
            "loginMessage",
            "Invalid email or password. Please try again.",
            "error"
        );

        return;
    }

    // Create session
    sessionStorage.setItem(SESSION_KEY, email);

    // Remember email on this browser
    if (document.getElementById("remember").checked) {

        localStorage.setItem("habalgo_remember", email);

    } else {

        localStorage.removeItem("habalgo_remember");

    }

    openDashboard();

});


// ==========================================
// FORGOT PASSWORD
// ==========================================

function forgotPassword() {

    const email = prompt("Enter your registered email address:");

    if (!email) return;

    const rider = getRiders().find(function(rider) {

        return rider.email === email.trim().toLowerCase();

    });

    if (rider) {

        alert(
            "Account found! Please contact the HabalGo administrator to reset your password."
        );

    } else {

        alert("Email address is not registered.");

    }
}


// ==========================================
// OPEN RIDER DASHBOARD
// ==========================================

function openDashboard() {

    const rider = currentRider();

    if (!rider) {
        logout();
        return;
    }

    document.getElementById("auth").classList.add("hidden");

    document.getElementById("dashboard")
        .classList.remove("hidden");

    // Display rider information
    document.getElementById("welcomeName").textContent = rider.name;

    document.getElementById("topName").textContent = rider.name;

    document.getElementById("topAvatar").textContent =
        rider.name.charAt(0).toUpperCase();

    // Fill profile information
    document.getElementById("profileName").value = rider.name;

    document.getElementById("profileEmail").value = rider.email;

    document.getElementById("profilePhone").value = rider.phone;

    document.getElementById("profileAddress").value = rider.address;

    document.getElementById("profileMotorcycle").value = rider.motorcycle;

    document.getElementById("profilePlate").value = rider.plate;

    updateDashboard();

}


// ==========================================
// UPDATE DASHBOARD INFORMATION
// ==========================================

function updateDashboard() {

    const rider = currentRider();

    if (!rider) return;

    const docs = rider.documents;

    // Count submitted documents
    const count = [
        docs.license,
        docs.orcr,
        docs.id
    ].filter(Boolean).length;

    const percentage = Math.round((count / 3) * 100);

    document.getElementById("documentCount").textContent =
        count + " / 3";

    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        percentage + "% Completed";

    // Update checklist
    document.getElementById("licenseCheck").textContent =
        docs.license ? "✓ Submitted" : "Pending";

    document.getElementById("orcrCheck").textContent =
        docs.orcr ? "✓ Submitted" : "Pending";

    document.getElementById("idCheck").textContent =
        docs.id ? "✓ Submitted" : "Pending";

    ["licenseCheck", "orcrCheck", "idCheck"].forEach(function(id) {

        const element = document.getElementById(id);

        element.className =
            element.textContent.includes("Submitted")
            ? "check"
            : "pending";

    });

    // Update registration status
    document.getElementById("statusCard").textContent =
        rider.status;

    document.getElementById("statusPill").textContent =
        rider.status.toUpperCase();

    if (rider.status === "Approved") {

        document.getElementById("statusDescription").textContent =
            "Congratulations! Your rider registration has been approved.";

    } else if (rider.status === "Rejected") {

        document.getElementById("statusDescription").textContent =
            "Your application needs attention. Please contact the administrator.";

    } else {

        document.getElementById("statusDescription").textContent =
            "Your application is waiting for review by the administrator.";

    }

}


// ==========================================
// EDIT RIDER PROFILE
// ==========================================

document.getElementById("profileForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const rider = currentRider();

    if (!rider) return;

    rider.name = document.getElementById("profileName").value.trim();

    rider.phone = document.getElementById("profilePhone").value.trim();

    rider.address = document.getElementById("profileAddress").value.trim();

    rider.motorcycle =
        document.getElementById("profileMotorcycle").value.trim();

    rider.plate =
        document.getElementById("profilePlate").value.trim();

    updateRider(rider);

    alert("Your profile has been updated successfully!");

    openDashboard();

});


// ==========================================
// DOCUMENT UPLOAD
// ==========================================

document.getElementById("documentsForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const rider = currentRider();

    if (!rider) return;

    const fields = [
        {
            id: "licenseFile",
            key: "license",
            label: "licenseFileName"
        },
        {
            id: "orcrFile",
            key: "orcr",
            label: "orcrFileName"
        },
        {
            id: "idFile",
            key: "id",
            label: "idFileName"
        }
    ];

    let uploaded = 0;

    for (const item of fields) {

        const file = document.getElementById(item.id).files[0];

        if (!file) continue;

        // Validate file format
        const allowed = /\.(jpg|jpeg|png|pdf)$/i.test(file.name);

        if (!allowed) {

            alert("Invalid file format: " + file.name);

            return;
        }

        // Validate file size (5MB maximum)
        if (file.size > 5 * 1024 * 1024) {

            alert("File must not exceed 5MB: " + file.name);

            return;
        }

        rider.documents[item.key] = true;

        document.getElementById(item.label).textContent =
            "Selected: " + file.name;

        uploaded++;

    }

    if (uploaded === 0) {

        alert("Please select at least one valid document.");

        return;
    }

    updateRider(rider);

    updateDashboard();

    alert(
        "Document submission status updated successfully! " +
        "This demo does not store the actual uploaded files."
    );

    document.getElementById("documentsForm").reset();

});


// ==========================================
// DASHBOARD NAVIGATION
// ==========================================

function navigate(section, element) {

    // Hide all sections
    document.querySelectorAll(".section").forEach(function(s) {

        s.classList.remove("active");

    });

    // Remove active navigation
    document.querySelectorAll(".nav-item").forEach(function(n) {

        n.classList.remove("active");

    });

    // Display selected section
    document.getElementById(section).classList.add("active");

    // Highlight selected menu
    if (element) {

        element.classList.add("active");

    }

    // Close mobile sidebar
    document.getElementById("sidebar").classList.remove("open");

}


// Navigate using section name
function navigateByName(section) {

    const items = document.querySelectorAll(".nav-item");

    const map = {
        overview: 0,
        profile: 1,
        documents: 2,
        notifications: 3
    };

    navigate(section, items[map[section]]);

}


// ==========================================
// MOBILE SIDEBAR
// ==========================================

function toggleSidebar() {

    document.getElementById("sidebar")
        .classList.toggle("open");

}


// ==========================================
// RIDER LOGOUT
// ==========================================

function logout() {

    sessionStorage.removeItem(SESSION_KEY);

    document.getElementById("dashboard")
        .classList.add("hidden");

    document.getElementById("auth")
        .classList.remove("hidden");

    document.getElementById("loginForm").reset();

    showLogin();

}


// ==========================================
// RESTORE SESSION
// ==========================================

window.addEventListener("load", function() {

    const remembered = localStorage.getItem("habalgo_remember");

    if (remembered && !sessionStorage.getItem(SESSION_KEY)) {

        const rider = getRiders().find(function(rider) {

            return rider.email === remembered;

        });

        if (rider) {

            sessionStorage.setItem(SESSION_KEY, remembered);

        }

    }

    if (sessionStorage.getItem(SESSION_KEY)) {

        openDashboard();

    }

});
