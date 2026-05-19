import { html, css, shadow } from "@unbndl/html";
import { createViewModel, fromAttributes } from "@unbndl/view";
import { fromAuth } from "@unbndl/auth";

export class RestaurantsListElement extends HTMLElement {
  viewModel = createViewModel({
    src: "",
    authenticated: false,
    token: undefined,
    restaurants: []
  })
    .with(fromAttributes(this), "src")
    .with(fromAuth(this), "authenticated", "token");

  view = html`
    ${($) =>
      $.authenticated
        ? html`
            <div class="restaurants">
              ${($.restaurants || []).map(
                (r) => html`
                  <ff-restaurant
                    icon=${r.icon}
                    location=${r.location}
                    cuisine=${r.cuisine}
                    back-href=${r.href}
                  >
                    ${r.name}
                  </ff-restaurant>
                `
              )}
            </div>
          `
        : html`
            <div class="auth-note">
              <p><strong>Sign in required:</strong> log in to view the live restaurant directory.</p>
              <a href="/login.html">Go to Login</a>
            </div>
          `}
  `;

  constructor() {
    super();
    shadow(this)
      .styles(RestaurantsListElement.styles)
      .replace(this.viewModel.render(this.view));

    this.viewModel.createEffect(($) => {
      if ($.authenticated && $.src) {
        this.hydrate($.src).then((data) => {
          this.viewModel.set("restaurants", data || []);
        });
      }
    });
  }

  get authorization() {
    const $ = this.viewModel.toObject();
    if ($.authenticated && $.token) {
      return { Authorization: `Bearer ${$.token}` };
    }

    return {};
  }

  hydrate(src) {
    return fetch(src, { headers: this.authorization })
      .then((response) => {
        if (response.status !== 200) throw `HTTP Status ${response.status}`;
        return response.json();
      })
      .catch((err) => {
        console.error(`Could not fetch ${src}:`, err);
        return [];
      });
  }

  static styles = css`
    :host { display: block; }
    .restaurants { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .auth-note {
      display: grid;
      gap: 0.75rem;
      padding: 1.25rem;
      border: 1px solid var(--color-border, #d8d2c6);
      border-radius: 0.5rem;
      background: var(--color-background-surface, #fff);
    }
    .auth-note a {
      justify-self: start;
      font-weight: 700;
    }
  `;
}
