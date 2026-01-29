/////////////////////////////////////////////////////////////////////
////////////////////////////// Navbar //////////////////////////////
/////////////////////////////////////////////////////////////////////


const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navbar.classList.toggle('active');
});

// Close menu when clicking a link
const navLinks = document.querySelectorAll('#navbar a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navbar.classList.remove('active');
    });
});


/////////////////////////////////////////////////////////////////////
////////////////////////////// Gallery //////////////////////////////
/////////////////////////////////////////////////////////////////////

const images_div = document.querySelector(".all-images");

for (let i = 1; i <= 9; i++) {
    const div = document.createElement('div');
    const img = document.createElement('img');

    img.src = `images/c${i}.jpg`;
    img.alt = `Cat Art ${i}`;
    img.className = "gallery-image";

    div.className = "image-container";
    div.appendChild(img);

    images_div.appendChild(div);
}
