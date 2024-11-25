document.addEventListener("DOMContentLoaded", () => {
    const csrfToken = getCookie('csrftoken');

    async function fetchTopFivePosts() {
        console.log("Attempting to fetch top 5 posts...");
        try {
            const response = await fetch(`/top-five/`);
            if (!response.ok) {
                throw new Error('Failed to fetch top 5 posts.');
            }
            const posts = await response.json();
            console.log('Fetched Posts:', posts);
            renderTopFive(posts);
        } catch (error) {
            console.error('Error fetching top 5 posts:', error);
        }
    }

    function renderTopFive(posts) {
        const postsContainer = document.querySelector('.all-five-posts');
        postsContainer.innerHTML = '';
        posts.forEach((post, index) => {
            postsContainer.innerHTML += `
                <div class="post-rank-cont">
                    <div class="rank-cont">
                        <h2>#${index + 1}</h2>
                    </div>
                    <div class="post" id="post-${post.id}">
                        <div class="post-top">
                            <img src="${post.owner.profile_picture}">
                            <a href="/profile/${post.owner.username}/" id="user-profile">${post.owner.username}</a>
                            <span class="hidden">#${index + 1}</span>
                            ${post.for_sale ?
                                `<a href="#"
                                  class="for-sale-btn"
                                  data-price="${post.price}"
                                  data-owner="${post.owner.username}">
                                    <i class="fa-solid fa-dollar-sign"></i>For Sale
                                </a>`
                                : ''
                            }
                        </div>
                        <div class="post-image">
                            <img src="${post.image}" alt="${post.title}">
                        </div>
                        <h2>${post.title}</h2>
                        <div class="likes-comments-cont">
                            <div class="likes-container">
                                <button class="like-button" data-post-id="${post.id}">
                                    <i class="${post.is_liked_by_user ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                                </button>
                                <span class="like-count">${post.likes_count}</span>
                            </div>
                            <div class="comments-container">
                                <button class="show-comments-button" data-post-id="${post.id}">
                                    <i class="fa-regular fa-comment"></i>
                                </button>
                                <span>${post.comments.length}</span>
                            </div>
                        </div>
                        <div class="comments-section" id="comments-section-${post.id}">
                             <div class="comments">
                                ${post.comments.reverse().map(comment => `<div class="comment"><strong>${comment.creator}:</strong> ${comment.content}</div>`).join('')}
                            </div>
                            <form method="POST" class="comment-form" data-post-id="${post.id}">
                                <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}
                                <textarea name="comment_content" placeholder="Add a comment..." maxlength="200" required></textarea>
                                <button type="submit" id="add-comment-btn">Add Comment</button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    async function toggleLike(postId, button) {
        try {
            const response = await fetch(`/posts/${postId}/toggle_like/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to toggle like: ${response.status}`);
            }
            const data = await response.json();
            const likeCountEl = button.nextElementSibling;
            const heartIcon = button.querySelector("i");

            likeCountEl.textContent = data.likes_count;
            heartIcon.classList.toggle("fa-solid", data.liked);
            heartIcon.classList.toggle("fa-regular", !data.liked);

            fetchTopFivePosts();
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    }

    document.body.addEventListener("click", (e) => {
        if (e.target.closest(".like-button")) {
            const button = e.target.closest(".like-button");
            const postId = button.dataset.postId;
            toggleLike(postId, button);
        }
    });

    async function fetchComments(postId) {
    try {
        const response = await fetch(`/posts/${postId}/comments/`);
        if (!response.ok) {
            throw new Error(`Failed to fetch comments: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

    async function addComment(postId, content){
        try {
            const csrfToken = getCookie('csrftoken');
            const response = await fetch(`/posts/${postId}/add_comment/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({content}),
            });
            if (!response.ok) {
                throw new Error(`Failed to add comment: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }

    document.body.addEventListener('submit', async (e) => {
    if (e.target.matches('.comment-form')) {
        e.preventDefault();
        const postId = e.target.dataset.postId;
        const content = e.target.querySelector('textarea[name="comment_content"]').value;
         const commentCountEl = document.querySelector(`#post-${postId} .fa-comment`).parentElement;

        const newComment = await addComment(postId, content);
        if (newComment) {
            e.target.reset();
            await renderComments(postId);
            const currentCount = parseInt(commentCountEl.textContent.match(/\d+/), 10) || 0;
            commentCountEl.innerHTML = `<i class="fa-regular fa-comment"></i> ${currentCount + 1}`;
        }
    }
});

    async function renderComments(postId) {
        const commentsContainer = document.querySelector(`#comments-list-${postId}`);
        const showMoreBtn = document.querySelector(`#show-more-${postId}`);
        const allComments = await fetchComments(postId);

        let commentsToShow = 3;

        function updateCommentsDisplay() {
            commentsContainer.innerHTML = '';

            const visibleComments = [...allComments].reverse().slice(-commentsToShow);
            visibleComments.reverse().forEach((comment) => {
                const commentEl = document.createElement('p');
                commentEl.innerHTML = `<strong>${comment.creator}:</strong> ${comment.content}`;
                commentsContainer.appendChild(commentEl);
            });

            if (allComments.length <= 3) {
                showMoreBtn.style.display = 'none';
            } else {
                showMoreBtn.style.display = 'block';
                if (commentsToShow >= allComments.length) {
                    showMoreBtn.textContent = 'Show Less...';
                } else {
                    showMoreBtn.textContent = 'Show More...';
                }
            }
        }

        updateCommentsDisplay();

        showMoreBtn.addEventListener('click', () => {
            if (commentsToShow >= allComments.length) {
                commentsToShow = Math.max(3, commentsToShow - 3);
            } else {
                commentsToShow = Math.min(allComments.length, commentsToShow + 3);
            }
            updateCommentsDisplay();
        });
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});