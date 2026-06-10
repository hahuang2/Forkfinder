// @ts-nocheck
import type { Reactions } from "@unbndl/store";
import type { Restaurant } from "server/models";

export type Msg =
  | ["restaurants/request"]
  | ["restaurants/load", { restaurants: Restaurant[] }]
  | ["restaurant/request", { restaurantId: string }]
  | ["restaurant/load", { restaurantId: string; restaurant?: Restaurant }]
  | [
      "restaurant/create",
      { restaurant: Restaurant },
      Reactions?
    ]
  | [
      "restaurant/delete",
      { restaurantId: string },
      Reactions?
    ]
  | [
      "restaurant/save",
      { restaurantId: string; restaurant: Restaurant },
      Reactions?
    ];
