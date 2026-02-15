// ==========================================
// 1. GLOBAL VARIABLES AND CONSTANTS
// ==========================================

const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');

// Fixed canvas dimensions
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Roll number for calculating max slider values
const ROLL_NUMBER = 579;
const IS_EVEN = ROLL_NUMBER % 2 === 0;
const MAX_STEP = IS_EVEN ? 2 : 3;

// Image state class
class ImageData {
    constructor() {
        this.brightness = 100;
        this.saturation = 100;
        this.inversion = 0;
        this.grayscale = 0;
        this.sepia = 0;
        this.blur = 0;
        this.rotate = 0;
        this.fliph = 1;   // 1 or -1
        this.flipv = 1;   // 1 or -1
    }
    
    // Create a deep copy
    clone() {
        const copy = new ImageData();
        copy.brightness = this.brightness;
        copy.saturation = this.saturation;
        copy.inversion = this.inversion;
        copy.grayscale = this.grayscale;
        copy.sepia = this.sepia;
        copy.blur = this.blur;
        copy.rotate = this.rotate;
        copy.fliph = this.fliph;
        copy.flipv = this.flipv;
        return copy;
    }
}

// Global state
const image_data = new ImageData();
let originalImage = new Image();
let currentMode = "Brightness";
let sliderDebounceTimer = null;

// History management
const MAX_HISTORY = 20;
let history = [];
let historyIndex = -1;

// UI Elements
const filterSlider = document.getElementById('filter-slider');
const filterName = document.getElementById('filter-name');
const filterValue = document.getElementById('filter-value');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const fileInput = document.getElementById('file-input');

// ==========================================
// 2. IMAGE FITTING CALCULATIONS
// ==========================================

/**
 * Calculate how to fit and position the image in the canvas
 * considering the current rotation
 */
function calculateImageLayout(img, rotation) {
    if (!img.complete || img.width === 0 || img.height === 0) {
        return {
            scale: 1,
            displayWidth: 0,
            displayHeight: 0,
            centerX: CANVAS_WIDTH / 2,
            centerY: CANVAS_HEIGHT / 2
        };
    }
    
    // Calculate rotated bounding box
    const rad = (rotation % 360) * Math.PI / 180;
    const absRad = Math.abs(rad);
    
    const rotatedWidth = Math.abs(img.width * Math.cos(absRad)) + 
                        Math.abs(img.height * Math.sin(absRad));
    const rotatedHeight = Math.abs(img.width * Math.sin(absRad)) + 
                         Math.abs(img.height * Math.cos(absRad));
    
    // Calculate scale to fit within canvas
    const scaleX = CANVAS_WIDTH / rotatedWidth;
    const scaleY = CANVAS_HEIGHT / rotatedHeight;
    const scale = Math.min(scaleX, scaleY);
    
    return {
        scale: scale,
        displayWidth: img.width * scale,
        displayHeight: img.height * scale,
        centerX: CANVAS_WIDTH / 2,
        centerY: CANVAS_HEIGHT / 2
    };
}

// ==========================================
// 3. CORE RENDERING FUNCTION
// ==========================================

/**
 * Main function to draw the image with all filters and transforms
 * This is the ONLY place where canvas rendering happens
 */
function drawImage() {
    if (!originalImage.complete) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Calculate layout based on rotation
    const layout = calculateImageLayout(originalImage, image_data.rotate);
    
    // Save context state
    ctx.save();
    
    // Apply all filters via canvas context filter property
    ctx.filter = `
        brightness(${image_data.brightness}%)
        saturate(${image_data.saturation}%)
        invert(${image_data.inversion}%)
        grayscale(${image_data.grayscale}%)
        sepia(${image_data.sepia}%)
        blur(${(image_data.blur / 100) * 10}px)
    `.trim().replace(/\s+/g, ' ');
    
    // Move to canvas center
    ctx.translate(layout.centerX, layout.centerY);
    
    // Apply rotation
    ctx.rotate(image_data.rotate * Math.PI / 180);
    
    // Apply flip (scale by -1 flips the axis)
    ctx.scale(image_data.fliph, image_data.flipv);
    
    // Draw image centered at origin
    ctx.drawImage(
        originalImage,
        -layout.displayWidth / 2,
        -layout.displayHeight / 2,
        layout.displayWidth,
        layout.displayHeight
    );
    
    // Restore context state
    ctx.restore();
}

// ==========================================
// 4. MODE SWITCHING FUNCTIONS
// ==========================================

/**
 * Update UI to show active filter button
 */
function setActiveFilter(filterId) {
    // Remove active class from all filter buttons
    const buttons = document.querySelectorAll('.options .button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected button
    const activeBtn = document.getElementById(filterId);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function onChangeModeToBrightness() {
    currentMode = "Brightness";
    filterName.textContent = "Brightness";
    filterSlider.min = 0;
    filterSlider.max = MAX_STEP * 100;
    filterSlider.value = image_data.brightness;
    filterValue.textContent = image_data.brightness + "%";
    setActiveFilter('brightness-btn');
}

function onChangeModeToSaturation() {
    currentMode = "Saturation";
    filterName.textContent = "Saturation";
    filterSlider.min = 0;
    filterSlider.max = MAX_STEP * 100;
    filterSlider.value = image_data.saturation;
    filterValue.textContent = image_data.saturation + "%";
    setActiveFilter('saturation-btn');
}

function onChangeModeToInversion() {
    currentMode = "Inversion";
    filterName.textContent = "Inversion";
    filterSlider.min = 0;
    filterSlider.max = 100;
    filterSlider.value = image_data.inversion;
    filterValue.textContent = image_data.inversion + "%";
    setActiveFilter('inversion-btn');
}

function onChangeModeToGrayscale() {
    currentMode = "Grayscale";
    filterName.textContent = "Grayscale";
    filterSlider.min = 0;
    filterSlider.max = 100;
    filterSlider.value = image_data.grayscale;
    filterValue.textContent = image_data.grayscale + "%";
    setActiveFilter('grayscale-btn');
}

function onChangeModeToSepia() {
    currentMode = "Sepia";
    filterName.textContent = "Sepia";
    filterSlider.min = 0;
    filterSlider.max = 100;
    filterSlider.value = image_data.sepia;
    filterValue.textContent = image_data.sepia + "%";
    setActiveFilter('sepia-btn');
}

function onChangeModeToBlur() {
    currentMode = "Blur";
    filterName.textContent = "Blur";
    filterSlider.min = 0;
    filterSlider.max = 100;
    filterSlider.value = image_data.blur;
    filterValue.textContent = image_data.blur + "%";
    setActiveFilter('blur-btn');
}

// ==========================================
// 5. TRANSFORM FUNCTIONS
// ==========================================

function rotateLeft() {
    image_data.rotate -= 90;
    // Normalize to 0-359 range
    if (image_data.rotate < 0) {
        image_data.rotate += 360;
    }
    drawImage();
    pushToHistory();
}

function rotateRight() {
    image_data.rotate += 90;
    // Normalize to 0-359 range
    if (image_data.rotate >= 360) {
        image_data.rotate -= 360;
    }
    drawImage();
    pushToHistory();
}

function flipHorizontal() {
    image_data.fliph *= -1;
    drawImage();
    pushToHistory();
}

function flipVertical() {
    image_data.flipv *= -1;
    drawImage();
    pushToHistory();
}

// ==========================================
// 6. FILTER APPLICATION
// ==========================================

/**
 * Handle slider input - update filter value and redraw
 * Use debouncing for history to avoid too many history entries
 */
function onInputSlider() {
    const value = parseInt(filterSlider.value);
    
    // Update the current filter value
    switch(currentMode) {
        case "Brightness":
            image_data.brightness = value;
            filterValue.textContent = value + "%";
            break;
        case "Saturation":
            image_data.saturation = value;
            filterValue.textContent = value + "%";
            break;
        case "Inversion":
            image_data.inversion = value;
            filterValue.textContent = value + "%";
            break;
        case "Grayscale":
            image_data.grayscale = value;
            filterValue.textContent = value + "%";
            break;
        case "Sepia":
            image_data.sepia = value;
            filterValue.textContent = value + "%";
            break;
        case "Blur":
            image_data.blur = value;
            filterValue.textContent = value + "%";
            break;
    }
    
    // Redraw immediately for real-time preview
    drawImage();
    
    // Debounce history push (300ms after slider stops)
    clearTimeout(sliderDebounceTimer);
    sliderDebounceTimer = setTimeout(() => {
        pushToHistory();
    }, 300);
}

// ==========================================
// 7. BUTTON FUNCTIONS
// ==========================================

/**
 * Reset all filters to default values
 */
function resetImage() {
    image_data.brightness = 100;
    image_data.saturation = 100;
    image_data.inversion = 0;
    image_data.grayscale = 0;
    image_data.sepia = 0;
    image_data.blur = 0;
    image_data.rotate = 0;
    image_data.fliph = 1;
    image_data.flipv = 1;
    
    // Update UI based on current mode
    switch(currentMode) {
        case "Brightness":
            onChangeModeToBrightness();
            break;
        case "Saturation":
            onChangeModeToSaturation();
            break;
        case "Inversion":
            onChangeModeToInversion();
            break;
        case "Grayscale":
            onChangeModeToGrayscale();
            break;
        case "Sepia":
            onChangeModeToSepia();
            break;
        case "Blur":
            onChangeModeToBlur();
            break;
    }
    
    drawImage();
    pushToHistory();
}

/**
 * Open file dialog to choose an image
 */
function chooseImageFtn() {
    fileInput.click();
}

/**
 * Save the current canvas as a PNG image
 */
function saveImage() {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ==========================================
// 8. HISTORY MANAGEMENT
// ==========================================

/**
 * Push current state to history
 */
function pushToHistory() {
    // If we're not at the end of history, truncate future history
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    
    // Add current state
    history.push(image_data.clone());
    
    // Limit history size
    if (history.length > MAX_HISTORY) {
        history.shift();
    } else {
        historyIndex++;
    }
    
    updateUndoRedoButtons();
}

/**
 * Undo to previous state
 */
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const state = history[historyIndex];
        
        // Restore state
        image_data.brightness = state.brightness;
        image_data.saturation = state.saturation;
        image_data.inversion = state.inversion;
        image_data.grayscale = state.grayscale;
        image_data.sepia = state.sepia;
        image_data.blur = state.blur;
        image_data.rotate = state.rotate;
        image_data.fliph = state.fliph;
        image_data.flipv = state.flipv;
        
        updateUIFromCurrentState();
        drawImage();
        updateUndoRedoButtons();
    }
}

/**
 * Redo to next state
 */
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const state = history[historyIndex];
        
        // Restore state
        image_data.brightness = state.brightness;
        image_data.saturation = state.saturation;
        image_data.inversion = state.inversion;
        image_data.grayscale = state.grayscale;
        image_data.sepia = state.sepia;
        image_data.blur = state.blur;
        image_data.rotate = state.rotate;
        image_data.fliph = state.fliph;
        image_data.flipv = state.flipv;
        
        updateUIFromCurrentState();
        drawImage();
        updateUndoRedoButtons();
    }
}

/**
 * Enable/disable undo and redo buttons based on history state
 */
function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
}

/**
 * Update UI elements to reflect current state
 */
function updateUIFromCurrentState() {
    // Update slider based on current mode
    switch(currentMode) {
        case "Brightness":
            filterSlider.value = image_data.brightness;
            filterValue.textContent = image_data.brightness + "%";
            break;
        case "Saturation":
            filterSlider.value = image_data.saturation;
            filterValue.textContent = image_data.saturation + "%";
            break;
        case "Inversion":
            filterSlider.value = image_data.inversion;
            filterValue.textContent = image_data.inversion + "%";
            break;
        case "Grayscale":
            filterSlider.value = image_data.grayscale;
            filterValue.textContent = image_data.grayscale + "%";
            break;
        case "Sepia":
            filterSlider.value = image_data.sepia;
            filterValue.textContent = image_data.sepia + "%";
            break;
        case "Blur":
            filterSlider.value = image_data.blur;
            filterValue.textContent = image_data.blur + "%";
            break;
    }
}

// ==========================================
// 9. EVENT LISTENERS
// ==========================================

// Undo/Redo buttons
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

// File input change
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Reset all filters
                image_data.brightness = 100;
                image_data.saturation = 100;
                image_data.inversion = 0;
                image_data.grayscale = 0;
                image_data.sepia = 0;
                image_data.blur = 0;
                image_data.rotate = 0;
                image_data.fliph = 1;
                image_data.flipv = 1;
                
                // Set new image
                originalImage = img;
                
                // Reset history
                history = [];
                historyIndex = -1;
                
                // Update UI
                currentMode = "Brightness";
                onChangeModeToBrightness();
                
                // Draw and save to history
                drawImage();
                pushToHistory();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// ==========================================
// 10. INITIALIZATION
// ==========================================

/**
 * Initialize the application with a default image
 */
function init() {
    // Create a placeholder image if no default image is available
    // For a real application, you would load a default image here
    
    // Draw initial state
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#999';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Click "Choose Image" to start editing', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    // Initialize UI
    onChangeModeToBrightness();
    updateUndoRedoButtons();
    
    // Try to load a default test image (optional)
    // If the image doesn't exist, the placeholder will remain
    const testImg = new Image();
    testImg.onload = function() {
        originalImage = testImg;
        drawImage();
        pushToHistory();
    };
    testImg.onerror = function() {
        // Image not found, keep placeholder
        console.log('Default image not found. Please choose an image to start editing.');
    };
    testImg.src = 'test_pic.jpeg';
}

// Start the application
init();
