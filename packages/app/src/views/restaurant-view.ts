// @ts-nocheck
import { css, html, shadow } from "@unbndl/html";
import { createViewModel, fromAttributes } from "@unbndl/view";
import { fromAuth } from "@unbndl/auth";
import { Store, fromStore } from "@unbndl/store";
import { BrowserHistory } from "@unbndl/switch";

type RestaurantViewAttributes = { "restaurant-id"?: string };
type RestaurantMode = "view" | "edit";
type RestaurantElementAttributes = {
  "restaurant-id"?: string;
  mode?: RestaurantMode | "new";
};

interface RestaurantViewModel {
  authenticated: boolean;
  restaurantId?: string;
  selectedRestaurantId?: string;
  restaurant?: object;
  mode: RestaurantMode;
}

function displayAuthor(author) {
  return author === "Priya" ? "Alice" : author;
}

function cleanHours(hours) {
  return (hours || [])
    .map((hour) => String(hour).replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

export class RestaurantViewElement extends HTMLElement {
  viewModel = createViewModel<RestaurantViewModel>({
    authenticated: false,
    mode: "view"
  })
    .withRenamed(fromAttributes<RestaurantElementAttributes>(this), {
      restaurantId: "restaurant-id"
    })
    .with(fromAttributes<RestaurantElementAttributes>(this), "mode")
    .with(fromAuth(this), "authenticated")
    .with(fromStore(this), "restaurant", "selectedRestaurantId");

  view = html`
    ${($) =>
      $.mode === "new"
        ? html`
            <article class="detail-shell">
              <a class="back-link" href="/app">Back to directory</a>
              ${this.editView(this.emptyRestaurant())}
            </article>
          `
        : $.restaurant && $.selectedRestaurantId === $.restaurantId
        ? html`
            <article class="detail-shell">
              <a class="back-link" href="/app">Back to directory</a>
              ${$.mode === "edit"
                ? this.editView($.restaurant)
                : this.mainView($.restaurant)}
            </article>
          `
        : html`
            <article class="card empty-state">
              <h1>Restaurant not found</h1>
              <p>We could not load that restaurant from the API.</p>
              <a class="back-link" href="/app">Return home</a>
            </article>
          `}
  `;

  constructor() {
    super();

    shadow(this)
      .styles(RestaurantViewElement.styles)
      .replace(this.viewModel.render(this.view))
      .listen({
        click: (event: Event) => this.handleClick(event),
        submit: (event: Event) => this.submitForm(event)
      });

    this.viewModel.createEffect(($) => {
      if ($.mode === "new") return;
      if (!$.authenticated || !$.restaurantId) return;
      Store.dispatch(this, ["restaurant/request", { restaurantId: $.restaurantId }]);
    });
  }

  mainView(restaurant) {
    return html`
      <section class="hero">
        <div>
          <p class="eyebrow">Restaurant detail</p>
          <h1>
            <svg class="icon" aria-hidden="true">
              <use href=${`/icons/restaurant.svg#${restaurant.icon || "icon-burger"}`}></use>
            </svg>
            ${restaurant.name}
          </h1>
          <p class="summary">${restaurant.cuisine} in ${restaurant.location}</p>
        </div>
        <button class="primary-action" type="button" data-action="edit">
          Edit restaurant
        </button>
        <button class="danger-action" type="button" data-action="delete">
          Delete restaurant
        </button>
      </section>

      <section class="facts">
        <article class="card">
          <h2>Quick facts</h2>
          <p><strong>Location:</strong> ${restaurant.location}</p>
          <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
                  <p><strong>Price:</strong> ${restaurant.price || "N/A"}</p>
                  <p><strong>Rating:</strong> ${restaurant.rating || "N/A"}</p>
                </article>

                <article class="card">
                  <h2>Hours</h2>
                  <ul>
          ${cleanHours(restaurant.hours).map((hour) => html`<li>${hour}</li>`)}
                  </ul>
                </article>
              </section>

      <section class="card reviews">
        <h2>Recent reviews</h2>
        <div class="review-list">
          ${(restaurant.reviews || []).map(
            (review) => html`
              <article class="review">
                <p class="review-heading">
                  <strong>${displayAuthor(review.author)}</strong>
                  <span>${review.rating}/5</span>
                </p>
                <p>${review.comment}</p>
                <p class="review-date">${review.createdAt}</p>
              </article>
            `
          )}
        </div>
      </section>
    `;
  }

  editView(restaurant) {
    return html`
      <section class="hero">
        <div>
          <p class="eyebrow">Edit restaurant</p>
          <h1>${restaurant.name}</h1>
          <p class="summary">Update the restaurant and save through the MVU store.</p>
        </div>
      </section>

      <form class="card edit-form">
        <label>
          <span>Name</span>
          <input name="name" value=${restaurant.name || ""} />
        </label>
        <label>
          <span>Location</span>
          <input name="location" value=${restaurant.location || ""} />
        </label>
        <label>
          <span>Cuisine</span>
          <input name="cuisine" value=${restaurant.cuisine || ""} />
        </label>
        <label>
          <span>Price</span>
          <input name="price" value=${restaurant.price || ""} />
        </label>
        <label>
          <span>Rating</span>
          <input name="rating" type="number" min="0" max="5" step="1" value=${restaurant.rating || 0} />
        </label>
        <label>
          <span>Hours</span>
          <input name="hours" value=${cleanHours(restaurant.hours).join(", ")} />
        </label>
        <input type="hidden" name="icon" value=${restaurant.icon || "icon-burger"} />
        <input type="hidden" name="href" value=${restaurant.href || ""} />
        <div class="form-actions">
          <button class="primary-action" type="submit">Save changes</button>
          <button class="secondary-action" type="button" data-action="cancel-edit">
            Cancel
          </button>
        </div>
      </form>
    `;
  }

  handleClick(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.getAttribute("data-action");
    if (action === "edit") {
      this.viewModel.set("mode", "edit");
    }
    if (action === "cancel-edit") {
      this.viewModel.set("mode", "view");
    }
    if (action === "delete") {
      const restaurantId = this.viewModel.toObject().restaurantId;
      if (!restaurantId) return;
      Store.dispatch(this, [
        "restaurant/delete",
        { restaurantId },
        {
          onFailure: (error: Error) => console.log("ERROR:", error),
          onSuccess: () =>
            BrowserHistory.dispatch(this, "history/navigate", {
              href: "/app"
            })
        }
      ]);
    }
  }

  submitForm(event: Event) {
    event.preventDefault();

    const form = event.target;
    const restaurantId = this.viewModel.toObject().restaurantId;
    const currentRestaurant = this.viewModel.toObject().restaurant;
    const mode = this.viewModel.toObject().mode;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    if (mode === "new") {
      const json = this.formDataToJSON(form, this.emptyRestaurant());
      Store.dispatch(this, [
        "restaurant/create",
        { restaurant: json },
        {
          onFailure: (error: Error) => console.log("ERROR:", error)
        }
      ]);
      BrowserHistory.dispatch(this, "history/navigate", {
        href: "/app"
      });
    } else {
      if (!restaurantId || !currentRestaurant) return;
      const json = this.formDataToJSON(form, currentRestaurant);

      Store.dispatch(this, [
        "restaurant/save",
        { restaurantId, restaurant: json },
        {
          onFailure: (error: Error) => console.log("ERROR:", error)
        }
      ]);

      this.viewModel.set("mode", "view");
      BrowserHistory.dispatch(this, "history/navigate", {
        href: `/app/restaurants/${restaurantId}`
      });
    }
  }

  formDataToJSON(form: HTMLFormElement, currentRestaurant) {
    const formData = new FormData(form);

    return {
      ...currentRestaurant,
      name: String(formData.get("name") || ""),
      location: String(formData.get("location") || ""),
      cuisine: String(formData.get("cuisine") || ""),
      price: String(formData.get("price") || ""),
      rating: Number(formData.get("rating") || 0),
      hours: String(formData.get("hours") || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      icon: String(formData.get("icon") || currentRestaurant.icon || "icon-burger"),
      href: String(formData.get("href") || currentRestaurant.href || ""),
      reviews: currentRestaurant.reviews || []
    };
  }

  emptyRestaurant() {
    return {
      id: "",
      name: "",
      icon: "icon-burger",
      location: "",
      cuisine: "",
      href: "",
      price: "",
      rating: 0,
      hours: [],
      reviews: []
    };
  }

  static styles = css`
    :host {
      display: block;
    }

    .detail-shell {
      display: grid;
      gap: 1.25rem;
    }

    .hero,
    .card,
    .empty-state {
      background: var(--color-background-surface);
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      box-shadow: 0 10px 22px rgba(31, 41, 51, 0.08);
    }

    .hero,
    .card,
    .empty-state {
      padding: 1.5rem;
    }

    .facts {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }

    h1,
    h2,
    p,
    ul {
      margin: 0;
    }

    h1,
    h2 {
      color: var(--color-background-header);
      font-family: "Bitter", Georgia, serif;
    }

    h1 {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 2rem;
    }

    h2 {
      margin-bottom: 0.75rem;
      font-size: 1.15rem;
    }

    .eyebrow {
      margin-bottom: 0.5rem;
      color: var(--color-accent);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    .summary {
      margin-top: 0.75rem;
      font-size: 1.05rem;
    }

    .hero {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 1rem;
    }

    .back-link {
      justify-self: start;
      display: inline-flex;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      padding: 0.75rem 1rem;
      color: var(--color-text);
      text-decoration: none;
      font-weight: 700;
      background: var(--color-background-surface);
    }

    .primary-action,
    .danger-action,
    .secondary-action {
      border-radius: 999px;
      padding: 0.75rem 1rem;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .primary-action {
      border: 0;
      background: var(--color-background-header);
      color: var(--color-text-inverted);
    }

    .danger-action {
      border: 0;
      background: #b83a3a;
      color: #fff;
    }

    .secondary-action {
      border: 1px solid var(--color-border);
      background: transparent;
      color: var(--color-text);
    }

    .icon {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
      flex: 0 0 auto;
    }

    strong {
      color: var(--color-accent);
    }

    ul {
      padding-left: 1.2rem;
      display: grid;
      gap: 0.5rem;
    }

    .reviews {
      display: grid;
      gap: 1rem;
    }

    .edit-form {
      display: grid;
      gap: 1rem;
    }

    .edit-form label {
      display: grid;
      gap: 0.45rem;
      font-weight: 700;
    }

    .edit-form input,
    .edit-form textarea {
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      padding: 0.8rem 0.95rem;
      font: inherit;
      color: var(--color-text);
      background: var(--color-background-surface);
    }

    .edit-form textarea {
      min-height: 6rem;
      resize: vertical;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .review-list {
      display: grid;
      gap: 0.85rem;
    }

    .review {
      display: grid;
      gap: 0.35rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background: var(--color-sequence-item);
    }

    .review-heading {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .review-date {
      font-size: 0.9rem;
      opacity: 0.75;
    }

    @media (max-width: 720px) {
      .hero {
        align-items: start;
        flex-direction: column;
      }
    }
  `;
}
