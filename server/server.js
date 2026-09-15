const express = require("express")
const cors = require("cors")
const http = require("http")
require("dotenv").config()

const PORT = process.env.PORT || 5000

const pool = require("./db")
const adminRoutes =
  require("./routes/adminRoutes")
const userRoutes = require("./routes/userRoutes")
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const productImageRoutes = require("./routes/productImageRoutes")
const auctionRoutes = require("./routes/auctionRoutes")
const bidRoutes = require("./routes/bidRoutes")
const favoriteRoutes =
  require("./routes/favoriteRoutes")
const { initSocket } = require("./socket")
const orderRoutes =
  require("./routes/orderRoutes")
const {
  startAuctionFinalizer,
} = require("./jobs/auctionFinalizer")
const app = express()
const server = http.createServer(app)
initSocket(server)

app.use(
  "/uploads",
  express.static("uploads")
)
// Middleware
app.use(cors())
app.use(express.json())


// Routes
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/products", productRoutes)
app.use("/categories", categoryRoutes)
app.use("/product-images", productImageRoutes)
app.use("/auctions", auctionRoutes)
app.use("/bids", bidRoutes)
app.use(
  "/admin",
  adminRoutes
)
app.use(
  "/favorites",
  favoriteRoutes
)
pool.query("SELECT NOW()")
  .then((result) => {
    console.log(
      "Database connected:",
      result.rows[0]
    )
  })
  .catch((error) => {
    console.error(
      "Database connection error:",
      error
    )
  })
app.use(
  "/orders",
  orderRoutes
)

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "AuctionX API is running",
  })
})


// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

  startAuctionFinalizer()
})