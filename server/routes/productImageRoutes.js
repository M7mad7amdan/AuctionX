const express = require("express")
const router = express.Router()

const authenticateToken =
  require("../middleware/authenticateToken")

const upload =
  require("../middleware/upload")

const {
  addProductImage,
  getProductImages,
  deleteProductImage,
} = require("../controllers/productImageController")


router.get(
  "/product/:productId",
  getProductImages
)


router.post(
  "/product/:productId",
  authenticateToken,
  upload.single("image"),
  addProductImage
)


router.delete(
  "/:imageId",
  authenticateToken,
  deleteProductImage
)


module.exports = router