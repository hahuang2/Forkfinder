export interface Review {
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Restaurant {
  name: string;
  icon: string;
  location: string;
  cuisine: string;
  href: string;
  price: string;
  rating: number;
  hours: string[];
  reviews: Review[];
}
