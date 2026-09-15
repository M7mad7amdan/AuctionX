const jwt = require("jsonwebtoken")
const pool = require("../db")


const authenticateToken = async (req, res, next) => {

  const authHeader =
    req.headers.authorization


  if (!authHeader) {

    return res.status(401).json({
      error: "Authentication required",
    })

  }


  const token =
    authHeader.split(" ")[1]


  if (!token) {

    return res.status(401).json({
      error: "Authentication required",
    })

  }


  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )


    const userResult =
      await pool.query(
        `
        SELECT
          UserID,
          Role,
          IsSuspended

        FROM Users

        WHERE UserID = $1
        `,
        [decoded.userId]
      )


    if (
      userResult.rows.length === 0
    ) {

      return res.status(401).json({
        error: "User no longer exists",
      })

    }


    const user =
      userResult.rows[0]


    if (user.issuspended) {

      return res.status(403).json({
        error:
          "Your account has been suspended",
      })

    }


    req.user = {
      userId: user.userid,
      role: user.role,
    }


    next()


  } catch (error) {

    console.error(
      "Authentication error:",
      error
    )


    return res.status(401).json({
      error: "Invalid or expired token",
    })

  }

}


module.exports = authenticateToken