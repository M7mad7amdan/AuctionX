const express = require("express")

const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoriteController")

const authenticateToken =
  require("../middleware/authenticateToken")


const router =
  express.Router()


router.get(
  "/",
  authenticateToken,
  getFavorites
)


router.post(
  "/:auctionId",
  authenticateToken,
  addFavorite
)


router.delete(
  "/:auctionId",
  authenticateToken,
  removeFavorite
)


module.exports = router