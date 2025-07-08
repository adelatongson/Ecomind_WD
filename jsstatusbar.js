<script>
    // This inline script remains in the <head> or at the top of your body
    // to ensure Firebase config is available before the main module script runs.
    window.__firebase_config = JSON.stringify({
        apiKey: "AIzaSyCXhfb3vyz3uWd-4p3t4UudLPzT-PD9JtE",
        authDomain: "ecomind-164ad.firebaseapp.com",
        projectId: "ecomind-164ad",
        storageBucket: "ecomind-164ad.firebasestorage.app",
        messagingSenderId: "342215046607",
        appId: "1:342215046607:web:3b7465bc2a846acb000eba"
    });
    window.__app_id = "1:342215046607:web:3b7465bc2a846acb000eba";
</script>
        <script type="module">
    // Firebase Imports
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
    import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

    // Global Firebase variables
    let app;
    let auth;
    let db;
    let currentUserId = null;
    let isAuthReady = false; // Flag to indicate if Firebase auth state has been initially checked

    // --- Firebase Initialization & Authentication State Management ---
    try {
        let firebaseConfig = {};
        let appId = 'default-app-id'; // Fallback, primarily overridden by window.__app_id

        if (typeof window.__firebase_config !== 'undefined' && window.__firebase_config) {
            try {
                firebaseConfig = JSON.parse(window.__firebase_config);
                console.log("Parsed firebaseConfig from global window.");
            } catch (parseError) {
                console.error("Error parsing __firebase_config:", parseError);
                window.showModal("Firebase configuration parsing error. Please check the Canvas environment settings.");
                throw new Error("Firebase config parsing failed.");
            }
        } else {
            console.warn("__firebase_config is undefined or empty. Firebase will not be initialized with proper config.");
            window.showModal("Firebase configuration is missing. Please ensure your Canvas environment provides it.");
            throw new Error("Firebase config missing.");
        }

        if (typeof window.__app_id !== 'undefined' && window.__app_id) {
            appId = window.__app_id;
            console.log("App ID from global window:", appId);
        } else {
            console.warn("__app_id is undefined or empty. Using default-app-id.");
        }

       if (Object.keys(firebaseConfig).length > 0) {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            console.log("Firebase initialized successfully. App, Auth, and DB instances created.");

            // Listen for authentication state changes
            onAuthStateChanged(auth, async (user) => {
                console.log("Auth state changed. User:", user ? user.uid : "null");

                // Get references to all relevant UI elements for TOP NAV
                const loginLink = document.getElementById('loginLink');
                const userAvatarContainer = document.getElementById('userAvatarContainer');
                const userAvatarImg = document.getElementById('userAvatarImg');
                const userDropdownMenu = document.getElementById('userDropdownMenu');
                const logoutButton = document.getElementById('logoutButton');
                const profileLinkDropdown = document.getElementById('profileLinkDropdown');

                // Get references to all relevant UI elements for SIDEBAR
                const sidebarLoginListItem = document.getElementById('sidebarLoginListItem');
                const sidebarUserAvatarListItem = document.getElementById('sidebarUserAvatarListItem');
                const sidebarUserAvatarImg = document.getElementById('sidebarUserAvatarImg');
                const sidebarLogoutButton = document.getElementById('sidebarLogoutButton');
                const sidebarProfileLinkDropdown = document.getElementById('sidebarProfileLinkDropdown');

                 if (user) {
                    // User is signed in
                    currentUserId = user.uid;
                    const userIdDisplay = document.getElementById('userIdDisplay'); // Assuming this exists for debugging
                    if (userIdDisplay) userIdDisplay.textContent = `User ID: ${currentUserId}`;

                    // --- Top Navigation UI Update (Logged In) ---
                    if (loginLink) loginLink.classList.add('hidden');
                    if (userAvatarContainer) {
                        userAvatarContainer.classList.remove('hidden');
                        if (userAvatarImg) {
                            userAvatarImg.src = user.photoURL || `https://placehold.co/40x40/4CAF50/FFFFFF?text=${user.email ? user.email.charAt(0).toUpperCase() : 'U'}`;
                            userAvatarImg.alt = user.displayName || 'User Avatar';
                        }
                        userAvatarContainer.onclick = toggleUserDropdown;
                    }
                    if (logoutButton) logoutButton.onclick = handleLogout;
                    if (profileLinkDropdown) profileLinkDropdown.href = `profile.html?uid=${user.uid}`;

                    // --- Sidebar Navigation UI Update (Logged In) ---
                    if (sidebarLoginListItem) sidebarLoginListItem.classList.add('hidden');
                    if (sidebarUserAvatarListItem) {
                        sidebarUserAvatarListItem.classList.remove('hidden');
                        if (sidebarUserAvatarImg) {
                            sidebarUserAvatarImg.src = user.photoURL || `https://placehold.co/40x40/4CAF50/FFFFFF?text=${user.email ? user.email.charAt(0).toUpperCase() : 'U'}`;
                            sidebarUserAvatarImg.alt = user.displayName || 'User Avatar';
                        }
                    }
                    if (sidebarLogoutButton) sidebarLogoutButton.onclick = handleLogout;
                    if (sidebarProfileLinkDropdown) sidebarProfileLinkDropdown.href = `profile.html?uid=${user.uid}`;

                    // --- Firestore User Profile Management ---
                    const userProfileRef = doc(db, `artifacts/${appId}/users/${currentUserId}/user_profiles`, currentUserId);
                    try {
                        const userProfileSnap = await getDoc(userProfileRef);
                        if (!userProfileSnap.exists()) {
                            await setDoc(userProfileRef, {
                                email: user.email || null,
                                displayName: user.displayName || null,
                                photoURL: user.photoURL || null,
                                role: user.isAnonymous ? 'anonymous' : 'standard',
                                registrationDate: new Date().toISOString(),
                            }, { merge: true });
                            console.log("Created new user profile for:", currentUserId);
                        }
                        await setDoc(userProfileRef, {
                            lastLogin: new Date().toISOString()
                        }, { merge: true });
                        console.log("Last login updated for user:", currentUserId);
                    } catch (error) {
                        console.error("Error ensuring/updating user profile in Firestore:", error);
                        window.showModal('Error updating user profile: ' + error.message);
                    }

                } else {
                    // User is signed out
                    currentUserId = null;
                    const userIdDisplay = document.getElementById('userIdDisplay');
                    if (userIdDisplay) userIdDisplay.textContent = 'Not logged in';

                    // --- Top Navigation UI Update (Logged Out) ---
                    if (loginLink) {
                        loginLink.classList.remove('hidden');
                        loginLink.textContent = 'Login';
                        loginLink.href = 'login.html';
                        loginLink.onclick = null;
                    }
                    if (userAvatarContainer) userAvatarContainer.classList.add('hidden');
                    if (userDropdownMenu) userDropdownMenu.classList.remove('show');

                    // --- Sidebar Navigation UI Update (Logged Out) ---
                    if (sidebarLoginListItem) {
                        sidebarLoginListItem.classList.remove('hidden');
                        const sidebarLoginLink = document.getElementById('sidebarLoginLink');
                        if (sidebarLoginLink) {
                            sidebarLoginLink.textContent = 'Login';
                            sidebarLoginLink.href = 'login.html';
                            sidebarLoginLink.onclick = null;
                        }
                    }
                    if (sidebarUserAvatarListItem) sidebarUserAvatarListItem.classList.add('hidden');
                }
                isAuthReady = true;
                console.log("Firebase Auth state initial check complete (isAuthReady = true).");
            });
        } else {
            console.error("Firebase config is empty after parsing. Firebase will not be initialized.");
            const userIdDisplay = document.getElementById('userIdDisplay');
            if (userIdDisplay) userIdDisplay.textContent = 'Firebase not initialized (config empty)';
            window.showModal("Firebase configuration is empty. Please ensure your Canvas environment provides a valid config.");
        }
    } catch (e) {
        console.error("Critical error during Firebase setup:", e);
        window.showModal('A critical error occurred during Firebase setup: ' + e.message + '. Check console for details.');
        const userIdDisplay = document.getElementById('userIdDisplay');
        if (userIdDisplay) userIdDisplay.textContent = 'Firebase critical error';
    }

    // --- Logout Function ---
    async function handleLogout(e) {
        e.preventDefault();
        console.log("Logout button clicked.");

        if (!auth) {
            window.showModal('Firebase Auth is not initialized. Cannot log out.');
            return;
        }
        try {
            await signOut(auth);
            localStorage.removeItem('token');
            window.showModal('You have been logged out.', () => {
                window.location.href = 'login.html';
            });
        } catch (error) {
            console.error("Error during logout:", error);
            window.showModal('Logout failed: ' + error.message);
        }
    }

    // --- User Avatar Dropdown Toggle (for Top Nav) ---
    function toggleUserDropdown() {
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        if (userDropdownMenu) {
            userDropdownMenu.classList.toggle('show');
        }
    }

    // --- Close dropdown if clicked outside ---
    document.addEventListener('click', (event) => {
        const userAvatarContainer = document.getElementById('userAvatarContainer');
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        if (userAvatarContainer && userDropdownMenu && !userAvatarContainer.contains(event.target) && !userDropdownMenu.contains(event.target)) {
            userDropdownMenu.classList.remove('show');
        }
    });
document.addEventListener('DOMContentLoaded', () => {
        console.log("DOMContentLoaded event fired.");

        // Set the current year in the footer
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }




document.addEventListener('DOMContentLoaded', () => {
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebarContainer = document.getElementById('sidebar-container');
    const sidebarMenu = document.getElementById('sidebar-menu');

    // Open sidebar
    hamburgerIcon.addEventListener('click', () => {
        sidebarContainer.classList.add('open');
        sidebarMenu.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling body when sidebar is open
    });

    // Close sidebar by clicking close button
    closeSidebarBtn.addEventListener('click', () => {
        sidebarContainer.classList.remove('open');
        sidebarMenu.classList.remove('open');
        document.body.style.overflow = ''; // Allow body scrolling again
    });

    // Close sidebar by clicking outside the menu (on the overlay)
    sidebarContainer.addEventListener('click', (event) => {
        // Check if the click occurred directly on the container and not on the sidebar menu itself
        if (event.target === sidebarContainer) {
            sidebarContainer.classList.remove('open');
            sidebarMenu.classList.remove('open');
            document.body.style.overflow = ''; // Allow body scrolling again
        }
    });

    // Optional: Close sidebar when a link inside is clicked
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            sidebarContainer.classList.remove('open');
            sidebarMenu.classList.remove('open');
            document.body.style.overflow = ''; // Allow body scrolling again
        });
    });

    // --- Delete Confirmation Modal Logic ---
    const deleteModal = document.getElementById('deleteConfirmationModal');
    const confirmDeleteYes = document.getElementById('confirmDeleteYes');
    const confirmDeleteNo = document.getElementById('confirmDeleteNo');
    const userList = document.getElementById('user-list');
    let userToDeleteId = null; // To store the ID of the user to be deleted

    // Event delegation for delete buttons
    userList.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.delete-btn');
        if (deleteBtn) {
            userToDeleteId = deleteBtn.dataset.userId; // Get the user ID from the button's data attribute
            deleteModal.style.display = 'flex'; // Show the modal
            document.body.style.overflow = 'hidden'; // Prevent scrolling body when modal is open
        }
    });

    // Handle 'Yes' click for deletion
    confirmDeleteYes.addEventListener('click', () => {
        if (userToDeleteId) {
            const userEntry = document.querySelector(`.user-entry[data-user-id="${userToDeleteId}"]`);
            if (userEntry) {
                userEntry.remove(); // Remove the user entry from the DOM
                // In a real application, you would send a request to your backend to delete the user data here.
                console.log(`User with ID ${userToDeleteId} has been deleted.`);
            }
        }
        userToDeleteId = null; // Reset
        deleteModal.style.display = 'none'; // Hide the modal
        document.body.style.overflow = ''; // Allow body scrolling again
    });

    // Handle 'No' click for deletion
    confirmDeleteNo.addEventListener('click', () => {
        userToDeleteId = null; // Reset
        deleteModal.style.display = 'none'; // Hide the modal
        document.body.style.overflow = ''; // Allow body scrolling again
    });

    // Close modal if clicked outside (on the overlay)
    deleteModal.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
            userToDeleteId = null; // Reset
            deleteModal.style.display = 'none'; // Hide the modal
            document.body.style.overflow = ''; // Allow body scrolling again
        }
    });

    // Update header links to point to actual HTML files and set active class
    const currentPath = window.location.pathname.split('/').pop();

    document.querySelectorAll('.top-nav-links a, .sidebar-links a').forEach(link => {
        const linkHref = link.getAttribute('href');

        // Check if the link's href matches the current file name
        if (linkHref === currentPath) {
            link.classList.add('active');
        }
        // Special handling for homepage.html - assume it's the default when path is empty or homepage.html
        else if (linkHref === "homepage.html" && (currentPath === "" || currentPath === "index.html")) { // Added index.html as common default
            link.classList.add('active');
        }
        else {
            link.classList.remove('active');
        }

        // If the current page is 'progress_report.html' and it's not a direct link in the nav,
        // ensure no other generic links (like home, modules, game) are active for this page.
        // This prevents 'Home' from being active if you land directly on progress_report.html
        if (currentPath === 'progress_report.html' && link.getAttribute('href') !== 'progress_report.html') {
            link.classList.remove('active');
        }
    });
});
