import { html, css, shadow } from "@unbndl/html";
import reset from "./styles/reset.css.js";

export class RestaurantElement extends HTMLElement {
  static template = html`
    <template>
      <section class="card span-4">
        <h1>
          <svg class="icon" aria-hidden="true">
            <use class="icon-use" href="/icons/restaurant.svg#icon-burger"></use>
          </svg>
          <slot></slot>
        </h1>
        <p>
          <svg class="icon" aria-hidden="true">
            <use href="/icons/restaurant.svg#icon-location" />
          </svg>
          <strong>Location:</strong>
          <span class="location"></span>
        </p>
        <p><strong>Cuisine:</strong> <span class="cuisine"></span></p>
        <p><strong>Back:</strong> <a class="back" href="">Restaurants</a></p>
      </section>
    </template>
  `;

  constructor() {
    super();
    shadow(this)
      .template(RestaurantElement.template)
      .styles(reset.styles, RestaurantElement.styles);
  }

  static observedAttributes = ["icon", "location", "cuisine", "back-href"];

  connectedCallback() {
    // apply initial attributes
    for (const name of RestaurantElement.observedAttributes) {
      const val = this.getAttribute(name);
      if (val !== null) {
        this.attributeChangedCallback(name, null, val);
      }
    }
  }

  attributeChangedCallback(name, _, newValue) {
    const root = this.shadowRoot;
    if (!root) return;
    switch (name) {
      case "icon": {
        const useEl = root.querySelector('.icon-use');
        if (useEl) useEl.setAttribute('href', `/icons/restaurant.svg#${newValue}`);
        break;
      }
      case "location": {
        const el = root.querySelector('.location');
        if (el) el.textContent = newValue;
        break;
      }
      case "cuisine": {
        const el = root.querySelector('.cuisine');
        if (el) el.textContent = newValue;
        break;
      }
      case "back-href": {
        const a = root.querySelector('.back');
        if (a) a.setAttribute('href', newValue);
        break;
      }
    }
  }

  static styles = css`
    :host {
      display: block;
    }
    .card {
      background: var(--surface, #fff);
      padding: 1rem;
      border-radius: 6px;
      box-shadow: 0 1px 0 rgba(0,0,0,0.04);
    }
    h1 {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .icon { width: 1.25rem; height: 1.25rem; }
    .location, .cuisine { margin-left: 0.25rem; }
  `;
}
