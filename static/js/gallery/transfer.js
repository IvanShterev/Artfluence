document.addEventListener('DOMContentLoaded', () => {
    const apInput = document.getElementById('ap-input');
    const euroInput = document.getElementById('euro-input');
    const convertButton = document.getElementById('convert-ap-btn');
    const messageContainer = document.getElementById('message-container');
    const messageText = document.getElementById('message-text');
    const awesomeBtn = document.querySelector('.message-container button');
    let container = document.querySelector('.container');
    let messageTop = document.getElementById('message-top');
    let warningSuccessCont = document.querySelector('.warning-success-cont');
    let warnSuccBtn = document.getElementById('warn-succ-btn');

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

    apInput.addEventListener('input', () => {
        const apAmount = parseInt(apInput.value) || 0;
        euroInput.value = (apAmount / 100).toFixed(2);
    });

    convertButton.addEventListener('click', async () => {
        const apAmount = parseInt(apInput.value);
        const csrf_token = getCookie('csrftoken');
        if (!apAmount || apAmount <= 0) {
            showMessage('Please enter a valid AP amount', 'error');
            container.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`/api/transfer/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrf_token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ap_amount: apAmount }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to convert to Euro.');
            }

            const data = await response.json();
            showMessage(`You have successfully transferred ${data.ap_converted} AP for €${data.euro_equivalent}.`, 'success');
            apInput.value = '';
            euroInput.value = '';
            container.style.display = 'none';
        } catch (error) {
            console.error(error);
            showMessage(error.message || 'An error occurred. Please try again.', 'error');
            container.style.display = 'none';
        }
    });

    function showMessage(message, type) {
        messageText.textContent = message;
        messageContainer.style.display = 'flex';

        if (type === 'success') {
            messageContainer.classList.add('success');
            messageContainer.classList.remove('error');
            awesomeBtn.textContent = 'Awesome';
            messageTop.textContent = 'SUCCESS!';
            warningSuccessCont.style.backgroundColor = 'green';
            warnSuccBtn.style.backgroundColor = 'lightseagreen';
        } else {
            messageContainer.classList.add('error');
            messageContainer.classList.remove('success');
            awesomeBtn.textContent = 'OK';
            messageTop.textContent = 'WARNING!';
            warningSuccessCont.style.backgroundColor = '#de0c37';
            warnSuccBtn.style.backgroundColor = 'deepskyblue';
        }
    }

    awesomeBtn.addEventListener('click', () => {
        messageContainer.style.display = 'none';
        container.style.display = 'flex';
    })
});