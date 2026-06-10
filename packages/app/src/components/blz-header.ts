// @ts-nocheck
import { css, html, shadow } from "@unbndl/html";
import { createViewModel } from "@unbndl/view";
import { fromAuth } from "@unbndl/auth";

export class HeaderElement extends HTMLElement {
  viewModel = createViewModel({
    authenticated: false,
    username: ""
  }).with(fromAuth(this), "authenticated", "username");

  view = html`
    <header class="site-header">
      <div class="brand">
        <a class="appname" href="/app">
          <svg class="icon" aria-hidden="true">
            <use href="/icons/restaurant.svg#icon-utensils"></use>
          </svg>
          <strong>ForkFinder</strong>
        </a>
        <p class="subtitle">Single-page restaurant guide</p>
      </div>

      <nav class="nav" aria-label="Primary">
        <a href="/app">Home</a>
        <a href="/app/restaurants/1">McDonald's</a>
        <a href="/app/restaurants/2">Taco Bell</a>
      </nav>

      <div class="controls">
        <label class="theme-toggle">
          <input class="theme-input" type="checkbox" autocomplete="off" />
          Dark mode
        </label>

        <div class=${($) => ($.authenticated ? "account logged-in" : "account logged-out")}>
          <span class="greeting">Hello, ${($) => $.username || "traveler"}</span>
          <a class="when-signed-out" href="/login.html">Sign In</a>
          <button class="when-signed-in signout-button" type="button">Sign Out</button>
        </div>
      </div>
    </header>
  `;

  constructor() {
    super();

    shadow(this)
      .styles(HeaderElement.styles)
      .replace(this.viewModel.render(this.view));

    const root = this.shadowRoot;
    const signoutButton = root?.querySelector(".signout-button");

    signoutButton?.addEventListener("click", () => this.signout());
    root?.addEventListener("change", (event) => this.toggleDarkMode(event));
  }

  toggleDarkMode(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.classList.contains("theme-input")) return;
    document.body.classList.toggle("dark-mode", target.checked);
  }

  signout() {
    localStorage.removeItem("un-auth:token");

    this.dispatchEvent(
      new CustomEvent("auth:message", {
        bubbles: true,
        composed: true,
        detail: ["auth/signout"]
      })
    );

    window.location.assign("/login.html");
  }

  static styles = css`
    :host {
      display: block;
      margin: 0 0 1.5rem;
    }

    .site-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 1.25rem 1.5rem;
      border-radius: 0.5rem;
      background: var(--color-background-header, #243447);
      color: var(--color-text-inverted, #fff);
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
    }

    .brand,
    .controls,
    .account,
    .nav,
    .appname,
    .theme-toggle {
      display: flex;
      align-items: center;
    }

    .brand {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .appname {
      gap: 0.5rem;
      color: inherit;
      text-decoration: none;
      font-family: "Bitter", Georgia, serif;
      letter-spacing: 0.03em;
    }

    .subtitle {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.88;
    }

    .nav {
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .nav a,
    .account a,
    .account button {
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 0.5rem 0.85rem;
      color: inherit;
      background: transparent;
      font: inherit;
      text-decoration: none;
      cursor: pointer;
    }

    .nav a:hover,
    .account a:hover,
    .account button:hover {
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.14);
    }

    .controls {
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .account {
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--color-background-chip, #344e68);
      border-radius: 999px;
    }

    .greeting {
      font-weight: 700;
      white-space: nowrap;
    }

    .when-signed-in,
    .when-signed-out {
      display: none;
    }

    .logged-in .when-signed-in,
    .logged-out .when-signed-out {
      display: inline-flex;
      align-items: center;
    }

    .theme-toggle {
      gap: 0.5rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .theme-input {
      inline-size: 1.05rem;
      block-size: 1.05rem;
      accent-color: var(--color-accent, #c94f4f);
    }

    .icon {
      width: 1.2em;
      height: 1.2em;
      fill: currentColor;
      flex: 0 0 auto;
    }

    @media (max-width: 900px) {
      .site-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .controls {
        justify-content: flex-start;
      }
    }
  `;
}
