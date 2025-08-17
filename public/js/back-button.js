document.addEventListener("DOMContentLoaded", () => {
  // Save scroll position and URL with query parameters on main page
  if (window.location.pathname === "/") {
    window.addEventListener("scroll", () => {
      sessionStorage.setItem("scrollPosition", window.scrollY);
    });
    // Save current URL (including query params like ?search=chess)
    sessionStorage.setItem("mainPageUrl", window.location.href);
  }

  // Handle back button click
  document.querySelectorAll(".btn-back").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default anchor behavior
      // Redirect to saved main page URL or fallback to '/'
      const savedUrl = sessionStorage.getItem("mainPageUrl") || "/";
      window.location.href = savedUrl;
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
