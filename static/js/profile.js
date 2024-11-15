const selector = document.getElementById('view-selector');
const collectionView = document.getElementById('collection-view');
const forSaleView = document.getElementById('for-sale-view');

function updateView() {
    const selectedValue = selector.value;
    if (selectedValue === 'collection') {
        collectionView.style.display = 'block';
        forSaleView.style.display = 'none';
    } else if (selectedValue === 'for-sale') {
        collectionView.style.display = 'none';
        forSaleView.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateView();
});