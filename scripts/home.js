document.addEventListener("DOMContentLoaded", () => {
  // Hamburger menu toggle
  const hamburger = document.querySelector(".hamburger");
  const menu = document.getElementById("menu");

  window.toggleMenu = function() {
    if (menu.style.display === "flex") menu.style.display = "none";
    else menu.style.display = "flex";
  };

  // Subtle neon glow effect for headers and buttons
  const headers = document.querySelectorAll("h1, h2, h3");
  headers.forEach(header => {
    header.style.transition = "text-shadow 0.3s ease-in-out";
    header.addEventListener("mouseenter", () => {
      header.style.textShadow = "0 0 10px #39ff14, 0 0 20px #39ff14";
    });
    header.addEventListener("mouseleave", () => {
      header.style.textShadow = "none";
    });
  });

  const buttons = document.querySelectorAll("button");
  buttons.forEach(button => {
    button.style.transition = "box-shadow 0.3s ease-in-out";
    button.addEventListener("mouseenter", () => {
      button.style.boxShadow = "0 0 10px #39ff14, 0 0 20px #39ff14";
    });
    button.addEventListener("mouseleave", () => {
      button.style.boxShadow = "none";
    });
  });

  // Optional: Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e){
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth"
      });
    });
  });
});