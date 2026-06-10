// @ts-nocheck
import { css, html, shadow } from "@unbndl/html";
import { createViewModel } from "@unbndl/view";
import { fromAuth } from "@unbndl/auth";
import { Store, fromStore } from "@unbndl/store";
import { restaurantSlug } from "../restaurant-id.ts";

export class HomeViewElement extends HTMLElement {
  viewModel = createViewModel({
    authenticated: false,
    restaurants: []
  })
    .with(fromAuth(this), "authenticated")
    .with(fromStore(this), "restaurants");

  view = html`
    <section class="hero card">
      <div>
        <p class="eyebrow">ForkFinder SPA</p>
        <h1>Restaurant Directory</h1>
        <p>
          Browse our saved restaurant collection without reloading the page.
          Pick a card to move into a routed detail view.
        </p>
      </div>
      <div class="hero-actions">
        <a class="detail-link" href="/app/restaurants/new">Add restaurant</a>
      </div>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <h2>Saved restaurants</h2>
        <p>These cards are loaded from Mongo through the protected API.</p>
      </div>

      ${($) =>
        !$.authenticated
          ? html`
              <div class="empty-state">
                <p><strong>Sign in required:</strong> log in to load the restaurant directory.</p>
                <a class="secondary-link" href="/login.html">Go to login</a>
              </div>
            `
          : ($.restaurants || []).length === 0
            ? html`
                <div class="empty-state">
                  <p>No restaurants were returned from the API.</p>
                </div>
              `
            : html`
                <div class="restaurants">
                  ${($.restaurants || []).map(
                    (restaurant) => html`
                      <article class="restaurant-card">
                        <h3>
                          <svg class="icon" aria-hidden="true">
                            <use href=${`/icons/restaurant.svg#${restaurant.icon || "icon-burger"}`}></use>
                          </svg>
                          ${restaurant.name}
                        </h3>
                        <p><strong>Location:</strong> ${restaurant.location}</p>
                        <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
                        <p><strong>Price:</strong> ${restaurant.price || "N/A"}</p>
                        <p><strong>Rating:</strong> ${restaurant.rating || "N/A"}</p>
                        <a class="detail-link" href=${`/app/restaurants/${restaurantSlug(restaurant)}`}>
                          Open details
                        </a>
                      </article>
                    `
                  )}
                </div>
              `}
    </section>
  `;

  constructor() {
    super();

    shadow(this)
      .styles(HomeViewElement.styles)
      .replace(this.viewModel.render(this.view));

    this.viewModel.createEffect(($) => {
      if (!$.authenticated) return;
      Store.dispatch(this, ["restaurants/request"]);
    });
  }

  static styles = css`
    :host {
      display: grid;
      gap: 1.5rem;
    }

    .card,
    .panel,
    .restaurant-card {
      background: var(--color-background-surface);
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      box-shadow: 0 10px 22px rgba(31, 41, 51, 0.08);
    }

    .hero {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.5rem;
    }

    .eyebrow {
      margin: 0 0 0.5rem;
      color: var(--color-accent);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      font-family: "Bitter", Georgia, serif;
      font-size: 2.25rem;
      color: var(--color-background-header);
    }

    .secondary-link,
    .detail-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 0.75rem 1rem;
      text-decoration: none;
      font-weight: 700;
    }

    .secondary-link {
      border: 1px solid var(--color-border);
      color: var(--color-text);
    }

    .detail-link {
      background: var(--color-background-header);
      color: var(--color-text-inverted);
    }

    .panel {
      padding: 1.5rem;
      display: grid;
      gap: 1rem;
    }

    .hero-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .empty-state {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      background: var(--color-sequence-item);
    }

    .panel-heading {
      display: grid;
      gap: 0.35rem;
    }

    h2 {
      color: var(--color-background-header);
      font-family: "Bitter", Georgia, serif;
      font-size: 1.2rem;
    }

    .restaurants {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .restaurant-card {
      display: grid;
      gap: 0.75rem;
      padding: 1.25rem;
    }

    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-background-header);
      font-size: 1.15rem;
      font-family: "Bitter", Georgia, serif;
    }

    strong {
      color: var(--color-accent);
    }

    .icon {
      width: 1.1rem;
      height: 1.1rem;
      fill: currentColor;
      flex: 0 0 auto;
    }

    @media (max-width: 720px) {
      .hero {
        align-items: start;
        flex-direction: column;
      }
    }
  `;
}
