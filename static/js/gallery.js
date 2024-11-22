

// Fetch all posts from the URL

async function getUserById(userId) {
    const apiUrl = `http://127.0.0.1:8000/users/${userId}`; // Replace with your API URL

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

let likePost = (e, post, userId) => {
    e.preventDefault();
    if(!post.likes.includes(userId)) post.likes.add(userId)
    else
    console.log(post)
    // PATCH http://127.0.0.1:8000/posts/[postId]
    let postEl = document.getElementById('post-')
    postEl.querySelector('.fa-heart')
}

let renderFunc = async (post) => {
    let userObj = await getUserById(post.owner)

            console.log(userObj)

            let forSaleLink = "";

            if(post.for_sale) {
                forSaleLink = `
                <a href="#"
                   class="for-sale-btn"
                   data-price="${post.price}"
                    data-owner="${userObj.username}"
                   data-user="${user.username}"
                >
                    <i class="fa-solid fa-dollar-sign"></i>
                    For Sale
                </a>`
            }

            let heartEl = post.is_liked_by_user ? `<i class="fa-solid fa-heart"></i>` : `<i class="fa-regular fa-heart"></i>`
            let comMap = post.comments.map(comment => `<p><strong>${comment.creator}:</strong> ${comment.content}</p>`).join("")
            let comments = `
                <div class="comments" id="comments-list">
                    ${comMap}
                </div>
            `


            return `
                <div id="post-${post.id}" class="post">
                    <div class="post-top">
                        <img src="${userObj.profile_picture}">
                        <a href="../profile/${userObj.username}/" id="user-profile">${userObj.username}</a>
                        ${forSaleLink}
                    </div>
                    <div class="post-image">
                        <img src="${post.image}">
                    </div>
                    <h2>${post.title}</h2>
                    <div class="likes-comments-cont">
                        <form method="POST" action="${(e) => likePost(e, post)}" id="like-form">
                            ${csrf_token}
                            <input type="hidden" name="post_id" value="${post.id}">
                            <button type="submit" name="like" id="like-btn">
                                ${heartEl}
                            </button>
                            <span id="likes-count-${post.id}">${post.likes_count}</span>
                        </form>
    
                        <!-- Comments Count -->
                        <p><i class="fa-regular fa-comment"></i> ${post.comments.length}</p>
                    </div>
                    
                    <!-- Comments Section -->
                    ${comments}
    
                    <!-- Add Comment Form -->
                    <form method="POST" action="" id="comment-form">
                        ${csrf_token}
                        <input type="hidden" name="post_id" value="${post.id}">
                        <textarea name="comment_content" placeholder="Add a comment..." maxlength="200" required></textarea>
                        <button type="submit" name="comment">Comment</button>
                    </form>
                </div>
            `;
}

fetch('http://127.0.0.1:8000/posts/')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse JSON response
    })
    .then(async (data) => {

        // Example: Display the posts on the webpage
        const postsContainer = document.querySelector('.posts');

        let newArr = data.results.map(async (post) => await renderFunc(post));

        Promise.all(newArr).then((results) => {
            console.log(results.join(""));
            postsContainer.innerHTML = results.join("");

            const forSaleButtons = document.querySelectorAll('.for-sale-btn');
            const displayAPContainer = document.querySelector('.display-ap-cont');
            const userAP = parseInt(document.getElementById('balance')?.textContent);
            const balance = document.getElementById('balance');
            const pointsCont = document.querySelector('.a-points-cont');

            forSaleButtons.forEach(button => {
                button.addEventListener('mouseover', function () {
                    const postOwner = this.getAttribute('data-owner');
                    const currentUsername = this.getAttribute('data-user');
                        if (postOwner === currentUsername) {
                            return;
                        }
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


        }).catch((error) => {
            console.error("Error resolving promises:", error);
        })
    })
    .catch(error => {
        console.error('Error fetching posts:', error); // Handle errors
    });
