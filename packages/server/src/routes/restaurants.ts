import express, { Request, Response } from "express";
import { Restaurant } from "../models/index.js";
import Restaurants from "../services/restaurant-svc.js";

const router = express.Router();

router.get("/", (_req, res: Response) => {
  Restaurants.index()
    .then((list: Restaurant[]) => res.send(list))
    .catch((err) => res.status(500).send(err));
});

router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  Restaurants.get(id)
    .then((restaurant: Restaurant | undefined) => {
      if (restaurant) res.send(restaurant);
      else res.status(404).send();
    })
    .catch((err) => res.status(500).send(err));
});

router.post("/", (req: Request, res: Response) => {
  const newRestaurant = req.body;

  Restaurants.create(newRestaurant)
    .then((restaurant: Restaurant) => res.status(201).json(restaurant))
    .catch((err) => res.status(500).send(err));
});

router.put("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const newRestaurant = req.body;

  Restaurants.update(id, newRestaurant)
    .then((restaurant: Restaurant | undefined) => {
      if (restaurant) res.json(restaurant);
      else res.status(404).end();
    })
    .catch(() => res.status(404).end());
});

router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  Restaurants.remove(id)
    .then(() => res.status(204).end())
    .catch((err) => res.status(404).send(err));
});

export default router;
