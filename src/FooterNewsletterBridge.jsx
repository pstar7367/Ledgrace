import { useEffect } from "react";
import { subscribeNewsletterRequest } from "./authApi.js";
import { getStoredLanguage, translate } from "./translation.js";

export default function FooterNewsletterBridge() {
  useEffect(() => {
    const decorateForms = () => {
      document.querySelectorAll("footer .footer-grid form").forEach((form) => {
        const input = form.querySelector("input");
        const button = form.querySelector("button");
        if (!input || !button) return;
        const t = (key) => translate(key, getStoredLanguage());
        input.placeholder = t("footer_newsletter_placeholder");
        button.textContent = t("subscribe_btn");
        if (form.dataset.newsletterReady === "true") return;
        form.dataset.newsletterReady = "true";
        input.type = "email";
        input.required = true;
        input.autocomplete = "email";
        button.type = "submit";
        const status = document.createElement("small");
        status.className = "footer-newsletter-status";
        status.setAttribute("aria-live", "polite");
        form.insertAdjacentElement("afterend", status);
      });
    };

    const submit = async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.dataset.newsletterReady !== "true")
        return;
      event.preventDefault();
      const input = form.querySelector("input");
      const button = form.querySelector("button");
      const status = form.nextElementSibling;
      if (!input?.reportValidity()) return;
      button.disabled = true;
      const t = (key) => translate(key, getStoredLanguage());
      status.textContent = t("newsletter_subscribing");
      status.classList.remove("error");
      try {
        await subscribeNewsletterRequest(input.value);
        status.textContent = t("newsletter_success");
        form.reset();
      } catch (error) {
        status.textContent =
          error.response?.status === 400
            ? t("newsletter_invalid_email")
            : t("newsletter_failure");
        status.classList.add("error");
      } finally {
        button.disabled = false;
      }
    };

    decorateForms();
    const observer = new MutationObserver(decorateForms);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("ledgrace:preferences-changed", decorateForms);
    document.addEventListener("submit", submit);
    return () => {
      observer.disconnect();
      window.removeEventListener("ledgrace:preferences-changed", decorateForms);
      document.removeEventListener("submit", submit);
    };
  }, []);

  return null;
}
