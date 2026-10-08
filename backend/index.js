const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use("/customers", customerRoutes);
  app.use("/products", productRoutes);
  app.use("/wishlist", wishlistRoutes);
  app.use("/cart", cartRoutes);
  app.use("/orders", orderRoutes);

  return app;
}

async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(process.env.MONGO_URI);
}

async function startServer() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  await connectDatabase();

  const port = process.env.PORT || 5000;
  createApp().listen(port, () => {
    console.log(`ShopKart server is running on port ${port}`);
  });
}


  startServer().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });


module.exports = { createApp, connectDatabase };
