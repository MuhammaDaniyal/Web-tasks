const line1 = document.querySelector("#line1");
const line2 = document.querySelector("#line2");
const hamburger = document.querySelector("#hamburger");
let toggleBool = false;
const navbar = document.querySelector("#navbar");

const toggleFtn = () => {
    toggleBool = !toggleBool;
    
    if(toggleBool) {
        navbar.style.transform = "translateX(-100%)";
        line1.style.transform = "translateY(2px) rotate(45deg)";
        line2.style.transform = "translateY(-2px) rotate(-45deg)";
    } else {
        navbar.style.transform = "translateX(0)";
        line1.style.transform = "translateY(0) rotate(0deg)";
        line2.style.transform = "translateY(0) rotate(0deg)";
    }
}

hamburger.addEventListener("click", toggleFtn);