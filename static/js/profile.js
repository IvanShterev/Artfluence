const selector = document.getElementById('view-selector');
const collectionView = document.getElementById('collection-view');
const forSaleView = document.getElementById('for-sale-view');

document.addEventListener('DOMContentLoaded', () => {
    const username = document.querySelector(".profile-card h1").textContent.trim();
    const csrfToken = getCookie('csrftoken');

    function fetchAndRenderPosts() {
        fetch(`/api/users/${username}/posts/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            renderPosts(data.collection, collectionView, 'Collection');
            renderPosts(data.for_sale, forSaleView, 'For Sale');
        })
        .catch(error => console.error("Error fetching posts:", error));
    }

    function renderPosts(posts, container, viewName) {
        if(posts && posts.length > 0){
            container.innerHTML = posts.map(post => `
            <div class="post-item" id="post-${post.id}">
                     <div class="post-top">
                         <div class="title-price-cont">
                            <span>${ post.title }</span>
                         </div>
                         ${viewName === 'For Sale' && !post.is_owner ? `<a href='#'>Buy $</a>` : ''}
                         ${post.is_owner ? `
                         <div class="edit-delete-cont">
                           <a href="/profile/${username}/post/${post.id}/edit/"><i class="fa-solid fa-pen"></i></a>
                           <a href="javascript:void(0)" class="delete-post-btn" data-post-id="${ post.id }" data-post-title="${ post.title }">
                              <i class="fa-solid fa-trash"></i>
                           </a>
                        </div>
                        ` : ''}
                </div>
                <img src="${post.image}" alt="${post.title}">
                <div class="likes-comments-cont">
                    <div class="likes-container">
                        <button class="like-button">
                            <i class="${post.is_liked_by_user ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        </button>
                        <span class="like-count">${post.likes_count}</span>
                    </div>
                    <div class="comments-container">
                        <button class="comment-button">
                            <i class="fa-regular fa-comment"></i>
                        </button>
                        <span>${post.comments.length}</span>
                    </div>
                </div>
            </div>
            `).join('');
        }
        else{
            container.innerHTML = `
                <p class="no-items-to-display">No posts in ${viewName}</p>
            `
        }
    }

    selector.addEventListener("change", updateView);

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

    fetchAndRenderPosts();
    updateView();
});

function getCookie(name){
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.body.addEventListener('click', (e) => {
        const button = e.target.classList.contains('like-button')
            ? e.target
            : e.target.closest('.like-button');
        if (button) {
            const postItem = button.closest('.post-item');
            const postId = postItem.id.replace('post-', '');
            console.log(`Like button clicked for Post ID: ${postId}`);
            likePost(postId, button);
        }
    });

let likePost = async (postId, button) => {
    try {
        const csrfToken = getCookie('csrftoken');
        const response = await fetch(`/api/posts/${postId}/toggle_like/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to toggle like: ${response.status}`);
        }

        const data = await response.json();
         console.log(`Response from server: ${JSON.stringify(data)}`);
        const likeCountEl = button.closest('.post-item').querySelector('.like-count');
        const heartIcon = button.querySelector('i');

        likeCountEl.textContent = data.likes_count;
        heartIcon.classList.toggle('fa-solid', data.liked);
        heartIcon.classList.toggle('fa-regular', !data.liked);

        console.log('Like toggled successfully:', data);
    } catch (error) {
        console.error('Error toggling like:', error);
    }
};

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
        const csrfToken = getCookie('csrftoken');

        fetch("/api/delete-account/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
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

    const deletePostModal = document.getElementById("delete-post-modal");
    const message = document.getElementById("delete-post-message");
    const confirmDeletePostBtn = document.getElementById("confirm-delete-post");
    const cancelDeletePostBtn = document.getElementById("cancel-delete-post");
    let postIdToDelete = null;

    document.addEventListener('click', (e) => {
        if (e.target.closest('.delete-post-btn')) {
            const button = e.target.closest('.delete-post-btn');
            const postTitle = button.getAttribute("data-post-title");
            const postId = button.getAttribute("data-post-id");

            message.textContent = `Are you sure you want to delete "${postTitle}"?`;
            deletePostModal.style.display = "block";
            postIdToDelete = postId;
        }
    });

    cancelDeletePostBtn.addEventListener("click", () => {
        deletePostModal.style.display = "none";
        postIdToDelete = null;
    });

    confirmDeletePostBtn.addEventListener("click", () => {
        if (postIdToDelete) {
            const csrfToken = getCookie('csrftoken');
            fetch(`/api/posts/${postIdToDelete}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
            })
            .then((response) => {
                if (response.ok) {
                    document.querySelector(`.delete-post-btn[data-post-id="${postIdToDelete}"]`)
                        .closest(".post-item").remove();
                    deletePostModal.style.display = "none";
                } else {
                    console.error("Failed to delete post:", response.statusText);
                }
            })
            .catch((error) => console.error("Error:", error));
        }
    });
});
