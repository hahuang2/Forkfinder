// @ts-nocheck
import type { Restaurant } from "server/models";

export interface Model {
  restaurants?: Restaurant[];
  restaurant?: Restaurant;
  selectedRestaurantId?: string;
}

export const init: Model = {
  restaurants: []
};
