document.addEventListener('DOMContentLoaded', function() {
    // Handles the hamburger menu
    const hamburger = document.querySelector(".hamburger");
    const labels_bar = document.querySelector("#labels_bar");
    const navLink = document.querySelectorAll(".nav-link");
    const label_icons = document.querySelectorAll('.label_icons')

    hamburger.addEventListener("click", mobileMenu);
    navLink.forEach(n => n.addEventListener("click", closeMenu));

    function mobileMenu() {
        hamburger.classList.toggle("active");
        labels_bar.classList.toggle("labels_bar_2");
        label_icons.forEach(icon =>{
            icon.classList.toggle("label_icons_show");
        })
    }

    function closeMenu() {
        hamburger.classList.remove("active");
        labels_bar.classList.remove("labels_bar_2");
    }


});