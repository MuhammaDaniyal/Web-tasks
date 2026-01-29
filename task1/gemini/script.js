// Navigation Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Easter Egg: Logo Hover Purr & Paw
const logo = document.getElementById('mainLogo');
let hoverTimer;

logo.addEventListener('mouseenter', () => {
    hoverTimer = setTimeout(() => {
        // Change Cursor
        document.body.classList.add('paw-cursor');
        
        // Play Purr (Subtle Audio)
        const purr = new Audio('https://www.soundjay.com/nature/sounds/cat-purr-01.mp3');
        purr.volume = 0.3;
        purr.play();
        
        console.log("Easter Egg Activated: Purrfection!");
    }, 2000);
});

logo.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    document.body.classList.remove('paw-cursor');
});

// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});