const forSaleCheckbox = document.getElementById('for_sale_checkbox');
const priceContainer = document.getElementById('price-container');

const togglePriceInput = () => {
    if (forSaleCheckbox.checked) {
        priceContainer.style.display = 'block';
    } else {
        priceContainer.style.display = 'none';
    }
};

forSaleCheckbox.addEventListener('change', togglePriceInput);

togglePriceInput();