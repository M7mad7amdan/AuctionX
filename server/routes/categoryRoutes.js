const express = require("express")

const router = express.Router()

const authenticateToken =
  require("../middleware/authenticateToken")

const authorizeAdmin =
  require("../middleware/authorizeAdmin")

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController")


// Public
router.get(
  "/",
  getCategories
)


// Admin only
router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  createCategory
)


// Admin only
router.put(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  updateCategory
)


// Admin only
router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  deleteCategory
)


module.exports = router