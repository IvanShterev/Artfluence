
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
        return await response.json() || [];
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

async function submitComment(postId, content, editCommentId = null) {
    try {
        const csrfToken = getCookie('csrftoken');
        const url = editCommentId
            ? `/comments/${editCommentId}/update/`
            : `/posts/${postId}/add_comment/`;
        const method = editCommentId ? 'PATCH' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            throw new Error(`Failed to submit comment: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
}

async function handleEditComment(postId, commentId, commentContent) {
    const commentForm = document.querySelector(`#post-${postId} .comment-form`);
    const textarea = commentForm.querySelector('textarea[name="comment_content"]');
    const addCommentButton = commentForm.querySelector('#add-comment-btn');

    if (!textarea) {
        console.error('Textarea for editing comment not found.');
        return;
    }

    textarea.value = commentContent;
    addCommentButton.dataset.editCommentId = commentId;

    let cancelBtn = commentForm.querySelector('.cancel-edit');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.classList.add('cancel-edit');
        cancelBtn.type = 'button';
        commentForm.appendChild(cancelBtn);

        cancelBtn.addEventListener('click', () => {
            textarea.value = '';
            addCommentButton.removeAttribute('data-edit-comment-id');
            cancelBtn.remove();
        });
    }
}

async function handleDeleteComment(postId, commentId) {
    const csrfToken = getCookie('csrftoken');

    const response = await fetch(`/comments/${commentId}/delete/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken,
        },
    });

    if (response.ok) {
        console.log('Comment deleted successfully');

        const commentEl = document.querySelector(`.comment-cont[data-comment-id="${commentId}"]`);
        if (commentEl) {
            commentEl.remove();
        }

        const commentsCountEl = document.querySelector(`#post-${postId} .fa-comment`).parentElement;
        const currentCount = parseInt(commentsCountEl.textContent.match(/\d+/), 10) || 0;
        if (currentCount > 0) {
            commentsCountEl.innerHTML = `<i class="fa-regular fa-comment"></i> ${currentCount - 1}`;
        }

        await renderComments(postId);
    } else {
        console.error('Failed to delete comment:', await response.json());
    }
}

document.body.addEventListener('submit', async (e) => {
    if (e.target.matches('.comment-form')) {
        e.preventDefault();
        const postId = e.target.dataset.postId;
        const textarea = e.target.querySelector('textarea[name="comment_content"]');
        const addCommentButton = e.target.querySelector('#add-comment-btn');
        const editCommentId = addCommentButton.dataset.editCommentId || null;

        const newComment = await submitComment(postId, textarea.value, editCommentId);
        if (newComment) {
            e.target.reset();
            addCommentButton.removeAttribute('data-edit-comment-id');
            const cancelBtn = e.target.querySelector('.cancel-edit');
            if (cancelBtn) cancelBtn.remove();
            await renderComments(postId);
            const commentCountEl = document.querySelector(`#post-${postId} .fa-comment`).parentElement;
            const currentCount = parseInt(commentCountEl.textContent.match(/\d+/), 10) || 0;
            if (!editCommentId) {
                commentCountEl.innerHTML = `<i class="fa-regular fa-comment"></i> ${currentCount + 1}`;
            }
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
            const commentEl = document.createElement('div');
            commentEl.classList.add('comment-cont');
            commentEl.dataset.commentId = comment.id;
            commentEl.innerHTML = `
                <div class="comment-body">
                    <p><strong>${comment.creator}:</strong></p>
                    <p class="comment-content-p">${comment.content}</p>
                </div>
                ${
                    comment.creator === userUsername
                        ? `<div class="edit-del-com-cont">
                               <i class="fa-solid fa-pen edit-comment"></i>
                               <i class="fa-solid fa-trash delete-comment"></i>
                           </div>`
                        : ''
                }
            `;
            commentsContainer.appendChild(commentEl);

            const editDelCont = commentEl.querySelector('.edit-del-com-cont');
            if (editDelCont) {
                commentEl.addEventListener('mouseenter', () => {
                    editDelCont.style.display = 'flex';
                });
                commentEl.addEventListener('mouseleave', () => {
                    editDelCont.style.display = 'none';
                });
                commentEl.addEventListener('click', () => {
                   if(editDelCont.style.display === 'none'){
                       editDelCont.style.display = 'flex';
                   }
                   else if(editDelCont.style.display === 'flex'){
                       editDelCont.style.display = 'none';
                   }
                });
            }

            const editIcon = commentEl.querySelector('.edit-comment');
            const deleteIcon = commentEl.querySelector('.delete-comment');

            if (editIcon) {
                editIcon.addEventListener('click', () => {
                    const commentContent = commentEl.querySelector('.comment-content-p').textContent;
                    handleEditComment(postId, comment.id, commentContent);
                });
            }

            if (deleteIcon) {
                deleteIcon.addEventListener('click', () => {
                    handleDeleteComment(postId, comment.id);
                });
            }
        });

        if (allComments.length <= 3) {
            showMoreBtn.style.display = 'none';
        } else {
            showMoreBtn.style.display = 'block';
            showMoreBtn.textContent = commentsToShow >= allComments.length ? 'Show Less...' : 'Show More...';
        }
    }

    updateCommentsDisplay();

    showMoreBtn.addEventListener('click', () => {
        commentsToShow = commentsToShow >= allComments.length
            ? 3
            : allComments.length;
        updateCommentsDisplay();
    });
}

async function fetchPosts(searchQuery = '') {
    try {
        const response = await fetch(`/posts/?search=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }

        const posts = await response.json();

        let postsContainer = document.querySelector('.posts');

        const postsHTML = await Promise.all(
            posts.map(async (post) => {
                const postHTML = await renderFunc(post);
                return postHTML;
            })
        );

        postsContainer.innerHTML = postsHTML.join('');

        posts.forEach((post) => {
            renderComments(post.id);
        });

        attachForSaleEventListeners();
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

let renderFunc = async (post) => {
    const userObj = await getUserById(post.owner);

    const allComments = await fetchComments(post.id);
    const editDelCon = `
        <div class="edit-del-com-cont">
            <i class="fa-solid fa-pen edit-comment"></i>
            <i class="fa-solid fa-trash delete-comment"></i>
        </div>`;

    const comMap = [...allComments]
        .map((comment) => `
            <div class="comment-cont" data-comment-id="${comment.id}">
                <div class="comment-body">
                    <p class="comment-content-p">${comment.content}</p>
                </div>
                ${comment.creator === userUsername ? editDelCon : ''}
            </div>
        `)
        .join("");

    const href = isAuthenticated && post.owner != authenticatedUser ? `/buy-art/${post.id}` : `javascript:void(0)`;

    const forSaleBtn = post.for_sale
        ? `<a href="${href}"
              class="for-sale-btn"
              data-owner="${post.owner}"
              data-user="${authenticatedUser?.id}"
              data-post-id="${post.id}"
              data-price="${post.price}">
              $For Sale
          </a>`
        : '';

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
                <a href="${isAuthenticated ? `../profile/${userObj.username}/` : 'javascript:void(0)'}" id="user-profile">${userObj.username}</a>
                ${forSaleBtn}
            </div>
            <div class="post-image">
                <img src="${post.image}">
            </div>
            <h2>${post.title}</h2>
            <div class="likes-comments-cont">
                <p>
                    <button type="button" class="like-btn" data-post-id="${post.id}">
                        ${post.is_liked_by_user ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}
                    </button>
                    <span id="likes-count-${post.id}">${post.likes_count}</span>
                </p>
                <p><i class="fa-regular fa-comment"></i> ${post.comments.length}</p>
            </div>

            ${comments}

            <form method="POST" class="comment-form" data-post-id="${post.id}">
                <input type="hidden" name="csrfmiddlewaretoken" value="${csrf_token}
                <textarea name="comment_content" placeholder="Add a comment..." maxlength="200" required></textarea>
                <button type="submit" id="add-comment-btn">Add Comment</button>
            </form>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchQuery = searchInput.value;
        fetchPosts(searchQuery);
    });

    fetchPosts();
});

fetch('http://127.0.0.1:8000/posts/')
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(async (data) => {
        const postsContainer = document.querySelector('.posts');

        const posts= Array.isArray(data) ? data : data.results || [];

        const postsHTML = await Promise.all(
            posts.map(async (post) => {
                const postHTML = await renderFunc(post);
                return postHTML;
            })
        );

        postsContainer.innerHTML = postsHTML.join("");

        posts.forEach((post) => {
            renderComments(post.id);
        });
        attachForSaleEventListeners();
    })
    .catch((error) => {
        console.error('Error fetching posts:', error);
    });

function attachForSaleEventListeners() {
    const forSaleButtons = document.querySelectorAll('.for-sale-btn');
    const displayAPContainer = document.querySelector('.display-ap-cont');
    const userAP = parseInt(document.getElementById('balance')?.textContent);
    const balance = document.getElementById('balance');
    const pointsCont = document.querySelector('.a-points-cont');

    forSaleButtons.forEach(button => {
        button.addEventListener('mouseover', function () {
            const postOwner = this.getAttribute('data-owner');
            const currentUser = authenticatedUser;
            if (postOwner !== currentUser) {
                const postPrice = parseInt(this.getAttribute('data-price'));
                const resultAP = userAP - postPrice;
                const resultSpan = document.createElement('span');
                const minus = document.createElement('span');
                const pricePost = document.createElement('span');
                const line = document.createElement('span');
                const resultCont = document.createElement('div');
                resultCont.classList.add('resultCont');
                line.classList.add('dividing-line');
                minus.textContent = '-';
                pricePost.textContent = `${postPrice}`;
                minus.id = 'minus';
                pricePost.id = 'pricePost';
                resultSpan.id = 'result-ap';
                resultSpan.textContent = `Remaining: ${resultAP} AP`;

                if (resultAP >= 0) {
                    resultSpan.style.color = 'green';
                    balance.style.color = 'green';
                } else {
                    resultSpan.style.color = 'red';
                    balance.style.color = 'red';
                }

                displayAPContainer.appendChild(minus);
                displayAPContainer.appendChild(pricePost);
                resultCont.appendChild(line);
                resultCont.appendChild(resultSpan);
                pointsCont.appendChild(resultCont);
            }
        });

        button.addEventListener('mouseout', function () {
            const resultCont = document.querySelector('.resultCont');
            const minus = document.getElementById('minus');
            const pricePost = document.getElementById('pricePost');
            if (resultCont) {
                minus.remove();
                pricePost.remove();
                resultCont.remove();
                balance.style.color = 'black';
            }
        });
    });
}
