import express, { Request, Response } from "express";
import { connect } from "./services/mongo.js";
import auth, { authenticateUser } from "./routes/auth.js";
import restaurants from "./routes/restaurants.js";

const app = express();
const port = process.env.PORT || 3000;
const staticDir = process.env.STATIC || "public";

connect("lab11");

app.use(express.static(staticDir));
app.use(express.json());
app.use("/auth", auth);
app.use("/api/restaurants", authenticateUser, restaurants);

app.get("/hello", (_req: Request, res: Response) => {
  res.send("Hello, World");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
