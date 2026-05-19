import { css, html, shadow } from "@unbndl/html";
import reset from "./styles/reset.css.js";

export class LoginFormElement extends HTMLElement {
  static view = html`
    <form action="javascript:void(0)" novalidate>
      <slot></slot>
      <p class="success" data-role="success"></p>
      <p class="error" data-role="error"></p>
      <button type="button" data-role="submit">
        <slot name="submit-label">Login</slot>
      </button>
    </form>
  `;

  constructor() {
    super();
    shadow(this)
      .styles(reset.styles, LoginFormElement.styles)
      .replace(LoginFormElement.view);

    const root = this.shadowRoot;
    const form = root?.querySelector("form");
    const button = root?.querySelector('[data-role="submit"]');

    form?.addEventListener("submit", (event) =>
      this.submitForm(event, this.getAttribute("api") || "#")
    );

    button?.addEventListener("click", (event) =>
      this.submitForm(event, this.getAttribute("api") || "#")
    );

    form?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.submitForm(event, this.getAttribute("api") || "#");
      }
    });
  }

  setMessage(kind, text) {
    const root = this.shadowRoot;
    if (!root) return;

    const success = root.querySelector('[data-role="success"]');
    const error = root.querySelector('[data-role="error"]');

    if (success) success.textContent = kind === "success" ? text : "";
    if (error) error.textContent = kind === "error" ? text : "";
  }

  setLoading(isLoading) {
    const root = this.shadowRoot;
    if (!root) return;

    const button = root.querySelector('[data-role="submit"]');
    if (!(button instanceof HTMLButtonElement)) return;

    button.disabled = isLoading;
    button.textContent = isLoading
      ? "Working..."
      : this.getAttribute("submit-text") || "Login";
  }

  submitForm(event, endpoint) {
    event.preventDefault();
    this.setMessage("success", "");
    this.setMessage("error", "");

    const usernameInput = this.querySelector('input[name="username"]');
    const passwordInput = this.querySelector('input[name="password"]');
    const username =
      usernameInput instanceof HTMLInputElement ? usernameInput.value.trim() : "";
    const password =
      passwordInput instanceof HTMLInputElement ? passwordInput.value : "";

    if (!username || !password) {
      this.setMessage("error", "Please enter both username and password.");
      return;
    }

    this.setLoading(true);

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          return res.text().then((message) => {
            throw new Error(this.messageForStatus(res.status, message, endpoint));
          });
        }

        return res.json();
      })
      .then((json) => {
        const { token } = json;
        const isRegister = endpoint.includes("/register");

        localStorage.setItem("un-auth:token", token);
        this.setMessage(
          "success",
          isRegister
            ? "Account created successfully. Redirecting now..."
            : "Login successful. Redirecting now..."
        );

        this.dispatchEvent(
          new CustomEvent("auth:message", {
            bubbles: true,
            composed: true,
            detail: [
              "auth/signin",
              { token, redirect: this.getAttribute("redirect") || "/" }
            ]
          })
        );

        window.setTimeout(() => {
          window.location.assign(this.getAttribute("redirect") || "/");
        }, 700);
      })
      .catch((error) => {
        this.setMessage(
          "error",
          error.message || "Something went wrong. Please try again."
        );
      })
      .finally(() => {
        this.setLoading(false);
      });
  }

  messageForStatus(status, message, endpoint) {
    const isRegister = endpoint.includes("/register");
    const text = typeof message === "string" ? message : "";

    if (isRegister && status === 409) {
      return "That username is already taken. Try a different one.";
    }

    if (!isRegister && status === 401) {
      return "Incorrect username or password.";
    }

    if (status === 400) {
      return "Please fill out both fields correctly.";
    }

    if (text.includes("Username exists")) {
      return "That username is already taken. Try a different one.";
    }

    return text || `Request failed with status ${status}.`;
  }

  static styles = css`
    :host {
      display: block;
    }

    form {
      display: grid;
      gap: 1rem;
    }

    button {
      border: 0;
      border-radius: 999px;
      padding: 0.85rem 1.2rem;
      background: var(--color-accent, #c94f4f);
      color: white;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.7;
      cursor: wait;
    }

    .success,
    .error {
      min-height: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .success {
      color: #2c7a4b;
    }

    .error {
      color: var(--color-accent, #c94f4f);
    }
  `;
}
