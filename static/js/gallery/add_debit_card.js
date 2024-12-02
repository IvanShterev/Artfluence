
document.addEventListener('DOMContentLoaded', () => {
    const addDebitCardBtn = document.querySelector('.add-debit-card-cont');
    const addDebitCardFormCont = document.getElementById('add-debit-card-form-cont');
    const addDebitCardForm = document.getElementById('add-debit-card-form');
    const container = document.querySelector('.container');
    const cancelBtn = document.getElementById('cancel-btn');
    const customDateField = document.getElementById("expiration_date");
    const cardContainers = document.querySelectorAll('.card-container-all');

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

    addDebitCardBtn.addEventListener('click', () => {
        addDebitCardFormCont.style.display = 'flex';
        container.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        addDebitCardFormCont.style.display = 'none';
        container.style.display = 'flex';
    });

    customDateField.addEventListener('input', (e) => {
        const inputField = e.target;
        let currentValue = inputField.value;

        if (currentValue.length === 2) {
            inputField.value += '/';
        }
    });

    addDebitCardForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const csrfToken = getCookie('csrftoken');
        const formData = new FormData(addDebitCardForm);
        const formObject = Object.fromEntries(formData);

        document.querySelectorAll('.error-message').forEach(errorElement => errorElement.remove());

        try {
            const response = await fetch('/api/add-debit-card/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify(formObject),
            });

            if (!response.ok) {
                const errorData = await response.json();
                for (const [field, errors] of Object.entries(errorData)) {
                    const fieldElement = document.querySelector(`[name="${field}"]`);
                    if (fieldElement) {
                        const errorContainer = document.createElement('div');
                        errorContainer.classList.add('error-message', 'text-danger');
                        errorContainer.textContent = errors.join(', ');
                        fieldElement.parentElement.appendChild(errorContainer);
                    }
                }
                return;
            }

            const data = await response.json();
            location.reload();
        }
        catch (error) {
            console.error('Error adding debit card');
        }
    });

    cardContainers.forEach(container => {
        const removeBtn = container.querySelector('.remove-card-btn');
        const defaultCardRadio = container.querySelector('.default-card-radio');

        container.addEventListener('mouseover', () => {
            removeBtn.style.display = 'block';
        });
        container.addEventListener('mouseleave', () => {
            removeBtn.style.display = 'none';
        });

        removeBtn.addEventListener('click', async () => {
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
                console.error('Error deleting card:', error);
                alert('An error occurred while deleting the card. Please try again.');
            }
        });

        defaultCardRadio.addEventListener('change', async () => {
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
                console.error('Error setting default card:', error);
                alert('An error occurred while setting the default card. Please try again.');
            }
        });
    });
});
