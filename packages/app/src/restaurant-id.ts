// @ts-nocheck
export function restaurantSlug(restaurant) {
  if (restaurant?.id) {
    return restaurant.id;
  }

  if (restaurant?._id) {
    return restaurant._id;
  }

  if (restaurant?.href) {
    return restaurant.href.replace(/^restaurants\//, "").replace(/\.html$/, "");
  }

  return "";
}
