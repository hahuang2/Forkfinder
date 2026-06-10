// @ts-nocheck
export const fallbackRestaurants = [
  {
    id: "1",
    name: "McDonald's",
    icon: "icon-burger",
    location: "San Diego, California",
    cuisine: "American fast food",
    href: "restaurants/mcdonalds.html",
    price: "$",
    rating: 4,
    hours: ["Mon-Sun: 6:00 AM - 11:00 PM"],
    reviews: [
      {
        author: "Bob",
        rating: 4,
        comment: "Fast service and fresh fries.",
        createdAt: "Sample review"
      }
    ]
  },
  {
    id: "2",
    name: "Taco Bell",
    icon: "icon-taco",
    location: "San Francisco, California",
    cuisine: "Tex-Mex",
    href: "restaurants/taco-bell.html",
    price: "$",
    rating: 4,
    hours: ["Mon-Sun: 9:00 AM - 1:00 AM"],
    reviews: [
      {
        author: "Alice",
        rating: 4,
        comment: "Great late-night option and good value.",
        createdAt: "Sample review"
      }
    ]
  }
];

export function fallbackRestaurantById(restaurantId) {
  return fallbackRestaurants.find(
    (restaurant) =>
      restaurant.id === restaurantId ||
      restaurant.href === `restaurants/${restaurantId}.html`
  );
}
