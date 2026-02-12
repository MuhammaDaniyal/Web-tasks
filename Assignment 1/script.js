
// =================================================
// ============= MODE CHANGE FUNCTIONS =============
// =================================================

const test_div = document.getElementById("test_div");

class ImageData {
    constructor(inversion = 0, brightness = 100, saturation = 100, grayscale = 0, sepia = 0, blur = 0, rotate = 0, flip_h = 1, flip_v = 1) {
        this.inversion = inversion;
        this.brightness = brightness;
        this.saturation = saturation;
        this.grayscale = grayscale;
        this.sepia = sepia;
        this.blur = blur;

        this.rotate = rotate;
        this.fliph = flip_h;
        this.flipv = flip_v;
    }
}

const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const filter_name = document.getElementById("filter-name");
const filter_slider = document.getElementById("filter-slider");
const filter_value = document.getElementById("filter-value");

const rotate_left = document.getElementById("rotate-left");
const rotate_right = document.getElementById("rotate-right");
const flip_h = document.getElementById("flip-h");
const flip_v = document.getElementById("flip-v");

const reset_btn = document.getElementById("reset");
const chooseImageBtn = document.getElementById("choose-image");
const save_image_btn = document.getElementById('save-image');
const undo_btn = document.getElementById('undo');
const redo_btn = document.getElementById('redo');

const image_data = new ImageData();
let currentMode = "Brightness";

const img = new Image();
img.crossOrigin = "Anonymous";
img.src = 'test_pic.jpeg';

const rollNumber = 579;
const isEven = rollNumber % 2 === 0;
const maxStep = isEven ? 2 : 3;

filter_slider.max = currentMode === 'Brightness' || currentMode === 'Saturation' ? maxStep * 100 : 100;

let sliderTimeout;

// =================================================
// ============= MODE CHANGE FUNCTIONS =============
// =================================================

function onChangeModeToBrightness() {
    currentMode = 'Brightness';
    filter_name.innerText = 'Brightness';
    filter_slider.max = maxStep * 100;
    filter_slider.value = image_data.brightness;
    filter_value.innerText = `${image_data.brightness}%`;
}

function onChangeModeToSaturation() {
    currentMode = 'Saturation';
    filter_name.innerText = 'Saturation';
    filter_slider.max = maxStep * 100;
    filter_slider.value = image_data.saturation;
    filter_value.innerText = `${image_data.saturation}%`;
}

function onChangeModeToInversion() {
    currentMode = 'Inversion';
    filter_name.innerText = 'Inversion';
    filter_slider.max = maxStep * 100;
    filter_slider.value = image_data.inversion;
    filter_value.innerText = `${image_data.inversion}%`;
}

function onChangeModeToGrayscale() {
    currentMode = 'Grayscale';
    filter_name.innerText = 'Grayscale';
    filter_slider.max = maxStep * 100;
    filter_slider.value = image_data.grayscale;
    filter_value.innerText = `${image_data.grayscale}%`;
}

function onChangeModeToSepia() {
    currentMode = 'Sepia';
    filter_name.innerText = 'Sepia';
    filter_slider.max = maxStep * 100;
    filter_slider.value = image_data.sepia;
    filter_value.innerText = `${image_data.sepia}%`;
}

function onChangeModeToBlur() {
    currentMode = 'Blur';
    filter_name.innerText = 'Blur';
    filter_slider.value = image_data.blur;
    filter_slider.max = maxStep * 100;
    const blurValue = (image_data.blur / 100) * 10;
    filter_value.innerText = `${blurValue.toFixed(1)}px`;
}


// =================================================
// ==================== MOVEMENT ===================
// =================================================

function rotateLeft() {
    image_data.rotate -= 90;
    canvas.style.transform = `rotate(${image_data.rotate}deg) scaleX(${image_data.fliph}) scaleY(${image_data.flipv})`;
    pushToHistory();
}

function rotateRight() {
    image_data.rotate += 90;
    canvas.style.transform = `rotate(${image_data.rotate}deg) scaleX(${image_data.fliph}) scaleY(${image_data.flipv})`;
    pushToHistory();
}

function flipHorizontal() {
    image_data.fliph *= -1;
    canvas.style.transform = `rotate(${image_data.rotate}deg) scaleX(${image_data.fliph}) scaleY(${image_data.flipv})`;
    pushToHistory();
}

function flipVertical() {
    image_data.flipv *= -1;
    canvas.style.transform = `rotate(${image_data.rotate}deg) scaleX(${image_data.fliph}) scaleY(${image_data.flipv})`;
    pushToHistory();
}


// =================================================
// ================= IMPLEMENTATION ================
// =================================================



function updateCanvasFilter() {
    let filterString = '';

    // Add all non-default filters
    if (image_data.brightness !== 100)
        filterString += `brightness(${image_data.brightness}%) `;

    if (image_data.saturation !== 100)
        filterString += `saturate(${image_data.saturation}%) `;

    if (image_data.inversion !== 0)
        filterString += `invert(${image_data.inversion}%) `;

    if (image_data.grayscale !== 0)
        filterString += `grayscale(${image_data.grayscale}%) `;

    if (image_data.sepia !== 0)
        filterString += `sepia(${image_data.sepia}%) `;

    if (image_data.blur !== 0) {
        const blurValue = (image_data.blur / 100) * 10;
        filterString += `blur(${blurValue}px) `;
    }

    // If no filters, set to none
    canvas.style.filter = filterString.trim() || 'none';
}


function onInputSlider() {
    const value = this.value;

    switch (currentMode) {
        case 'Brightness':
            image_data.brightness = value;
            filter_value.innerText = value + '%';
            break;
        case 'Saturation':
            image_data.saturation = value;
            filter_value.innerText = value + '%';
            break;
        case 'Inversion':
            image_data.inversion = value;
            filter_value.innerText = value + '%';
            break;
        case 'Grayscale':
            image_data.grayscale = value;
            filter_value.innerText = value + '%';
            break;
        case 'Sepia':
            image_data.sepia = value;
            filter_value.innerText = value + '%';
            break;
        case 'Blur':
            image_data.blur = value;
            const blurValue = (value / 100) * 10;
            filter_value.innerText = blurValue.toFixed(1) + 'px';
            break;
    }

    // Update ALL filters at once
    updateCanvasFilter();
    clearTimeout(sliderTimeout);
    sliderTimeout = setTimeout(() => {
        pushToHistory();
    }, 300);
}

// =================================================
// ================== BUTTON LOGIC =================
// =================================================

function resetImage() {
    image_data.brightness = 100;
    image_data.saturation = 100;
    image_data.sepia = 0;
    image_data.inversion = 0;
    image_data.blur = 0;
    image_data.grayscale = 0;
    image_data.rotate = 0;
    image_data.fliph = 1;
    image_data.flipv = 1;

    canvas.style.transform = `rotate(${image_data.rotate}deg) scaleX(${image_data.fliph}) scaleY(${image_data.flipv})`;

    if (currentMode == "Brightness" || currentMode == "Saturation") {
        filter_value.innerText = `100%`;
        filter_slider.value = 100;
    }
    else {
        filter_value.innerText = `0`;
        filter_slider.value = 0;
    }

    updateCanvasFilter();
    pushToHistory();
}

function chooseImageFtn() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    // Clear any existing transforms
                    canvas.style.transform = 'none';

                    // Reset all image data
                    image_data.brightness = 100;
                    image_data.saturation = 100;
                    image_data.inversion = 0;
                    image_data.grayscale = 0;
                    image_data.sepia = 0;
                    image_data.blur = 0;
                    image_data.rotate = 0;
                    image_data.fliph = 1;
                    image_data.flipv = 1;

                    // Draw new image
                    resizeCanvasToFitImage(img);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Reset filter
                    canvas.style.filter = 'none';
                    updateCanvasFilter();

                    // Reset UI
                    onChangeModeToBrightness();
                    pushToHistory();
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        }
    }

    fileInput.click();
}

// =================================================
// ==================== HISTORY ====================
// =================================================

let history = [];
let currentHistoryIndex = 0;
const MAX_HISTORY = 20;

function updateUndoRedoButtons() {
    // Disable undo if at first item
    if (currentHistoryIndex === 0) {
        undo_btn.disabled = true;
    } else {
        undo_btn.disabled = false;
    }

    // Disable redo if at last item
    if (currentHistoryIndex === history.length - 1) {
        redo_btn.disabled = true;
    } else {
        redo_btn.disabled = false;
    }
}

function pushToHistory() {

    if (currentHistoryIndex < history.length - 1) {
        history = history.slice(0, currentHistoryIndex + 1);
    }

    const newState = new ImageData(
        image_data.inversion,
        image_data.brightness,
        image_data.saturation,
        image_data.grayscale,
        image_data.sepia,
        image_data.blur,
        image_data.rotate,
        image_data.fliph,
        image_data.flipv
    );

    history.push(newState);

    currentHistoryIndex = history.length - 1;

    if (history.length > MAX_HISTORY) {
        history.shift();
        currentHistoryIndex--;
    }
    updateUndoRedoButtons();

}

function undo() {

    if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        const state = history[currentHistoryIndex];

        image_data.inversion = state.inversion;
        image_data.brightness = state.brightness;
        image_data.saturation = state.saturation;
        image_data.grayscale = state.grayscale;
        image_data.sepia = state.sepia;
        image_data.blur = state.blur;
        image_data.rotate = state.rotate;
        image_data.fliph = state.fliph;
        image_data.flipv = state.flipv;

        canvas.style.transform = `rotate(${image_data.rotate}deg) scaleX(${image_data.fliph}) scaleY(${image_data.flipv})`;
        updateCanvasFilter();

        updateUIFromCurrentState();
    }
    test_div.innerText = `History Length: ${history.length}, Current Index: ${currentHistoryIndex}`;
    updateUndoRedoButtons();
}

function redo() {
    // Check if we can redo
    if (currentHistoryIndex < history.length - 1) {
        currentHistoryIndex++;
        const state = history[currentHistoryIndex];

        // Copy all values to image_data
        image_data.inversion = state.inversion;
        image_data.brightness = state.brightness;
        image_data.saturation = state.saturation;
        image_data.grayscale = state.grayscale;
        image_data.sepia = state.sepia;
        image_data.blur = state.blur;
        image_data.rotate = state.rotate;
        image_data.fliph = state.fliph;
        image_data.flipv = state.flipv;

        // Update canvas
        canvas.style.transform = `rotate(${image_data.rotate}deg) scaleX(${image_data.fliph}) scaleY(${image_data.flipv})`;
        updateCanvasFilter();

        // Update UI based on current mode
        updateUIFromCurrentState();
    }
    test_div.innerText = `History Length: ${history.length}, Current Index: ${currentHistoryIndex}`;
    updateUndoRedoButtons();
}

function updateUIFromCurrentState() {
    // Update slider and value display based on current mode
    switch (currentMode) {
        case 'Brightness':
            filter_slider.value = image_data.brightness;
            filter_value.innerText = `${image_data.brightness}%`;
            break;
        case 'Saturation':
            filter_slider.value = image_data.saturation;
            filter_value.innerText = `${image_data.saturation}%`;
            break;
        case 'Inversion':
            filter_slider.value = image_data.inversion;
            filter_value.innerText = `${image_data.inversion}%`;
            break;
        case 'Grayscale':
            filter_slider.value = image_data.grayscale;
            filter_value.innerText = `${image_data.grayscale}%`;
            break;
        case 'Sepia':
            filter_slider.value = image_data.sepia;
            filter_value.innerText = `${image_data.sepia}%`;
            break;
        case 'Blur':
            filter_slider.value = image_data.blur;
            const blurValue = (image_data.blur / 100) * 10;
            filter_value.innerText = `${blurValue.toFixed(1)}px`;
            break;
    }


}

// Ultilies

function resizeCanvasToFitImage(img) {
    // Max canvas dimensions
    const maxWidth = 500;
    const maxHeight = 400;

    let width = img.width;
    let height = img.height;

    // Calculate new dimensions maintaining aspect ratio
    if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
    }

    if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
    }

    // Update canvas dimensions
    canvas.width = width;
    canvas.height = height;
}

// Replace the image upload drawing part too
img.onload = function () {
    resizeCanvasToFitImage(img);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Reset all image data
    image_data.brightness = 100;
    image_data.saturation = 100;
    image_data.inversion = 0;
    image_data.grayscale = 0;
    image_data.sepia = 0;
    image_data.blur = 0;
    image_data.rotate = 0;
    image_data.fliph = 1;
    image_data.flipv = 1;

    // Reset filter
    canvas.style.filter = 'none';
    canvas.style.transform = 'none';
    updateCanvasFilter();

    // Reset UI
    onChangeModeToBrightness();
    pushToHistory();
}


// =================================================
// ================= EVENT LISTENERS ===============
// =================================================

reset_btn.addEventListener("click", resetImage)
chooseImageBtn.addEventListener("click", chooseImageFtn);

filter_slider.oninput = onInputSlider;

rotate_left.addEventListener("click", rotateLeft);
rotate_right.addEventListener("click", rotateRight);
flip_h.addEventListener("click", flipHorizontal);
flip_v.addEventListener("click", flipVertical);

undo_btn.addEventListener("click", undo);
redo_btn.addEventListener("click", redo);