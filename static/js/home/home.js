const aboutButton = document.getElementById('about');
const whatIsArtfluenceDiv = document.getElementById('what-is-artfluence');
const homeButton = document.getElementById('home-btn');
const homeDiv = document.getElementById('home-div');
const contactsButton = document.getElementById('contacts-btn');
const contactsDiv = document.getElementById('contacts-div');

aboutButton.addEventListener('click', function () {
    whatIsArtfluenceDiv.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

homeButton.addEventListener('click', function () {
    homeDiv.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

contactsButton.addEventListener('click', function () {
    contactsDiv.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

function toggleMenu() {
    const navMenu = document.querySelector('.header-anchors-container');
    navMenu.classList.toggle('active');
}
