const pool = require("../db")
const supabase = require("../config/supabase")


const addProductImage = async (req, res) => {
  try {
    const userId = req.user.userId
    const { productId } = req.params

    if (!req.file) {
      return res.status(400).json({
        error: "Image is required",
      })
    }

    const productResult = await pool.query(
      `
      SELECT OwnerID
      FROM Products
      WHERE ProductID = $1
      `,
      [productId]
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
        error: "You are not allowed to add images to this product",
      })
    }

    const extension =
      req.file.originalname.split(".").pop()

    const fileName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.${extension}`

    const storagePath =
      `products/${productId}/${fileName}`

    const { error: uploadError } =
      await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(
          storagePath,
          req.file.buffer,
          {
            contentType: req.file.mimetype,
            upsert: false,
          }
        )

    if (uploadError) {
      console.error(
        "Supabase upload error:",
        uploadError
      )

      return res.status(500).json({
        error: "Failed to upload image",
      })
    }

    const { data: publicUrlData } =
      supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(storagePath)

    const imageUrl =
      publicUrlData.publicUrl

    try {
      const result = await pool.query(
        `
        INSERT INTO ProductImages
        (
          ProductID,
          ImageURL,
          StoragePath
        )

        VALUES ($1, $2, $3)

        RETURNING
          ImageID,
          ProductID,
          ImageURL,
          StoragePath,
          CreatedAt
        `,
        [
          productId,
          imageUrl,
          storagePath,
        ]
      )

      return res.status(201).json({
        message: "Product image uploaded successfully",
        image: result.rows[0],
      })

    } catch (databaseError) {

      // Supabase upload نجح
      // لكن PostgreSQL فشل
      // لذلك نحذف الصورة من الـStorage

      const { error: cleanupError } =
        await supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .remove([storagePath])

      if (cleanupError) {
        console.error(
          "Storage cleanup error:",
          cleanupError
        )
      }

      throw databaseError
    }

  } catch (error) {
    console.error(
      "Add product image error:",
      error
    )

    return res.status(500).json({
      error: "Failed to upload product image",
    })
  }
}


const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params

    const result = await pool.query(
      `
      SELECT
        ImageID,
        ProductID,
        ImageURL,
        StoragePath,
        CreatedAt
      FROM ProductImages
      WHERE ProductID = $1
      ORDER BY CreatedAt ASC
      `,
      [productId]
    )

    return res.status(200).json(
      result.rows
    )

  } catch (error) {
    console.error(
      "Get product images error:",
      error
    )

    return res.status(500).json({
      error: "Failed to get product images",
    })
  }
}


const deleteProductImage = async (req, res) => {
  try {
    const userId = req.user.userId
    const { imageId } = req.params

    const imageResult = await pool.query(
      `
      SELECT
        pi.ImageID,
        pi.ProductID,
        pi.ImageURL,
        pi.StoragePath,
        p.OwnerID
      FROM ProductImages pi

      JOIN Products p
        ON pi.ProductID = p.ProductID

      WHERE pi.ImageID = $1
      `,
      [imageId]
    )

    if (imageResult.rows.length === 0) {
      return res.status(404).json({
        error: "Image not found",
      })
    }

    const image = imageResult.rows[0]

    const isOwner =
      Number(image.ownerid) === Number(userId)

    const isAdmin =
      req.user.role === "admin"

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You are not allowed to delete this image",
      })
    }

    const { error: storageError } =
      await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .remove([
          image.storagepath,
        ])

    if (storageError) {
      console.error(
        "Supabase delete error:",
        storageError
      )

      return res.status(500).json({
        error: "Failed to delete image from storage",
      })
    }

    await pool.query(
      `
      DELETE FROM ProductImages
      WHERE ImageID = $1
      `,
      [imageId]
    )

    return res.status(200).json({
      message: "Product image deleted successfully",
    })

  } catch (error) {
    console.error(
      "Delete product image error:",
      error
    )

    return res.status(500).json({
      error: "Failed to delete product image",
    })
  }
}


module.exports = {
  addProductImage,
  getProductImages,
  deleteProductImage,
}