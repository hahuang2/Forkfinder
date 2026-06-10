// @ts-nocheck
import { define, html } from "@unbndl/html";
import { Auth } from "@unbndl/auth";
import { Store } from "@unbndl/store";
import { BrowserHistory, Switch } from "@unbndl/switch";
import { HeaderElement } from "./components/blz-header.ts";
import { Msg } from "./messages.ts";
import { Model, init } from "./model.ts";
import { update, Cmd } from "./update.ts";
import { HomeViewElement } from "./views/home-view.ts";
import { RestaurantViewElement } from "./views/restaurant-view.ts";

const routes = [
  {
    path: "/app/restaurants/new",
    view: html`
      <restaurant-view restaurant-id="new" mode="new"></restaurant-view>
    `
  },
  {
    path: "/app/restaurants/:id",
    view: html`
      <restaurant-view restaurant-id=${($) => $.params.id}></restaurant-view>
    `
  },
  {
    path: "/app",
    view: html`<home-view></home-view>`
  },
  {
    path: "/",
    redirect: "/app"
  }
];

define({
  "auth-provider": Auth.Provider,
  "history-provider": BrowserHistory.Provider,
  "store-provider": class AppStore extends Store.Provider<Model, Msg, Cmd> {
    constructor() {
      super(update, init);
    }
  },
  "ff-header": HeaderElement,
  "home-view": HomeViewElement,
  "restaurant-view": RestaurantViewElement,
  "router-switch": class AppSwitch extends Switch.Element {
    constructor() {
      super(routes);
    }
  }
});
