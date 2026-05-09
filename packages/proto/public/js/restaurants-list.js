import { html, css, shadow } from "@unbndl/html";

export class RestaurantsListElement extends HTMLElement {
  constructor() {
    super();
    shadow(this).styles(RestaurantsListElement.styles);
  }

  static observedAttributes = ["src"];

  attributeChangedCallback(name, _, newValue) {
    if (name === "src") {
      this.hydrate(newValue).then((data) => {
        const view = RestaurantsListElement.render(data || []);
        shadow(this).replace(view);
      });
    }
  }

  hydrate(src) {
    return fetch(src)
      .then((response) => {
        if (response.status !== 200) throw `HTTP Status ${response.status}`;
        return response.json();
      })
      .catch((err) => {
        console.error(`Could not fetch ${src}:`, err);
        return [];
      });
  }

  static render(list) {
    return html`
      <div class="restaurants">
        ${list.map((r) => html`
          <ff-restaurant
            icon=${r.icon}
            location=${r.location}
            cuisine=${r.cuisine}
            back-href=${r.href}
          >
            ${r.name}
          </ff-restaurant>
        `)}
      </div>
    `;
  }

  static styles = css`
    :host { display: block; }
    .restaurants { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  `;
}
