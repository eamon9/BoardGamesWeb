document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('form[action*="/ratings/"]').forEach((form) => {
    form.addEventListener("submit", (e) => {
      const score = form.querySelector('input[name="score"]').value;
      if (score < 1 || score > 5) {
        e.preventDefault();
        alert("Vērtējumam jābūt no 1 līdz 5");
      }
    });
  });
});
