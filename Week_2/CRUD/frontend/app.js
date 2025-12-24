const API_URL = "http://localhost:3000";

// DOM Elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const toggleBtn = document.getElementById("toggleBtn");
const formTitle = document.getElementById("formTitle");
const toggleText = document.getElementById("toggleText");

// Toggle between Login and Register
let isLoginMode = true;

toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        formTitle.innerText = "Welcome Back";
        toggleText.innerHTML = `Don't have an account? <a href="#" id="toggleBtn" class="text-blue-600 font-bold hover:underline">Sign up</a>`;
        // Re-attach listener because innerHTML replaced the element
        document.getElementById("toggleBtn").addEventListener("click", arguments.callee);
    } else {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        formTitle.innerText = "Create Account";
        toggleText.innerHTML = `Already have an account? <a href="#" id="toggleBtn" class="text-blue-600 font-bold hover:underline">Sign in</a>`;
        document.getElementById("toggleBtn").addEventListener("click", arguments.callee);
    }
});

// --- HANDLE REGISTER ---
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire("Success", "Account created! Please login.", "success");
            // Switch to login mode
            toggleBtn.click();
        } else {
            Swal.fire("Error", data.error || "Registration failed", "error");
        }
    } catch (error) {
        Swal.fire("Error", "Server connection failed", "error");
    }
});

// --- HANDLE LOGIN ---
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Save Token to Browser Storage (Local Storage)
            localStorage.setItem("token", data.token);
            
            Swal.fire({
                title: "Login Successful!",
                text: "Redirecting to dashboard...",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "dashboard.html";
            });
        } else {
            Swal.fire("Error", data.error || "Invalid credentials", "error");
        }
    } catch (error) {
        Swal.fire("Error", "Server connection failed", "error");
    }
});