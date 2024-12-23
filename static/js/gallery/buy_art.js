const post = document.querySelector('.post');
const postId = post.dataset.postId;
const okayBtn = document.getElementById('okay-btn');
const errorMessage = document.querySelector('.error-message');
const buyBtn = document.getElementById('buy-btn');

const postPrice = parseInt(post.getAttribute('data-price'));
const displayAPContainer = document.querySelector('.display-ap-cont');
const userAP = parseInt(document.getElementById('balance')?.textContent);
const balance = document.getElementById('balance');
const pointsCont = document.querySelector('.a-points-cont');
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
const overlay = document.querySelector('.overlay');

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


const formData = new FormData();
formData.append('post_id', postId);
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

const csrfToken = getCookie('csrftoken');
const data = { post_id: postId };

buyBtn.addEventListener('click', () => {
    fetch(`/buy-art/${postId}/`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    },
    body: JSON.stringify(data)
   })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect_url;
        } else {
            overlay.style.display = 'block';
            errorMessage.style.display = 'flex';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    okayBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        errorMessage.style.display = 'none';
    });
});
