const express =
  require("express")

const router =
  express.Router()

const authenticateToken =
  require(
    "../middleware/authenticateToken"
  )

const validate =
  require(
    "../middleware/validate"
  )

const {
  createOrderSchema,
  orderIdSchema,
} = require(
  "../validation/orderValidation"
)

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require(
  "../controllers/orderController"
)


// ====================================================
// CREATE ORDER
// ====================================================

router.post(
  "/",
  authenticateToken,
  validate(
    createOrderSchema
  ),
  createOrder
)


// ====================================================
// MY ORDERS
// ====================================================

router.get(
  "/me",
  authenticateToken,
  getMyOrders
)


// ====================================================
// GET SINGLE ORDER
// ====================================================

router.get(
  "/:orderId",
  authenticateToken,
  validate(
    orderIdSchema
  ),
  getOrderById
)


module.exports = router