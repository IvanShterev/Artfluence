
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