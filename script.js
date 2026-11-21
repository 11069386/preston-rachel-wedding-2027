const weddingDate = new Date(2027, 8, 18);

function updateCountdown() {
  if (!document.querySelector("#countdown-days")) return;
  const remaining = weddingDate.getTime() - Date.now();
  const caption = document.querySelector("#countdown-caption");

  if (remaining <= 0) {
    document.querySelector("#countdown-days").textContent = "0";
    document.querySelector("#countdown-hours").textContent = "0";
    document.querySelector("#countdown-minutes").textContent = "0";
    document.querySelector("#countdown-seconds").textContent = "0";
    caption.textContent = "today is the day!";
    return;
  }

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  document.querySelector("#countdown-days").textContent = days.toLocaleString();
  document.querySelector("#countdown-hours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#countdown-minutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#countdown-seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }
});

function prepareMessage(form) {
  const fields = [...new FormData(form).entries()]
    .filter(([, value]) => String(value).trim() !== "")
    .map(([name, value]) => {
      const control = form.elements.namedItem(name);
      const label = control?.labels?.[0]?.textContent.trim()
        || name.replace(/([A-Z])/g, " $1");
      const displayValue = control instanceof HTMLSelectElement
        ? control.selectedOptions[0].textContent
        : value;
      return `${label}: ${displayValue}`;
    });
  const title = form.classList.contains("rsvp-form")
    ? "Preston & Rachel — Reception RSVP"
    : form.closest(".playlist")
      ? "Preston & Rachel — Song Request"
      : "Preston & Rachel — Guestbook Note";
  return [title, ...fields].join("\n");
}

document.querySelectorAll(".preview-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const notice = form.querySelector(".form-notice");
    const message = prepareMessage(form);
    notice.replaceChildren();

    const instructions = document.createElement("span");
    instructions.textContent = "Message prepared — nothing has been sent or saved.";
    const preview = document.createElement("span");
    preview.className = "prepared-message";
    preview.textContent = message;
    const copyButton = document.createElement("button");
    copyButton.className = "copy-button";
    copyButton.type = "button";
    copyButton.textContent = "Copy message";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(message);
        copyButton.textContent = "Copied";
      } catch {
        copyButton.textContent = "Copy unavailable — select the message";
      }
    });

    notice.append(instructions, preview, copyButton);
  });
});
