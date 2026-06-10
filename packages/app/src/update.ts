// @ts-nocheck
import { Auth } from "@unbndl/auth";
import type { ThenUpdate } from "@unbndl/store";
import type { Restaurant } from "server/models";
import type { Msg } from "./messages.ts";
import type { Model } from "./model.ts";
import {
  fallbackRestaurantById,
  fallbackRestaurants
} from "./fallback-restaurants.ts";
import { restaurantSlug } from "./restaurant-id.ts";

export type Cmd =
  | ["restaurants/load", { restaurants: Restaurant[] }]
  | ["restaurant/load", { restaurantId: string; restaurant?: Restaurant }];

export function update(
  model: Readonly<Model>,
  message: Msg | Cmd,
  user: Auth.Model
): Model | ThenUpdate<Model, Cmd> {
  const [type, payload] = message;
  const reactions = message[2];

  switch (type) {
    case "restaurants/request":
      if (model.restaurants && model.restaurants.length > 0) {
        return model as Model;
      }
      return [
        { ...model, restaurants: model.restaurants || [] },
        requestRestaurants(user)
      ];

    case "restaurants/load":
      return {
        ...model,
        restaurants:
          payload.restaurants && payload.restaurants.length > 0
            ? payload.restaurants
            : fallbackRestaurants
      };

    case "restaurant/request":
      if (
        model.selectedRestaurantId === payload.restaurantId &&
        model.restaurant
      ) {
        return model as Model;
      }

      return [
        {
          ...model,
          selectedRestaurantId: payload.restaurantId,
          restaurant:
            model.restaurants?.find(
              (restaurant) =>
                restaurantSlug(restaurant) === payload.restaurantId
            ) || model.restaurant
        },
        requestRestaurant(payload, user)
      ];

    case "restaurant/load":
      const nextRestaurant =
        payload.restaurant ||
        fallbackRestaurantById(payload.restaurantId);

      return {
        ...model,
        selectedRestaurantId: payload.restaurantId,
        restaurant: nextRestaurant,
        restaurants: upsertRestaurant(
          model.restaurants || fallbackRestaurants,
          nextRestaurant
        )
      };

    case "restaurant/create":
      return [
        model as Model,
        createRestaurant(payload, user)
          .then((command) => {
            reactions?.onSuccess?.();
            return command;
          })
          .catch((error) => {
            reactions?.onFailure?.(error);
            throw error;
          })
      ];

    case "restaurant/save":
      return [
        model as Model,
        saveRestaurant(payload, user)
          .then((command) => {
            reactions?.onSuccess?.();
            return command;
          })
          .catch((error) => {
            reactions?.onFailure?.(error);
            throw error;
          })
      ];

    default:
      throw new Error(`Unhandled message "${type}"`);
  }
}

function requestRestaurants(user: Auth.Model) {
  return fetch("/api/restaurants", {
    headers: Auth.headers(user)
  })
    .then((response) => {
      if (response.status === 200) return response.json();
      throw new Error("No response from restaurants endpoint");
    })
    .then((json) => [
      "restaurants/load",
      { restaurants: json as Restaurant[] }
    ] as Cmd)
    .catch(() => [
      "restaurants/load",
      { restaurants: fallbackRestaurants as Restaurant[] }
    ] as Cmd);
}

function requestRestaurant(
  payload: { restaurantId: string },
  user: Auth.Model
) {
  return fetch(`/api/restaurants/${payload.restaurantId}`, {
    headers: Auth.headers(user)
  })
    .then((response) => {
      if (response.status === 404) {
        return ["restaurant/load", payload] as Cmd;
      }
      if (response.status === 200) return response.json();
      throw new Error("No response from restaurant endpoint");
    })
    .then((json) => {
      if (Array.isArray(json)) return json as Cmd;
      return [
        "restaurant/load",
        { restaurantId: payload.restaurantId, restaurant: json as Restaurant }
      ] as Cmd;
    })
    .catch(() => [
      "restaurant/load",
      {
        restaurantId: payload.restaurantId,
        restaurant: fallbackRestaurantById(payload.restaurantId)
      }
    ] as Cmd);
}

function saveRestaurant(
  payload: { restaurantId: string; restaurant: Restaurant },
  user: Auth.Model
) {
  return fetch(`/api/restaurants/${payload.restaurantId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user)
    },
    body: JSON.stringify(payload.restaurant)
  })
    .then((response) => {
      if (response.status === 200) return response.json();
      throw new Error(
        `${response.status} status; saving restaurant ${payload.restaurantId}`
      );
    })
    .then((json) => [
      "restaurant/load",
      { restaurantId: payload.restaurantId, restaurant: json as Restaurant }
    ] as Cmd)
    .catch(() => [
      "restaurant/load",
      { restaurantId: payload.restaurantId, restaurant: payload.restaurant }
    ] as Cmd);
}

function createRestaurant(
  payload: { restaurant: Restaurant },
  user: Auth.Model
) {
  return fetch("/api/restaurants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user)
    },
    body: JSON.stringify(payload.restaurant)
  })
    .then((response) => {
      if (response.status === 201) return response.json();
      throw new Error(`${response.status} status; creating restaurant`);
    })
    .then((json) => {
      const restaurant = json as Restaurant;
      return [
        "restaurant/load",
        { restaurantId: restaurantSlug(restaurant), restaurant }
      ] as Cmd;
    })
    .catch(() => [
      "restaurants/load",
      { restaurants: [...(fallbackRestaurants as Restaurant[]), payload.restaurant] }
    ] as Cmd);
}

function upsertRestaurant(restaurants, restaurant) {
  if (!restaurant) return restaurants;

  const slug = restaurantSlug(restaurant);
  const list = [...restaurants];
  const index = list.findIndex(
    (item) => restaurantSlug(item) === slug
  );

  if (index >= 0) list[index] = restaurant;
  else list.push(restaurant);

  return list;
}
