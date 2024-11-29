
const forSaleCheckbox = document.getElementById("for-sale-checkbox");
const collectionCheckbox = document.getElementById("collection-checkbox");
const priceContainer = document.getElementById("price-container");

const togglePriceField = () => {
    if (forSaleCheckbox.checked) {
        priceContainer.style.display = "block";
        collectionCheckbox.checked = false;
    } else {
        priceContainer.style.display = "none";
    }
};

collectionCheckbox.addEventListener("change", () => {
    if (collectionCheckbox.checked) {
        forSaleCheckbox.checked = false;
        priceContainer.style.display = "none";
    }
});

forSaleCheckbox.addEventListener("change", togglePriceField);

// Initialize the price input visibility
togglePriceField();