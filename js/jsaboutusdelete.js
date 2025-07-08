
        document.addEventListener('DOMContentLoaded', () => {
            const hamburgerIcon = document.getElementById('hamburger-icon');
            const closeSidebarBtn = document.getElementById('close-sidebar-btn');
            const sidebarContainer = document.getElementById('sidebar-container');
            const sidebarMenu = document.getElementById('sidebar-menu');

            // Open sidebar
            hamburgerIcon.addEventListener('click', () => {
                sidebarContainer.classList.add('open');
                sidebarMenu.classList.add('open');
                document.body.style.overflow = 'hidden'; // Prevent body scrolling
            });

            // Close sidebar by clicking close button
            closeSidebarBtn.addEventListener('click', () => {
                sidebarContainer.classList.remove('open');
                sidebarMenu.classList.remove('open');
                document.body.style.overflow = ''; // Restore body scrolling
            });

            // Close sidebar by clicking outside the menu (on the overlay)
            sidebarContainer.addEventListener('click', (event) => {
                if (event.target === sidebarContainer) {
                    sidebarContainer.classList.remove('open');
                    sidebarMenu.classList.remove('open');
                    document.body.style.overflow = ''; // Restore body scrolling
                }
            });

            // Close sidebar when a link inside is clicked
            const sidebarLinks = document.querySelectorAll('.sidebar-links a');
            sidebarLinks.forEach(link => {
                link.addEventListener('click', () => {
                    sidebarContainer.classList.remove('open');
                    sidebarMenu.classList.remove('open');
                    document.body.style.overflow = ''; // Restore body scrolling
                });
            });
        });

        const dropBoxContainer = document.getElementById("dropBoxContainer");
        const submitBtn = document.querySelector(".comment-form-container button[type='submit']"); // Correctly target the submit button
        const commentText = document.getElementById("comment");
        const anonymousCheckbox = document.getElementById("anonymousCheckbox");

        /**
         * Loads comments from localStorage and displays them in the dropBoxContainer.
         * Comments are displayed in reverse order (newest first).
         * Each comment includes an avatar (anonymous or user), text, and a delete button.
         */
        function loadComments() {
            dropBoxContainer.innerHTML = ""; // Clear existing comments
            const comments = JSON.parse(localStorage.getItem("comments") || "[]");
            
            // Display comments in reverse order (newest first)
            comments.reverse().forEach((comment, index) => {
                const div = document.createElement("div");
                div.className = "drop-box-item";

                // Main comment text (the "quote" part)
                const commentQuote = document.createElement("p");
                commentQuote.className = "comment-quote";
                commentQuote.textContent = `"${comment.text}"`; // Wrap in quotes as per image
                div.appendChild(commentQuote);

                // Author info (avatar, name, description)
                const authorInfo = document.createElement("div");
                authorInfo.className = "comment-author-info";

                const img = document.createElement("img");
                if (comment.anonymous) {
                    img.src = "https://placehold.co/48x48/CCCCCC/000000?text=Anon"; // Placeholder for anonymous user
                    img.alt = "Anonymous";
                } else {
                    img.src = "https://placehold.co/48x48/4CAF50/FFFFFF?text=User"; // Placeholder for user
                    img.alt = "User";
                }
                authorInfo.appendChild(img);

                const authorDetails = document.createElement("div");
                authorDetails.className = "author-details";

                const authorName = document.createElement("strong");
                authorName.textContent = comment.anonymous ? "Anonymous" : "User";
                authorDetails.appendChild(authorName);

                const commentDescription = document.createElement("p");
                commentDescription.className = "comment-description";
                commentDescription.textContent = comment.text.substring(0, 50) + (comment.text.length > 50 ? '...' : ''); // Show a snippet or full text
                authorDetails.appendChild(commentDescription);

                authorInfo.appendChild(authorDetails);
                div.appendChild(authorInfo);

                const delBtn = document.createElement("button");
                delBtn.className = "delete-btn";
                delBtn.textContent = "×";
                // Attach event listener for deleting comments
                // The index calculation (comments.length - 1 - index) is crucial because we are iterating a reversed array
                delBtn.addEventListener("click", () => {
                    deleteComment(comments.length - 1 - index);
                });
                div.appendChild(delBtn);

                dropBoxContainer.appendChild(div);
            });
        }

        /**
         * Deletes a comment from localStorage at the specified index and reloads the comments.
         * @param {number} index The index of the comment to delete in the original (non-reversed) array.
         */
        function deleteComment(index) {
            const comments = JSON.parse(localStorage.getItem("comments") || "[]");
            comments.splice(index, 1); // Remove 1 element at the given index
            localStorage.setItem("comments", JSON.stringify(comments));
            loadComments(); // Reload comments to update the display
        }

        // Event listener for submitting a new comment
        submitBtn.addEventListener("click", () => {
            const text = commentText.value.trim();
            if (text === "") {
                console.error("Please enter a comment."); // Use console.error instead of alert()
                return;
            }
            const comments = JSON.parse(localStorage.getItem("comments") || "[]");
            comments.push({
                text,
                anonymous: anonymousCheckbox.checked,
            });
            localStorage.setItem("comments", JSON.stringify(comments));
            commentText.value = ""; // Clear the textarea
            anonymousCheckbox.checked = false; // Uncheck the anonymous checkbox
            loadComments(); // Reload comments to display the new one
        });

        // Load comments when the page first loads
        loadComments();
