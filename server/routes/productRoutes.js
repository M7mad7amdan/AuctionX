const express = require("express")
const router = express.Router()

const authenticateToken =
  require("../middleware/authenticateToken")

const validate =
  require("../middleware/validate")

const {
  createProductSchema,
  updateProductSchema,
} = require("../validation/productValidation")

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController")


router.get(
  "/",
  getProducts
)

router.get(
  "/:id",
  getProductById
)

router.post(
  "/",
  authenticateToken,
  validate(createProductSchema),
  createProduct
)

router.put(
  "/:id",
  authenticateToken,
  validate(updateProductSchema),
  updateProduct
)

router.delete(
  "/:id",
  authenticateToken,
  deleteProduct
)


module.exports = router