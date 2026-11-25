const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

function updateCountdown() {
  const daysElement = document.querySelector("#countdown-days");
  const labelElement = document.querySelector("#countdown-label");
  if (!daysElement || !labelElement) return;

  const weddingDay = new Date(2027, 8, 18);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.ceil((weddingDay.getTime() - today.getTime()) / 86_400_000);

  if (daysRemaining < 0) {
    daysElement.textContent = "✿";
    labelElement.textContent = "we celebrated!";
  } else if (daysRemaining === 0) {
    daysElement.textContent = "✿";
    labelElement.textContent = "today is the day!";
  } else {
    daysElement.textContent = daysRemaining.toLocaleString();
    labelElement.textContent = daysRemaining === 1 ? "day until we celebrate" : "days until we celebrate";
  }
}

updateCountdown();
window.setInterval(updateCountdown, 60_000);

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }
});
