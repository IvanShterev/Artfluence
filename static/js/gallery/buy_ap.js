document.addEventListener('DOMContentLoaded', () => {
    const apInput = document.getElementById('ap-input');
    const euroInput = document.getElementById('euro-input');
    const buyButton = document.getElementById('buy-ap-btn');
    const messageContainer = document.getElementById('message-container');
    const messageText = document.getElementById('message-text');
    const awesomeBtn = document.querySelector('.message-container button');

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

    buyButton.addEventListener('click', async () => {
        const apAmount = parseInt(apInput.value);
        const csrf_token = getCookie('csrftoken');
        if (!apAmount || apAmount <= 0) {
            showMessage('Please enter a valid AP amount.', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/buy-ap/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrf_token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ap_amount: apAmount }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to purchase AP.');
            }

            const data = await response.json();
            showMessage(`You have successfully purchased ${data.ap_purchased} AP for €${data.euro_cost}.`, 'success');
            apInput.value = '';
            euroInput.value = '';
        } catch (error) {
            console.error(error);
            showMessage(error.message || 'An error occurred. Please try again.', 'error');
        }
    });

    function showMessage(message, type) {
        messageText.textContent = message;
        messageContainer.style.display = 'block';

        if (type === 'success') {
            messageContainer.classList.add('success');
            messageContainer.classList.remove('error');
        } else {
            messageContainer.classList.add('error');
            messageContainer.classList.remove('success');
        }
    }

    awesomeBtn.addEventListener('click', () => {
        messageContainer.style.display = 'none';
    })
});