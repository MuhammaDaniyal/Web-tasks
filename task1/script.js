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
const number = 9;

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
    
    img.src = `images/c${i}.jpg`;
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
    
    track.innerHTML += items + items + items;
    
    const originalSpans = Array.from(track.children).slice(0, 4); 
    let patternWidth = 0;
    originalSpans.forEach(el => patternWidth += el.offsetWidth);

    gsap.to(track, {
        x: -patternWidth,
        duration: 7,
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
        const xValues = [30, -40, 30, -40];
        
        gsap.fromTo(el, 
            {x: `${xValues[i]}%`},
            { 
                x: `${-xValues[i]}%`,

                scrollTrigger: {
                    trigger: "#qualities",
                    start: "top 100%",
                    end: "top -50%",
                    scrub: 0.25,
                }
            }
        );
});

/////////////////////////////////////////////////////////////////////
////////////////////////// Smooth Scroll ////////////////////////////
/////////////////////////////////////////////////////////////////////

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            lenis.scrollTo(target, {
                duration: 3,
                easing: (t) => 1 - Math.pow(1 - t, 3)
            });
        }
    });
});
