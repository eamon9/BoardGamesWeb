document.addEventListener("DOMContentLoaded", () => {
  // Save scroll position when leaving the main page
  if (window.location.pathname === "/") {
    window.addEventListener("scroll", () => {
      sessionStorage.setItem("scrollPosition", window.scrollY);
    });
  }

  // Handle back button click
  document.querySelectorAll(".btn-back").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default anchor behavior
      window.location.href = "/"; // Redirect to main page
    });
  });

  // Restore scroll position on main page load
  if (window.location.pathname === "/") {
    const scrollPosition = sessionStorage.getItem("scrollPosition");
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition, 10));
    }
  }
});
