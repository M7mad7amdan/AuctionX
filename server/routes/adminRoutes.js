const express = require("express")
const router = express.Router()

const authenticateToken =
  require("../middleware/authenticateToken")

const authorizeAdmin =
  require("../middleware/authorizeAdmin")

const {
  getUsers,
  suspendUser,
  unsuspendUser,
} = require("../controllers/adminController")


router.get(
  "/users",
  authenticateToken,
  authorizeAdmin,
  getUsers
)


router.patch(
  "/users/:id/suspend",
  authenticateToken,
  authorizeAdmin,
  suspendUser
)


router.patch(
  "/users/:id/unsuspend",
  authenticateToken,
  authorizeAdmin,
  unsuspendUser
)


module.exports = router