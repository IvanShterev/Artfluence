const forSaleCheckbox = document.getElementById("for-sale-checkbox");
const collectionCheckbox = document.getElementById('collection-checkbox');
const priceField = document.getElementById("price-field");

const togglePriceField = () => {
    if (forSaleCheckbox.checked) {
        priceField.style.display = "block";
        collectionCheckbox.checked = false;
    } else {
        priceField.style.display = "none";
    }
};

collectionCheckbox.addEventListener('change', () => {
    if(collectionCheckbox.checked){
        forSaleCheckbox.checked = false;
        priceField.style.display = "none";
    }
})

forSaleCheckbox.addEventListener('change', togglePriceField);

togglePriceField();