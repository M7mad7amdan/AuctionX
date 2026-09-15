const express = require("express")

const router = express.Router()

const {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController")

const authenticateToken = require("../middleware/authenticateToken")
const authorizeUserOrAdmin = require("../middleware/authorizeUserOrAdmin")


router.post("/", createUser)

router.get("/:id", getUserById)

router.put(
  "/:id",
  authenticateToken,
  authorizeUserOrAdmin,
  updateUser
)

router.delete(
  "/:id",
  authenticateToken,
  authorizeUserOrAdmin,
  deleteUser
)


module.exports = router