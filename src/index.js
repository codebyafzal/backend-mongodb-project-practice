import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.db.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is Running on PORT:${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error", error);
  });
