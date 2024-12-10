const forSaleCheckbox = document.getElementById("for-sale-checkbox");
const collectionCheckbox = document.getElementById('collection-checkbox');
const priceField = document.getElementById("price-field");
const priceInput = document.querySelector('#price-field input');

const togglePriceField = () => {
    if (forSaleCheckbox.checked) {
        priceInput.disabled = false;
        collectionCheckbox.checked = false;
    } else {
        priceInput.disabled = true;
        priceInput.value = '';
    }
};

collectionCheckbox.addEventListener('change', () => {
    if(collectionCheckbox.checked){
        forSaleCheckbox.checked = false;
        priceInput.disabled = true;
        priceInput.value = '';
    }
})

forSaleCheckbox.addEventListener('change', togglePriceField);

togglePriceField();