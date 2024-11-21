
const forSaleButtons = document.querySelectorAll('.for-sale-btn');
const displayAPContainer = document.querySelector('.display-ap-cont');
const userAP = parseInt(document.getElementById('balance').textContent);
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

