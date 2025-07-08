// js/auth.js

// --- Global Modal Functions (for consistent alerts) ---
window.showModal = function(message, callback) {
    const modal = document.getElementById('myModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalOkButton = document.getElementById('modalOkButton');

    if (modal && modalMessage && modalOkButton) {
        modalMessage.textContent = message;
        modal.style.display = 'flex'; // Use flex to center the modal
        modal.callback = callback; // Store callback function
    }
};

window.closeModal = function() {
    const modal = document.getElementById('myModal');
    if (modal) {
        modal.style.display = 'none';
        if (typeof modal.callback === 'function') {
            modal.callback(); // Execute the stored callback
            modal.callback = null; // Clear the callback
        }
    }
};

// --- Login Button to Avatar / Logout Functionality ---
function updateLoginStatusUI() {
    const loginStatusContainer = document.getElementById('login-status-container');
    const sidebarLoginItem = document.getElementById('sidebarLoginItem'); // For the sidebar login link
    const sidebarLogoutItem = document.getElementById('sidebarLogoutItem'); // For the sidebar logout link
    const sidebarLogoutButton = document.getElementById('sidebarLogoutButton'); // Specific logout button in sidebar

    if (!loginStatusContainer) {
        console.warn("login-status-container not found. Login/Avatar functionality may not work.");
        return;
    }

    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'; // Check login status
    const userType = sessionStorage.getItem('userType'); // 'student', 'admin', or null

    // Clear existing content to prevent duplication if called multiple times
    loginStatusContainer.innerHTML = '';

    if (isLoggedIn) {
        const avatarSrc = userType ? `images/${userType}-avatar.png` : 'images/default-avatar.png';

        const userInfoHtml = `
            <div class="user-avatar" id="userAvatarBtn">
                <img src="${avatarSrc}" alt="User Avatar">
            </div>
            <div id="profile-dropdown" class="profile-dropdown-content">
                <a href="profile.html">My Profile</a>
                <a href="#" id="logoutButton">Logout</a>
            </div>
        `;
        loginStatusContainer.insertAdjacentHTML('beforeend', userInfoHtml);

        // Attach event listeners to the newly created elements
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const logoutButton = document.getElementById('logoutButton');

        if (userAvatarBtn) {
            userAvatarBtn.addEventListener('click', toggleProfileMenu);
        }
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                logoutUser();
            });
        }

        // Update sidebar login/logout visibility
        if (sidebarLoginItem) sidebarLoginItem.style.display = 'none';
        if (sidebarLogoutItem) sidebarLogoutItem.style.display = 'list-item'; // Or 'block', 'flex', etc., depending on your CSS
        if (sidebarLogoutButton) {
            sidebarLogoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }

    } else {
        // If not logged in, display the login button
        const loginBtnHtml = `<a href="login.html" class="login-button" id="loginLink">Login</a>`;
        loginStatusContainer.insertAdjacentHTML('beforeend', loginBtnHtml);

        // Update sidebar login/logout visibility
        if (sidebarLoginItem) sidebarLoginItem.style.display = 'list-item'; // Or 'block', 'flex', etc.
        if (sidebarLogoutItem) sidebarLogoutItem.style.display = 'none';
    }
}

function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close the dropdown if the user clicks outside of it
window.addEventListener('click', function(event) {
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const dropdown = document.getElementById('profile-dropdown');

    // Check if the click is outside the dropdown AND outside the avatar button
    if (dropdown && !dropdown.contains(event.target) && (!userAvatarBtn || !userAvatarBtn.contains(event.target))) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});

function logoutUser() {
    sessionStorage.removeItem('isLoggedIn'); // Clear login status
    sessionStorage.removeItem('userEmail'); // Clear stored email
    sessionStorage.removeItem('userType'); // Clear stored user type
    // Optionally, clear module completion flags if they should reset on logout
    // For example: sessionStorage.removeItem('module1Completed');

    window.showModal('You have been logged out.', () => {
        window.location.href = 'homepage.html'; // Redirect to homepage or login page
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', updateLoginStatusUI);
