document.addEventListener("DOMContentLoaded", () => {
  // Handle home button and nav link clicks
  const homeElements = document.querySelectorAll(
    '.btn-home, .nav-link[href="/"]'
  );
  homeElements.forEach((element) => {
    element.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🔹 Home button/link clicked");
      // Clear sessionStorage to reset scroll and filter state
      sessionStorage.removeItem("scrollPosition");
      sessionStorage.removeItem("mainPageUrl");
      // Redirect to clean homepage
      window.location.href = "/";
    });
  });

  // Ensure scroll to top on homepage load
  if (window.location.pathname === "/") {
    window.scrollTo(0, 0);
  }
});
