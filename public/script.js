// ================================
// Inclusive Fitness Platform
// script.js
// ================================

// ================================
// Mobile Navigation
// ================================
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

// ================================
// Dark Mode
// ================================
const darkBtn = document.getElementById("darkMode");

if (darkBtn) {

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    darkBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }

    });

}

// ================================
// Password Show / Hide
// ================================
document.querySelectorAll(".password").forEach(input => {

    const btn = document.createElement("span");

    btn.innerHTML = "👁";
    btn.style.cursor = "pointer";
    btn.style.marginLeft = "10px";

    input.after(btn);

    btn.addEventListener("click", () => {

        if (input.type === "password") {
            input.type = "text";
            btn.innerHTML = "🙈";
        } else {
            input.type = "password";
            btn.innerHTML = "👁";
        }

    });

});

// ================================
// Login & Signup Validation
// ================================
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

const validateRequiredFields = (form) => {
    const requiredFields = form.querySelectorAll("[required]");
    let valid = true;

    requiredFields.forEach(input => {
        const isValid = input.type === "checkbox" ? input.checked : input.value.trim() !== "";

        if (!isValid) {
            valid = false;
            input.style.border = "2px solid red";
        } else {
            input.style.border = "1px solid #ccc";
        }
    });

    return valid;
};

const handleAuthSubmit = (form, endpoint, successUrl, successMessage) => {
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!validateRequiredFields(form)) {
            alert("Please fill all required fields.");
            return;
        }

        const payload = Object.fromEntries(new FormData(form).entries());
        const submitButton = form.querySelector("button[type='submit']");

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || "Authentication failed.");
            }

            if (data.user) {
                localStorage.setItem("currentUser", JSON.stringify(data.user));
            }

            alert(data.message || successMessage);
            window.location.assign(successUrl);
        } catch (error) {
            alert(error.message || "Authentication failed.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
};

if (signupForm) {
    handleAuthSubmit(signupForm, "/api/auth/signup", "login.html", "Account created successfully.");
}

if (loginForm) {
    handleAuthSubmit(loginForm, "/api/auth/login", "index.html", "Login successful.");
}

// ================================
// Email Validation
// ================================
const emailInput = document.querySelector("#email");

if (emailInput) {

    emailInput.addEventListener("blur", () => {

        const email = emailInput.value;

        const pattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!pattern.test(email)) {

            alert("Invalid Email Address");

        }

    });

}

// ================================
// Dynamically Render Trainers
// ================================
const trainersGrid = document.getElementById("trainers-grid");
if (trainersGrid) {
    const renderTrainers = (trainersList) => {
        trainersGrid.innerHTML = "";
        trainersList.forEach(trainer => {
            let price = "$20 / class";
            let desc = "Personalized adaptive fitness session customized to your needs and goals.";
            let tags = ["Accessible", "Adaptive"];
            let badge = trainer.specialization;

            if (trainer.name.toLowerCase().includes("sarah")) {
                price = "$15 / class";
                desc = "A restorative session focusing on flexibility and breathwork. Fully compatible with wheelchairs and chairs.";
                tags = ["Wheelchair Access", "Low Sensory"];
                badge = "Adaptive Yoga";
            } else if (trainer.name.toLowerCase().includes("alex")) {
                price = "$25 / class";
                desc = "High energy strength training. The instructor communicates fluently in ASL and uses visual cues.";
                tags = ["ASL Certified", "Visual Cues"];
                badge = "Strength";
            } else if (trainer.name.toLowerCase().includes("cosmic")) {
                price = "Free/Donation";
                desc = "A fun, low-pressure movement group class designed specifically for neurodivergent individuals.";
                tags = ["No Loud Music", "Structure Provided"];
                badge = "Mobility";
            }

            const card = document.createElement("article");
            card.className = "card trainer-card";
            card.style.backgroundColor = "rgba(0, 0, 0, 0.50)";
            card.innerHTML = `
                <div class="card-badge">${badge}</div>
                <h3>${trainer.name}</h3>
                <p class="instructor">${trainer.specialization} (${trainer.experience} yrs exp)</p>
                <p class="description">${desc}</p>
                <div class="tags">
                    ${tags.map(t => `<span class="tag">${t}</span>`).join("")}
                </div>
                <div class="card-footer">
                    <span class="price">${price}</span>
                    <button class="btn-book" onclick="location.href='booking.html?trainer=${encodeURIComponent(trainer.name)}'">Book Slot</button>
                </div>
            `;
            trainersGrid.appendChild(card);
        });
    };

    fetch("/trainers")
        .then(res => res.json())
        .then(data => {
            const loadingEl = document.getElementById("trainers-loading");
            if (loadingEl) loadingEl.remove();
            if (data.success && data.trainers && data.trainers.length > 0) {
                renderTrainers(data.trainers);
            } else {
                trainersGrid.innerHTML = "<p style='color:aquamarine;padding:20px;'>No trainers available at the moment.</p>";
            }
        })
        .catch(err => {
            console.error("Error loading trainers:", err);
            trainersGrid.innerHTML = "<p style='color:tomato;padding:20px;'>Failed to load trainers. Please refresh the page.</p>";
        });
}

// ================================
// Trainer Search
// ================================
const search = document.getElementById("trainerSearch");

if (search) {
    search.addEventListener("keyup", () => {
        const value = search.value.toLowerCase();
        document.querySelectorAll(".trainer-card").forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(value) ? "block" : "none";
        });
    });
}

// ================================
// Booking Form Pre-fill & AJAX Submit
// ================================
const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {
    // Set minimum date to today
    const dateInput = document.getElementById("booking-date");
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.min = today;
    }

    // Parse URL for trainer name
    const params = new URLSearchParams(window.location.search);
    const trainerParam = params.get("trainer");
    const trainerSelect = document.getElementById("trainer");

    const updateSelectedTrainerCard = (trainerName) => {
        const container = document.getElementById("selected-trainer-container");
        const nameEl = document.getElementById("selected-trainer-name");
        const specEl = document.getElementById("selected-trainer-specialization");
        const avatarEl = document.getElementById("trainer-avatar");

        if (container && nameEl && specEl && trainerName) {
            nameEl.textContent = trainerName;
            avatarEl.textContent = trainerName.charAt(0).toUpperCase();

            let spec = "Inclusive Fitness Coach";
            if (trainerName.toLowerCase().includes("sarah")) spec = "Adaptive Yoga Instructor";
            else if (trainerName.toLowerCase().includes("alex")) spec = "Deaf-Friendly HIIT Coach";
            else if (trainerName.toLowerCase().includes("cosmic")) spec = "Neurodivergent Movement Guide";
            
            specEl.textContent = spec;
            container.style.display = "block";
        } else if (container) {
            container.style.display = "none";
        }
    };

    if (trainerSelect) {
        if (trainerParam) {
            let found = false;
            for (let i = 0; i < trainerSelect.options.length; i++) {
                if (trainerSelect.options[i].value.toLowerCase().includes(trainerParam.toLowerCase()) || 
                    trainerParam.toLowerCase().includes(trainerSelect.options[i].value.toLowerCase())) {
                    trainerSelect.selectedIndex = i;
                    found = true;
                    break;
                }
            }
            if (!found) {
                const opt = document.createElement("option");
                opt.value = trainerParam;
                opt.text = trainerParam;
                opt.selected = true;
                trainerSelect.appendChild(opt);
            }
            updateSelectedTrainerCard(trainerParam);
        }

        trainerSelect.addEventListener("change", () => {
            updateSelectedTrainerCard(trainerSelect.value);
        });
    }

    bookingForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const fullName = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const trainer = document.getElementById("trainer").value;
        const bookingDate = document.getElementById("booking-date").value;
        const bookingTime = document.getElementById("booking-time").value;

        if (!fullName || !email || !trainer || !bookingDate || !bookingTime) {
            alert("Please fill all required fields.");
            return;
        }

        const payload = {
            fullName,
            email,
            trainer,
            bookingDate,
            bookingTime
        };

        fetch("/booking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Booking Successful! Reference ID: " + data.bookingId);
                window.location.href = "index.html";
            } else {
                alert("Booking Failed: " + data.message);
            }
        })
        .catch(err => {
            console.error("Booking error:", err);
            alert("An error occurred during booking. Please try again.");
        });
    });
}

// ================================
// Smooth Scroll
// ================================
document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (e) {

        const target =
            document.querySelector(this.getAttribute("href"));

        if (target) {

            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});

// ================================
// Scroll To Top
// ================================
const topBtn = document.getElementById("topBtn");

if (topBtn) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            topBtn.style.display = "block";

        } else {

            topBtn.style.display = "none";

        }

    });

    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });

    });

}

// ================================
// Active Navigation Link
// ================================
const currentPage =
    location.pathname.split("/").pop();

document.querySelectorAll("nav a").forEach(link => {

    if (link.getAttribute("href") === currentPage) {

        link.classList.add("active");

    }

});

// ================================
// User Menu Rendering
// ================================
function renderUserMenu() {
  const menuDiv = document.getElementById('user-menu');
  const userData = localStorage.getItem('currentUser');
  const loginLinks = document.querySelectorAll('.nav-link-login');
  const signUpBtn = document.querySelector('li a.btn-primary'); // first btn-primary link in nav
  if (menuDiv) {
    if (userData) {
      const user = JSON.parse(userData);
      const displayName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
      menuDiv.innerHTML = `
        <div class="dropdown">
          <button class="dropbtn">${displayName} &#9662;</button>
          <div class="dropdown-content">
            <a href="profile.html">My Profile</a>
            <a href="#" id="logoutBtn">Logout</a>
          </div>
        </div>`;
      // Hide login and signup links
      loginLinks.forEach(el => el.classList.add('hidden'));
      if (signUpBtn) signUpBtn.classList.add('hidden');
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('currentUser');
          window.location.reload();
        });
      }
    } else {
      menuDiv.innerHTML = `
        <a href="login.html" class="nav-link-login">Log In</a>
        <a href="sign-up.html" class="btn btn-primary"><span aria-hidden="true">👤</span> Sign Up</a>`;
      // Ensure login links are visible
      loginLinks.forEach(el => el.classList.remove('hidden'));
      if (signUpBtn) signUpBtn.classList.remove('hidden');
    }
  }
}
window.addEventListener('load', renderUserMenu);
// ================================
// Welcome Message
// ================================
window.addEventListener("load", () => {

    console.log("Welcome to Inclusive Fitness Platform!");

});

// ================================
// Profile Dashboard
// ================================
const profileDashboard = document.querySelector(".profile-dashboard-main");

if (profileDashboard) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileAvatar = document.getElementById("profileAvatarLarge");
    const preferenceSelect = document.getElementById("dashboard-workout-pref");
    const preferenceForm = document.getElementById("updatePreferenceForm");
    const bookingsContainer = document.getElementById("bookingsListContainer");
    const recommendationsGrid = document.getElementById("recommendationsGrid");
    const recommendationsDesc = document.getElementById("recommendationsDesc");

    const recommendationMap = {
        seated: [
            { title: "Seated Strength Flow", subtitle: "Chair-friendly strength and mobility" },
            { title: "Gentle Chair Yoga", subtitle: "Breathwork and flexibility" }
        ],
        "low-impact": [
            { title: "Joint-Friendly Mobility", subtitle: "Low strain, high comfort" },
            { title: "Recovery Stretch Circuit", subtitle: "Calm and restorative" }
        ],
        "sensory-calm": [
            { title: "Low-Sensory Reset", subtitle: "Quiet pacing with optional pauses" },
            { title: "Mindful Movement", subtitle: "Gentle and predictable" }
        ],
        "full-mobility": [
            { title: "Adaptive HIIT", subtitle: "Visual cues and energetic pacing" },
            { title: "Full-Range Strength", subtitle: "Built for confidence and motion" }
        ],
        "not-sure": [
            { title: "Explore Everything", subtitle: "A sampler of accessible options" },
            { title: "Balanced Starter Plan", subtitle: "A mix of strength and calm" }
        ]
    };

    const renderProfile = () => {
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
        const displayName = user.name || "User";
        const displayEmail = user.email || "user@example.com";
        const preference = user.preference || "";

        if (profileName) profileName.textContent = displayName;
        if (profileEmail) profileEmail.textContent = displayEmail;
        if (profileAvatar) profileAvatar.textContent = displayName.charAt(0).toUpperCase();
        if (preferenceSelect) preferenceSelect.value = preference;

        if (bookingsContainer) {
            bookingsContainer.innerHTML = `
                <div class="card">
                    <h3>Upcoming Session</h3>
                    <p>Welcome back! Your next accessible session will appear here once booked.</p>
                </div>
            `;
        }

        if (recommendationsGrid) {
            const options = recommendationMap[preference] || recommendationMap["not-sure"];
            recommendationsGrid.innerHTML = options.map(item => `
                <article class="card">
                    <h3>${item.title}</h3>
                    <p>${item.subtitle}</p>
                </article>
            `).join("");
        }

        if (recommendationsDesc) {
            recommendationsDesc.textContent = preference
                ? `Based on your preference, these are the classes we recommend for you.`
                : "Select a preference to see recommendations.";
        }
    };

    if (preferenceForm) {
        preferenceForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const updatedUser = {
                ...currentUser,
                preference: preferenceSelect ? preferenceSelect.value : ""
            };
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            renderProfile();
            alert("Preferences updated.");
        });
    }

    renderProfile();
}

// ================================
// Current Year in Footer
// ================================
const year = document.getElementById("year");

if (year) {

    year.innerHTML =
        new Date().getFullYear();

}

