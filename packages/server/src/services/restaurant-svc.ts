import { Restaurant } from "../models/index.js";
import { Schema, model, Types } from "mongoose";

const restaurantSchema = new Schema<Restaurant>(
  {
    name: String,
    icon: String,
    location: String,
    cuisine: String,
    href: String,
    price: String,
    rating: Number,
    hours: [String],
    reviews: [
      {
        author: String,
        rating: Number,
        comment: String,
        createdAt: String
      }
    ]
  },
  { collection: "restaurants" }
);

const RestaurantModel = model<Restaurant>("Restaurant", restaurantSchema);

function queryById(id: string) {
  if (Types.ObjectId.isValid(id)) {
    return { _id: id };
  }

  return { href: `restaurants/${id}.html` };
}

function index(): Promise<Restaurant[]> {
  return RestaurantModel.find();
}

function get(id: string): Promise<Restaurant | undefined> {
  return RestaurantModel.findOne(queryById(id)).then(
    (restaurant) => restaurant ?? undefined
  );
}

function create(json: Restaurant): Promise<Restaurant> {
  const restaurant = new RestaurantModel(json);
  return restaurant.save();
}

function update(
  id: string,
  restaurant: Restaurant
): Promise<Restaurant | undefined> {
  return RestaurantModel.findOneAndUpdate(queryById(id), restaurant, {
    new: true,
    runValidators: true
  }).then((updated) => updated ?? undefined);
}

function remove(id: string): Promise<void> {
  return RestaurantModel.findOneAndDelete(queryById(id)).then((deleted) => {
    if (!deleted) throw new Error(`${id} not deleted`);
  });
}

export default { index, get, create, update, remove };
