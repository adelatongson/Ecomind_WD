
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global Firebase variables, initialized within the module scope
let app;
let auth;
let db;
let appId;

// Modal functions - Defined first to ensure they are available
window.showModal = function(message, callback) {
    console.log("Showing modal with message:", message);
    const modal = document.getElementById('myModal');
    const modalMessage = document.getElementById('modalMessage');
    if (modal && modalMessage) {
        modalMessage.textContent = message;
        modal.style.display = 'flex'; // Use flex to center
        modal.dataset.callback = callback ? 'true' : 'false';
        if (callback) {
            modal.callback = callback;
        }
    } else {
        console.error("Modal elements not found for showModal. Falling back to alert.");
        alert(message); // Fallback to alert if modal elements are missing
    }
};

window.closeModal = function() {
    console.log("Closing modal.");
    const modal = document.getElementById('myModal');
    if (modal) {
        modal.style.display = 'none';
        if (modal.dataset.callback === 'true' && typeof modal.callback === 'function') {
            console.log("Executing modal callback.");
            modal.callback();
            modal.callback = null; // Clear callback
            modal.dataset.callback = 'false';
        }
    } else {
        console.error("Modal element not found for closeModal.");
    }
};

try {
    const firebaseConfig = JSON.parse(window.__firebase_config);
    appId = window.__app_id;
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully on register page.");
} catch (e) {
    console.error("Critical error during Firebase setup:", e);
    // Use window.showModal or alert for user feedback
    window.showModal('A critical error occurred during Firebase setup: ' + e.message + '. Check console for details.');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Register page DOMContentLoaded event fired.");

    // DOM Element References
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerButton = document.getElementById('registerButton');
    const registerForm = document.getElementById('registerForm');

    // Sidebar/Hamburger Menu Logic (kept from your original code)
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebarContainer = document.getElementById('sidebar-container');
    const sidebarMenu = document.getElementById('sidebar-menu');

    if (hamburgerIcon && sidebarContainer && sidebarMenu) {
        hamburgerIcon.addEventListener('click', () => {
            sidebarContainer.classList.add('open');
            sidebarMenu.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }
    if (closeSidebarBtn && sidebarContainer && sidebarMenu) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebarContainer.classList.remove('open');
            sidebarMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    }
    if (sidebarContainer && sidebarMenu) {
        sidebarContainer.addEventListener('click', (event) => {
            if (event.target === sidebarContainer) {
                sidebarContainer.classList.remove('open');
                sidebarMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (sidebarContainer && sidebarMenu) {
                sidebarContainer.classList.remove('open');
                sidebarMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });

    // Default role (fixed as per your request)
    const selectedUserRole = 'student';

    function checkFormValidity() {
        console.log("checkFormValidity called for registration.");
        // Ensure all required elements exist
        if (!fullNameInput || !emailInput || !passwordInput || !confirmPasswordInput || !registerButton) {
            console.warn("One or more required input elements for registration form are missing.");
            return; // Exit if elements are not found
        }

        const fullNameValue = fullNameInput.value.trim();
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        const confirmPasswordValue = confirmPasswordInput.value.trim();

        let isFullNameValid = fullNameValue.length > 0;
        let isEmailValid = false;
        let isPasswordValid = passwordValue.length >= 6;
        let doPasswordsMatch = (passwordValue === confirmPasswordValue) && passwordValue.length > 0; // Passwords must match and not be empty
// Inside checkFormValidity()
// ... rest of your code
// Initialize Firebase as soon as the module loads
        // Email validation for all users (e.g., must end with @fit.edu.ph)
        const emailRegex = /^\S+@fit\.edu\.ph$/;
        isEmailValid = emailRegex.test(emailValue);

        const isValid = isFullNameValid && isEmailValid && isPasswordValid && doPasswordsMatch;
        registerButton.disabled = !isValid;

        console.log(`Validation State: Full Name Valid: ${isFullNameValid}, Email Valid: ${isEmailValid} (${emailValue}), Password Valid: ${isPasswordValid}, Passwords Match: ${doPasswordsMatch}, Overall Valid: ${isValid}, Register button disabled: ${registerButton.disabled}`);
    }

    // Attach listeners
    if (fullNameInput) fullNameInput.addEventListener('input', checkFormValidity);
    if (emailInput) emailInput.addEventListener('input', checkFormValidity);
    if (passwordInput) passwordInput.addEventListener('input', checkFormValidity);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', checkFormValidity);
    console.log("Input event listeners attached to registration fields.");

    // Handle registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log("Registration form submitted.");

            // Re-run validity check just before submission to be sure
            checkFormValidity();
            if (registerButton.disabled) {
                window.showModal('Please fill out all fields correctly.');
                return;
            }

            // Ensure Firebase services are initialized
            if (!auth || !db || !appId) {
                window.showModal('Firebase services are not fully initialized. Please refresh and try again, or check console for setup errors.');
                console.error("Firebase services (auth, db, appId) not ready:", { auth, db, appId });
                return;
            }

            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // Client-side validation (redundant if checkFormValidity is robust, but good final check)
            if (fullName.length === 0 || password.length < 6 || password !== confirmPasswordInput.value.trim() || !/^\S+@fit\.edu\.ph$/.test(email)) {
                window.showModal('Please ensure all fields are filled correctly, passwords match, and email is valid (@fit.edu.ph).');
                return;
            }

            try {
                console.log("Attempting Firebase registration for email:", email);
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const userId = user.uid;
                console.log("Firebase registration successful. User UID:", userId);

                // Store user profile in Firestore
                const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/user_profiles`, userId);
                console.log("Storing user profile in Firestore at:", userProfileRef.path);
                await setDoc(userProfileRef, {
                    fullName: fullName,
                    email: email,
                    role: selectedUserRole, // Always 'student'
                    registrationDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
                console.log("User profile saved to Firestore.");

                // Redirect to modulehomepage.html after successful registration
                window.showModal(`Registration successful! Welcome, ${fullName}.`, () => {
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userEmail', email);
                    sessionStorage.setItem('userType', selectedUserRole);
                    console.log("Redirecting to modulehomepage.html");
                    window.location.href = 'modulehomepage.html';
                });

            } catch (error) {
                let firebaseErrorMessage = 'Registration failed. Please try again.';
                if (error.code === 'auth/email-already-in-use') {
                    firebaseErrorMessage = 'This email is already registered. Please login or use a different email.';
                } else if (error.code === 'auth/weak-password') {
                    firebaseErrorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
                } else if (error.code === 'auth/invalid-email') {
                    firebaseErrorMessage = 'Invalid email format. Please use an email ending with @fit.edu.ph.'; // Specific message for the new regex
                } else {
                    firebaseErrorMessage = `An error occurred: ${error.message}`; // General fallback
                }
                console.error("Firebase Auth Registration Error:", error);
                window.showModal(firebaseErrorMessage);
            }
        });
    }

    // Password toggle function
    window.togglePassword = function() {
        console.log("Toggle password clicked.");
        const passwordField = document.getElementById('password');
        const confirmPasswordField = document.getElementById('confirmPassword');
        const toggleImg = document.getElementById('passwordToggleImg');
        const confirmToggleImg = document.getElementById('confirmPasswordToggleImg');

        if (passwordField && toggleImg) {
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleImg.src = 'https://placehold.co/20x20/FFFFFF/000000?text=Hide';
                toggleImg.alt = 'Hide password';
            } else {
                passwordField.type = 'password';
                toggleImg.src = 'https://placehold.co/20x20/FFFFFF/000000?text=Show';
                toggleImg.alt = 'Show password';
            }
        }
        if (confirmPasswordField && confirmToggleImg) {
            if (confirmPasswordField.type === 'password') {
                confirmPasswordField.type = 'text';
                confirmToggleImg.src = 'https://placehold.co/20x20/FFFFFF/000000?text=Hide';
                confirmToggleImg.alt = 'Hide password';
            } else {
                confirmPasswordField.type = 'password';
                confirmToggleImg.src = 'https://placehold.co/20x20/FFFFFF/000000?text=Show';
                confirmToggleImg.alt = 'Show password';
            }
        }
    };

    // Initial check to set button state on page load
    checkFormValidity();
});
