const selector = document.getElementById('view-selector');
const collectionView = document.getElementById('collection-view');
const forSaleView = document.getElementById('for-sale-view');

function updateView() {
    const selectedValue = selector.value;
    if (selectedValue === 'collection') {
        collectionView.style.display = 'flex';
        forSaleView.style.display = 'none';
    } else if (selectedValue === 'for-sale') {
        collectionView.style.display = 'none';
        forSaleView.style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateView();
});

function getCookie(name){
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Check if this cookie string starts with the name we want
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener("DOMContentLoaded", function () {
    const deleteBtn = document.getElementById("delete-profile-btn");
    const modal = document.getElementById("delete-profile-modal");
    const confirmBtn = document.getElementById("confirm-delete-profile");
    const cancelBtn = document.getElementById("cancel-delete-profile");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => modal.style.display = "block");
    }
    cancelBtn.addEventListener("click", () => modal.style.display = "none");

    confirmBtn.addEventListener("click", () => {
        const csrfToken = getCookie('csrftoken'); // Retrieve CSRF token from cookies

        fetch("/api/delete-account/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken, // Include CSRF token in headers
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            }
        })
        .catch(error => console.error("Error:", error));
    });

    const deletePostButtons = document.querySelectorAll('.delete-post-btn');
    const deletePostModal = document.getElementById("delete-post-modal");
    const message = document.getElementById("delete-post-message");
    const confirmDeletePostBtn = document.getElementById("confirm-delete-post");
    const cancelDeletePostBtn = document.getElementById("cancel-delete-post");
    let postIdToDelete = null;

    // Show the modal with post-specific information
    deletePostButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const postTitle = button.getAttribute("data-post-title");
            postIdToDelete = button.getAttribute("data-post-id");
            message.textContent = `Are you sure you want to delete "${postTitle}"?`;
            deletePostModal.style.display = "block";
        });
    });

    // Cancel deletion
    cancelDeletePostBtn.addEventListener("click", () => {
        deletePostModal.style.display = "none";
        postIdToDelete = null;
    });

    // Confirm deletion and send request
    confirmDeletePostBtn.addEventListener("click", () => {
        if (postIdToDelete) {
            const csrfToken = getCookie('csrftoken'); // Retrieve CSRF token from cookies

            fetch(`/api/posts/${postIdToDelete}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken, // Include CSRF token in headers
                },
            })
            .then((response) => {
                if (response.ok) {
                    // Remove the post from the DOM
                    const postElement = document.querySelector(`.delete-post-btn[data-post-id="${postIdToDelete}"]`).closest(".post-item");
                    postElement.remove();
                    deletePostModal.style.display = "none";
                } else {
                    console.error("Failed to delete post:", response.statusText);
                }
            })
            .catch((error) => console.error("Error:", error));
        }
    });
});
