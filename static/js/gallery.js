
async function getUserById(userId) {
    const apiUrl = `http://127.0.0.1:8000/users/${userId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status} - ${response.statusText}`);
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

function getCookie(name) {
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

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn')) {
            const postId = e.target.closest('.like-btn').dataset.postId;
            likePost(postId);
        }
    });
});

let likePost = async (postId) => {
    try {
        const csrfToken = getCookie('csrftoken');

        const response = await fetch(`http://127.0.0.1:8000/posts/${postId}/toggle_like/`, {
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
        const postEl = document.getElementById(`post-${postId}`);
        const likeCountEl = postEl.querySelector(`#likes-count-${postId}`);
        const heartEl = postEl.querySelector('.like-btn i');

        likeCountEl.textContent = data.likes_count;
        heartEl.classList.toggle('fa-solid', data.liked);
        heartEl.classList.toggle('fa-regular', !data.liked);

        console.log('Like toggled successfully:', data);
    } catch (error) {
        console.error('Error toggling like:', error);
    }
};

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

async function addComment(postId, content) {
    try {
        const csrfToken = getCookie('csrftoken');
        const response = await fetch(`/posts/${postId}/add_comment/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            throw new Error(`Failed to add comment: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

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

        if (commentsToShow >= allComments.length) {
             showMoreBtn.textContent = 'Show Less...';
        } else {
            showMoreBtn.textContent = 'Show More...';
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

let renderFunc = async (post) => {
    const userObj = await getUserById(post.owner);

    const allComments = await fetchComments(post.id);

    const comMap = [...allComments]
        .map((comment) => `<p><strong>${comment.creator}:</strong> ${comment.content}</p>`)
        .join("");
    console.log(comMap);

    const comments = `
        <div class="comments" id="comments-list-${post.id}">
            ${comMap}
        </div>
        <button type="button" id="show-more-${post.id}" class="show-more-btn"></button>
    `;

    return `
        <div id="post-${post.id}" class="post">
            <div class="post-top">
                <img src="${userObj.profile_picture}">
                <a href="../profile/${userObj.username}/" id="user-profile">${userObj.username}</a>
            </div>
            <div class="post-image">
                <img src="${post.image}">
            </div>
            <h2>${post.title}</h2>
            <div class="likes-comments-cont">
                <button type="button" class="like-btn" data-post-id="${post.id}">
                    ${post.is_liked_by_user ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}
                </button>
                <span id="likes-count-${post.id}">${post.likes_count}</span>
                <p><i class="fa-regular fa-comment"></i> ${post.comments.length}</p>
            </div>

            <!-- Comments Section -->
            ${comments}

            <!-- Add Comment Form -->
            <form method="POST" class="comment-form" data-post-id="${post.id}">
                <input type="hidden" name="csrfmiddlewaretoken" value="${csrf_token}
                <textarea name="comment_content" placeholder="Add a comment..." maxlength="200" required></textarea>
                <button type="submit">Add Comment</button>
            </form>
        </div>
    `;
};

fetch('http://127.0.0.1:8000/posts/')
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(async (data) => {
        const postsContainer = document.querySelector('.posts');

        const postsHTML = await Promise.all(
            data.results.map(async (post) => {
                const postHTML = await renderFunc(post);
                return postHTML;
            })
        );

        postsContainer.innerHTML = postsHTML.join("");

        data.results.forEach((post) => {
            renderComments(post.id);
        });
    })
    .catch((error) => {
        console.error('Error fetching posts:', error);
    });


