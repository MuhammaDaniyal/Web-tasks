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
const number = 6;

// Sample descriptions for each image
const descriptions = [
    "Persian Cat - Fluffy and Majestic",
    "Siamese Cat - Elegant Blue Eyes",
    "Bengal Cat - Wild and Spotted",
    "Ragdoll Cat - Gentle Giant",
    "Sphynx Cat - Hairless Wonder", 
    "Maine Coon - Forest King"
];

for(let i = 1; i <= number; i++) {
    const image_div = document.createElement('div');
    const img = document.createElement('img');
    const description = document.createElement('span');
    
    img.src = `images/cat${i}.jpeg`;
    img.alt = `Cat Art ${i}`;
    img.classList.add('gallery-image');
    
    // Add description text (using array or simple text)
    description.textContent = descriptions[i-1] || `Cat Artwork ${i}`;
    description.classList.add('image-description');
    
    image_div.classList.add('image-container');
    image_div.append(img, description);
    images_div.appendChild(image_div);
}


/////////////////////////////////////////////////////////////////////
////////////////////////////// Slider //////////////////////////////
/////////////////////////////////////////////////////////////////////


document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('simpleTrack');
    const items = track.innerHTML;
    
    track.innerHTML += items + items;
    
    const originalSpans = Array.from(track.children).slice(0, 4); 
    let patternWidth = 0;
    originalSpans.forEach(el => patternWidth += el.offsetWidth);

    gsap.to(track, {
        x: -patternWidth,
        duration: 7,           // ← changed — more pleasant
        ease: "none",
        repeat: -1,
        onRepeat: () => {
            gsap.set(track, { x: 0 });
        }
    });
});


/////////////////////////////////////////////////////////////////////
//////////////////////////// Qualities //////////////////////////////
/////////////////////////////////////////////////////////////////////

gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray(['#title-service-1', '#title-service-2', '#title-service-3', '#title-service-4'])
    .forEach((el, i) => {
        const xValues = [20, -30, 10, -10];
        
        gsap.fromTo(el, 
            {x: `${xValues[i]}%`},
            { 
                x: 0,

                scrollTrigger: {
                    trigger: el,
                    start: "top 80%",
                    end: "top -10%",
                    scrub: 0.5,
                }
            }
        );
});



// Lenis

// // Initialize Lenis
// const lenis = new Lenis({
//     duration: 1.2,           // Animation duration
//     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
//     direction: 'vertical',   // vertical | horizontal
//     gestureDirection: 'vertical', // vertical | horizontal | both
//     smooth: true,            // Enable smooth scroll
//     smoothTouch: false,      // Smooth scroll on touch devices
//     touchMultiplier: 2,      // How much to scroll on touch
//     infinite: false,         // Infinite scroll
// });

// // RAF loop for smooth animation
// function raf(time) {
//     lenis.raf(time);
//     requestAnimationFrame(raf);
// }
// requestAnimationFrame(raf);