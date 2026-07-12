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
const form = document.querySelector("form");

if (form) {

    form.addEventListener("submit", function (e) {

        const required = form.querySelectorAll("[required]");

        let valid = true;

        required.forEach(input => {

            if (input.value.trim() === "") {

                valid = false;
                input.style.border = "2px solid red";

            } else {

                input.style.border = "1px solid #ccc";

            }

        });

        if (!valid) {
            e.preventDefault();
            alert("Please fill all required fields.");
        }

    });

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
// Trainer Search
// ================================
const search = document.getElementById("trainerSearch");

if (search) {

    search.addEventListener("keyup", () => {

        const value = search.value.toLowerCase();

        document.querySelectorAll(".trainer-card").forEach(card => {

            const text = card.textContent.toLowerCase();

            card.style.display =
                text.includes(value)
                    ? "block"
                    : "none";

        });

    });

}

// ================================
// Booking Form
// ================================
const bookingForm =
    document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", function (e) {

        const date =
            document.getElementById("date");

        if (date && date.value === "") {

            e.preventDefault();

            alert("Please select booking date.");

            return;

        }

        alert("Booking Successful!");

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
// Welcome Message
// ================================
window.addEventListener("load", () => {

    console.log("Welcome to Inclusive Fitness Platform!");

});

// ================================
// Current Year in Footer
// ================================
const year = document.getElementById("year");

if (year) {

    year.innerHTML =
        new Date().getFullYear();

}

