
const forSaleCheckbox = document.getElementById("for-sale-checkbox");
const collectionCheckbox = document.getElementById("collection-checkbox");
const priceInput = document.getElementById("price");

priceInput.addEventListener('input', () => {
   if (priceInput.value.length >= 2 && priceInput.value[0] === '0') {
        priceInput.value = priceInput.value.slice(1);
    }
});

const togglePriceField = () => {
    if (forSaleCheckbox.checked) {
        priceInput.disabled = false;
        collectionCheckbox.checked = false;
    } else {
        priceInput.disabled = true;
    }
};

collectionCheckbox.addEventListener("change", () => {
    if (collectionCheckbox.checked) {
        forSaleCheckbox.checked = false;
        priceInput.disabled = true;
        priceInput.value = '';
    }
});

forSaleCheckbox.addEventListener("change", togglePriceField);

togglePriceField();
