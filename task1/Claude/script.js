// ===========================
// NAVIGATION MENU TOGGLE
// ===========================
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
});

// Close menu when clicking nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});

// ===========================
// SMOOTH SCROLLING
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===========================
// FORM VALIDATION & SUBMISSION
// ===========================

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Feedback Form
const feedbackForm = document.getElementById('feedback-form');
const feedbackEmail = document.getElementById('feedback-email');
const feedbackMessage = document.getElementById('feedback-message');
const emailError = document.getElementById('email-error');
const messageError = document.getElementById('message-error');
const feedbackSuccess = document.getElementById('feedback-success');

feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validate email
    if (!feedbackEmail.value.trim()) {
        emailError.textContent = 'Email is required';
        feedbackEmail.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else if (!emailRegex.test(feedbackEmail.value.trim())) {
        emailError.textContent = 'Please enter a valid email address';
        feedbackEmail.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else {
        emailError.textContent = '';
        feedbackEmail.setAttribute('aria-invalid', 'false');
    }
    
    // Validate message
    if (!feedbackMessage.value.trim()) {
        messageError.textContent = 'Message is required';
        feedbackMessage.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else if (feedbackMessage.value.trim().length < 10) {
        messageError.textContent = 'Message must be at least 10 characters';
        feedbackMessage.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else {
        messageError.textContent = '';
        feedbackMessage.setAttribute('aria-invalid', 'false');
    }
    
    if (isValid) {
        // Simulate form submission
        console.log('Feedback submitted:', {
            email: feedbackEmail.value,
            message: feedbackMessage.value
        });
        
        // Show success message
        feedbackSuccess.classList.add('show');
        feedbackForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            feedbackSuccess.classList.remove('show');
        }, 5000);
    }
});

// Clear error on input
feedbackEmail.addEventListener('input', () => {
    emailError.textContent = '';
    feedbackEmail.setAttribute('aria-invalid', 'false');
});

feedbackMessage.addEventListener('input', () => {
    messageError.textContent = '';
    feedbackMessage.setAttribute('aria-invalid', 'false');
});

// Sign In Form
const signinForm = document.getElementById('signin-form');
const signinEmail = document.getElementById('signin-email');
const signinPassword = document.getElementById('signin-password');
const signinEmailError = document.getElementById('signin-email-error');
const signinPasswordError = document.getElementById('signin-password-error');

signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validate email
    if (!signinEmail.value.trim()) {
        signinEmailError.textContent = 'Email is required';
        signinEmail.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else if (!emailRegex.test(signinEmail.value.trim())) {
        signinEmailError.textContent = 'Please enter a valid email address';
        signinEmail.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else {
        signinEmailError.textContent = '';
        signinEmail.setAttribute('aria-invalid', 'false');
    }
    
    // Validate password
    if (!signinPassword.value) {
        signinPasswordError.textContent = 'Password is required';
        signinPassword.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else if (signinPassword.value.length < 6) {
        signinPasswordError.textContent = 'Password must be at least 6 characters';
        signinPassword.setAttribute('aria-invalid', 'true');
        isValid = false;
    } else {
        signinPasswordError.textContent = '';
        signinPassword.setAttribute('aria-invalid', 'false');
    }
    
    if (isValid) {
        // Simulate authentication
        console.log('Sign in attempted:', {
            email: signinEmail.value,
            password: '********'
        });
        
        alert('Sign in successful! (Demo mode)');
        signinForm.reset();
    }
});

// Clear errors on input
signinEmail.addEventListener('input', () => {
    signinEmailError.textContent = '';
    signinEmail.setAttribute('aria-invalid', 'false');
});

signinPassword.addEventListener('input', () => {
    signinPasswordError.textContent = '';
    signinPassword.setAttribute('aria-invalid', 'false');
});

// ===========================
// GALLERY MODAL
// ===========================
const galleryModal = document.getElementById('gallery-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalArtistName = document.getElementById('modal-artist-name');
const modalDescription = document.getElementById('modal-description');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

// Gallery data (in production, this would come from a database/API)
const galleryData = [
    {
        id: 1,
        title: "Winter Majesty",
        artist: "Elena Frost",
        description: "A stunning black cat captured in the pristine winter landscape, showcasing the dramatic contrast between midnight fur and pure white snow. The piercing gaze tells a story of wilderness and grace.",
        image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80"
    },
    {
        id: 2,
        title: "Kitten Couture",
        artist: "Marcus Williams",
        description: "An adorable kitten sporting a fashionable hat, blending innocence with style. This playful portrait celebrates the whimsical nature of our feline friends.",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80"
    },
    {
        id: 3,
        title: "Mystic Guardian",
        artist: "Sofia Chen",
        description: "A mysterious feline figure cloaked in shadowy garments, evoking tales of ancient protectors and nocturnal wanderers. Art meets fantasy in this captivating piece.",
        image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&q=80"
    },
    {
        id: 4,
        title: "Azure Dreams",
        artist: "Isabella Romano",
        description: "A pure white cat with mesmerizing blue eyes that seem to hold the secrets of the universe. The ethereal beauty captured in this portrait is truly breathtaking.",
        image: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&q=80"
    },
    {
        id: 5,
        title: "Fluffy Elegance",
        artist: "Alexander Petrov",
        description: "A long-haired beauty showcasing the luxurious texture and regal bearing that makes Persian cats legendary. Every strand tells a story of grace and refinement.",
        image: "https://images.unsplash.com/photo-1583795128727-6ec3642408f8?w=800&q=80"
    },
    {
        id: 6,
        title: "Rose Aristocat",
        artist: "Yuki Tanaka",
        description: "A sophisticated feline adorned with a delicate pink scarf, embodying the perfect blend of natural beauty and haute couture. Fashion meets feline in this exquisite portrait.",
        image: "https://images.unsplash.com/photo-1573865526739-10c1d3a1f0cc?w=800&q=80"
    }
];

// Open modal
document.querySelectorAll('.gallery-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const imageId = parseInt(btn.getAttribute('data-image'));
        const artwork = galleryData.find(item => item.id === imageId);
        
        if (artwork) {
            modalImage.src = artwork.image;
            modalImage.alt = artwork.title;
            modalTitle.textContent = artwork.title;
            modalArtistName.textContent = artwork.artist;
            modalDescription.textContent = artwork.description;
            
            galleryModal.removeAttribute('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Focus trap
            modalClose.focus();
        }
    });
});

// Close modal
function closeModal() {
    galleryModal.setAttribute('hidden', '');
    document.body.style.overflow = ''; // Restore scrolling
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !galleryModal.hasAttribute('hidden')) {
        closeModal();
    }
});

// ===========================
// LOAD MORE GALLERY ITEMS
// ===========================
const loadMoreBtn = document.getElementById('load-more-btn');
const galleryGrid = document.querySelector('.gallery-grid');

// Additional gallery items to load
const additionalImages = [
    {
        id: 7,
        src: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600&q=80",
        alt: "Ginger tabby cat basking in golden sunlight",
        title: "Golden Hour Glory",
        artist: "Olivia Martinez"
    },
    {
        id: 8,
        src: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600&q=80",
        alt: "Curious kitten with wide innocent eyes",
        title: "Wide-Eyed Wonder",
        artist: "James O'Connor"
    },
    {
        id: 9,
        src: "https://images.unsplash.com/photo-1506755855567-92ff770e8d00?w=600&q=80",
        alt: "Regal Maine Coon with majestic presence",
        title: "Forest Monarch",
        artist: "Natasha Ivanova"
    }
];

loadMoreBtn.addEventListener('click', () => {
    additionalImages.forEach(img => {
        const article = document.createElement('article');
        article.className = 'gallery-item';
        article.setAttribute('role', 'listitem');
        
        article.innerHTML = `
            <div class="gallery-image-wrapper">
                <img src="${img.src}" 
                     alt="${img.alt}" 
                     class="gallery-image"
                     loading="lazy">
                <div class="gallery-overlay">
                    <button class="btn btn-secondary gallery-btn" data-image="${img.id}">View Details</button>
                </div>
            </div>
        `;
        
        galleryGrid.appendChild(article);
        
        // Add data to galleryData
        galleryData.push({
            id: img.id,
            title: img.title,
            artist: img.artist,
            description: "A magnificent feline portrait showcasing unique character and timeless beauty.",
            image: img.src
        });
    });
    
    // Re-attach event listeners to new buttons
    document.querySelectorAll('.gallery-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const imageId = parseInt(btn.getAttribute('data-image'));
            const artwork = galleryData.find(item => item.id === imageId);
            
            if (artwork) {
                modalImage.src = artwork.image;
                modalImage.alt = artwork.title;
                modalTitle.textContent = artwork.title;
                modalArtistName.textContent = artwork.artist;
                modalDescription.textContent = artwork.description;
                
                galleryModal.removeAttribute('hidden');
                document.body.style.overflow = 'hidden';
                modalClose.focus();
            }
        });
    });
    
    // Hide button after loading
    loadMoreBtn.style.display = 'none';
    
    // Show notification
    const notification = document.createElement('p');
    notification.textContent = '✨ More masterpieces loaded!';
    notification.style.cssText = 'text-align: center; color: var(--color-gold); margin-top: var(--spacing-md); font-weight: bold;';
    galleryGrid.parentElement.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
});

// ===========================
// EASTER EGG: PAW CURSOR
// ===========================
const logo = document.getElementById('catallery-logo');
const pawCursor = document.getElementById('paw-cursor');
let hoverTimer;
let isPawActive = false;

logo.addEventListener('mouseenter', () => {
    hoverTimer = setTimeout(() => {
        isPawActive = true;
        // Optional: Play purr sound (commented out to avoid autoplay restrictions)
        // const purr = new Audio('data:audio/wav;base64,...'); // Add base64 purr sound
        // purr.play().catch(err => console.log('Audio play prevented'));
        
        console.log('🐱 Easter egg activated! Purr...');
    }, 2000);
});

logo.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    isPawActive = false;
    pawCursor.classList.remove('active');
});

// Show paw prints when cursor moves (if easter egg is active)
document.addEventListener('mousemove', (e) => {
    if (isPawActive) {
        pawCursor.style.left = e.pageX + 'px';
        pawCursor.style.top = e.pageY + 'px';
        pawCursor.classList.add('active');
        
        // Create temporary paw prints
        const pawPrint = document.createElement('div');
        pawPrint.textContent = '🐾';
        pawPrint.style.cssText = `
            position: absolute;
            left: ${e.pageX}px;
            top: ${e.pageY}px;
            font-size: 16px;
            pointer-events: none;
            animation: fadeOut 2s forwards;
        `;
        document.body.appendChild(pawPrint);
        
        setTimeout(() => {
            pawPrint.remove();
        }, 2000);
    }
});

// Add fade out animation for paw prints
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0.5);
        }
    }
`;
document.head.appendChild(style);

// ===========================
// HERO CAT IMAGE BLINK EFFECT
// ===========================
const heroCatImage = document.querySelector('.hero-cat-image');

if (heroCatImage) {
    setInterval(() => {
        heroCatImage.style.opacity = '0.8';
        setTimeout(() => {
            heroCatImage.style.opacity = '1';
        }, 150);
    }, 5000); // Blink every 5 seconds
}

// ===========================
// LAZY LOADING OPTIMIZATION
// ===========================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src; // Trigger load if not already loaded
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===========================
// SCROLL ANIMATIONS
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for scroll animations
document.querySelectorAll('.about-section, .gallery-section, .feedback-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// ===========================
// ACCESSIBILITY: ANNOUNCE PAGE CHANGES
// ===========================
const announcer = document.createElement('div');
announcer.setAttribute('role', 'status');
announcer.setAttribute('aria-live', 'polite');
announcer.setAttribute('aria-atomic', 'true');
announcer.className = 'sr-only';
document.body.appendChild(announcer);

function announce(message) {
    announcer.textContent = message;
    setTimeout(() => {
        announcer.textContent = '';
    }, 1000);
}

// Announce section changes on navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = link.getAttribute('href');
        const section = target.replace('#', '');
        announce(`Navigating to ${section} section`);
    });
});

// ===========================
// PERFORMANCE: DEBOUNCE SCROLL
// ===========================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
const handleScroll = debounce(() => {
    // Add any scroll-based functionality here
    console.log('Scroll optimized');
}, 100);

window.addEventListener('scroll', handleScroll);

console.log('🐱 Welcome to Catallery! Hover over the logo for 2 seconds for a surprise...');