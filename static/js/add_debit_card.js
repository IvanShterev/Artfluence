
document.addEventListener('DOMContentLoaded', () => {
    const cardContainers = document.querySelectorAll('.card-container-all');
    const addDebitCardCont = document.getElementById('add-debit-card-form-cont');
    const addDebitCardBtn = document.querySelector('.add-debit-card-cont')
    const debitCardForm = document.getElementById('add-debit-card-form');
    const container = document.querySelector('.container');
    const cancel = document.getElementById('cancel-btn');

addDebitCardBtn.addEventListener('click', () => {
    addDebitCardCont.style.display = 'flex';
    container.style.display = 'none';
});

cancel.addEventListener('click', () => {
    container.style.display = 'flex';
    addDebitCardCont.style.display = 'none';
});

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

    cardContainers.forEach(container => {
        container.addEventListener('mouseover', () => {
            const removeBtn = container.querySelector('.remove-card-btn');
            removeBtn.style.display = 'block';
        });

        container.addEventListener('mouseleave', () => {
            const removeBtn = container.querySelector('.remove-card-btn');
            removeBtn.style.display = 'none';
        });

        container.querySelector('.remove-card-btn').addEventListener('click', async () => {
            const cardId = container.dataset.cardId;
            const csrfToken = getCookie('csrftoken');
            try {
                const response = await fetch(`/profile/${username}/debit-cards/${cardId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                });

                if (response.ok) {
                    container.remove();
                } else {
                    throw new Error('Failed to delete the card.');
                }
            } catch (error) {
                console.error(error);
                alert('Error deleting card. Please try again.');
            }
        });

        container.querySelector('.default-card-radio').addEventListener('change', async () => {
            const cardId = container.dataset.cardId;
            const csrfToken = getCookie('csrftoken');
            try {
                const response = await fetch(`/profile/${username}/debit-cards/${cardId}/set-default/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to set default card.');
                }
            } catch (error) {
                alert('Error setting default card. Please try again.');
            }
        });
    });
});
