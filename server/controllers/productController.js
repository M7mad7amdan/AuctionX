const pool = require("../db")

const createProduct = async (req, res) => {
  try {
    const ownerId = req.user.userId

    const {
      title,
      description,
      condition,
    } = req.body

    if (!title || !condition) {
      return res.status(400).json({
        error: "Title and condition are required",
      })
    }

    if (!["new", "used"].includes(condition)) {
      return res.status(400).json({
        error: "Condition must be new or used",
      })
    }

    const result = await pool.query(
      `
      INSERT INTO Products
      (
        OwnerID,
        Title,
        Description,
        Condition
      )
      VALUES ($1, $2, $3, $4)

      RETURNING
        ProductID,
        OwnerID,
        Title,
        Description,
        Condition,
        CreatedAt
      `,
      [
        ownerId,
        title,
        description || null,
        condition,
      ]
    )

    return res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    })

  } catch (error) {
    console.error("Create product error:", error)

    return res.status(500).json({
      error: "Failed to create product",
    })
  }
}


const getProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.ProductID,
        p.OwnerID,
        p.Title,
        p.Description,
        p.Condition,
        p.CreatedAt,
        u.Name AS OwnerName
      FROM Products p
      JOIN Users u
        ON p.OwnerID = u.UserID
      ORDER BY p.CreatedAt DESC
      `
    )

    return res.status(200).json(
      result.rows
    )

  } catch (error) {
    console.error("Get products error:", error)

    return res.status(500).json({
      error: "Failed to get products",
    })
  }
}


const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      SELECT
        p.ProductID,
        p.OwnerID,
        p.Title,
        p.Description,
        p.Condition,
        p.CreatedAt,
        u.Name AS OwnerName
      FROM Products p
      JOIN Users u
        ON p.OwnerID = u.UserID
      WHERE p.ProductID = $1
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      })
    }

    return res.status(200).json(
      result.rows[0]
    )

  } catch (error) {
    console.error("Get product error:", error)

    return res.status(500).json({
      error: "Failed to get product",
    })
  }
}


const updateProduct = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    const {
      title,
      description,
      condition,
    } = req.body

    const productResult = await pool.query(
      `
      SELECT OwnerID
      FROM Products
      WHERE ProductID = $1
      `,
      [id]
    )

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      })
    }

    const product = productResult.rows[0]

    if (
      Number(product.ownerid) !== Number(userId) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "You are not allowed to update this product",
      })
    }

    if (
      condition &&
      !["new", "used"].includes(condition)
    ) {
      return res.status(400).json({
        error: "Condition must be new or used",
      })
    }

    const result = await pool.query(
      `
      UPDATE Products

      SET
        Title = COALESCE($1, Title),
        Description = COALESCE($2, Description),
        Condition = COALESCE($3, Condition)

      WHERE ProductID = $4

      RETURNING
        ProductID,
        OwnerID,
        Title,
        Description,
        Condition,
        CreatedAt
      `,
      [
        title || null,
        description ?? null,
        condition || null,
        id,
      ]
    )

    return res.status(200).json({
      message: "Product updated successfully",
      product: result.rows[0],
    })

  } catch (error) {
    console.error("Update product error:", error)

    return res.status(500).json({
      error: "Failed to update product",
    })
  }
}


const deleteProduct = async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params

    const productResult = await pool.query(
      `
      SELECT OwnerID
      FROM Products
      WHERE ProductID = $1
      `,
      [id]
    )

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      })
    }

    const product = productResult.rows[0]

    if (
      Number(product.ownerid) !== Number(userId) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "You are not allowed to delete this product",
      })
    }

    await pool.query(
      `
      DELETE FROM Products
      WHERE ProductID = $1
      `,
      [id]
    )

    return res.status(200).json({
      message: "Product deleted successfully",
    })

  } catch (error) {
    console.error("Delete product error:", error)

    return res.status(500).json({
      error: "Failed to delete product",
    })
  }
}


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
}