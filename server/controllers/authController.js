const pool = require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { OAuth2Client } = require("google-auth-library")

const {
  registerSchema,
  loginSchema,
} = require("../validation/authValidation")


const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
)


// =========================
// REGISTER
// =========================

const register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.issues[0].message,
      })
    }

    const {
      name,
      email,
      password,
    } = validation.data


    const existingUser = await pool.query(
      `
      SELECT UserID
      FROM Users
      WHERE Email = $1
      `,
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Email already exists",
      })
    }


    const hashedPassword = await bcrypt.hash(
      password,
      10
    )


    const result = await pool.query(
      `
      INSERT INTO Users
      (
        Name,
        Email,
        Password,
        AuthProvider
      )
      VALUES ($1, $2, $3, 'local')

      RETURNING
        UserID,
        Name,
        Email,
        Role,
        Bio,
        Image,
        AuthProvider,
        GoogleID,
        CreatedAt
      `,
      [
        name,
        email,
        hashedPassword,
      ]
    )


    const user = result.rows[0]


    const token = jwt.sign(
      {
        userId: user.userid,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )


    return res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    })

  } catch (error) {
    console.error("Register error:", error)

    return res.status(500).json({
      error: "Failed to register user",
    })
  }
}


// =========================
// LOGIN
// =========================

const login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.issues[0].message,
      })
    }

    const {
      email,
      password,
    } = validation.data


    const result = await pool.query(
      `
      SELECT
        UserID,
        Name,
        Email,
        Password,
        Role,
        Bio,
        Image,
        AuthProvider,
        GoogleID,
        CreatedAt
      FROM Users
      WHERE Email = $1
      `,
      [email]
    )


    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      })
    }


    const user = result.rows[0]


    if (user.authprovider !== "local") {
      return res.status(401).json({
        error: "Please login with Google",
      })
    }


    const isMatch = await bcrypt.compare(
      password,
      user.password
    )


    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      })
    }


    const token = jwt.sign(
      {
        userId: user.userid,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )


    return res.status(200).json({
      message: "Login successful",

      user: {
        userid: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        image: user.image,
        authprovider: user.authprovider,
        googleid: user.googleid,
        createdat: user.createdat,
      },

      token,
    })

  } catch (error) {
    console.error("Login error:", error)

    return res.status(500).json({
      error: "Failed to login",
    })
  }
}


// =========================
// GOOGLE LOGIN
// =========================

const googleLogin = async (req, res) => {
  try {

    // Google ID Token coming from frontend
    const { credential } = req.body


    if (!credential) {
      return res.status(400).json({
        error: "Google credential is required",
      })
    }


    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })


    // Trusted data from Google
    const payload = ticket.getPayload()


    const {
      sub,
      email,
      name,
      picture,
      email_verified,
    } = payload


    if (!email || !email_verified) {
      return res.status(401).json({
        error: "Google email is not verified",
      })
    }


    // =========================
    // 1. Check GoogleID
    // =========================

    let result = await pool.query(
      `
      SELECT
        UserID,
        Name,
        Email,
        Role,
        Bio,
        Image,
        AuthProvider,
        GoogleID,
        CreatedAt
      FROM Users
      WHERE GoogleID = $1
      `,
      [sub]
    )


    // Google account already exists
    if (result.rows.length > 0) {

      const user = result.rows[0]


      const token = jwt.sign(
        {
          userId: user.userid,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      )


      return res.status(200).json({
        message: "Google login successful",
        user,
        token,
      })
    }


    // =========================
    // 2. Check Email
    // =========================

    result = await pool.query(
      `
      SELECT
        UserID,
        Name,
        Email,
        Role,
        Bio,
        Image,
        AuthProvider,
        GoogleID,
        CreatedAt
      FROM Users
      WHERE Email = $1
      `,
      [email]
    )


    // User already has local account
    if (result.rows.length > 0) {

      const existingUser = result.rows[0]


      // Safety check
      if (
        existingUser.googleid &&
        existingUser.googleid !== sub
      ) {
        return res.status(409).json({
          error: "This email is already linked to another Google account",
        })
      }


      // Link Google account
      const updatedUserResult = await pool.query(
        `
        UPDATE Users

        SET
          GoogleID = $1,
          Image = COALESCE(Image, $2)

        WHERE UserID = $3

        RETURNING
          UserID,
          Name,
          Email,
          Role,
          Bio,
          Image,
          AuthProvider,
          GoogleID,
          CreatedAt
        `,
        [
          sub,
          picture || null,
          existingUser.userid,
        ]
      )


      const user = updatedUserResult.rows[0]


      const token = jwt.sign(
        {
          userId: user.userid,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      )


      return res.status(200).json({
        message: "Google account linked successfully",
        user,
        token,
      })
    }


    // =========================
    // 3. Create new Google user
    // =========================

    result = await pool.query(
      `
      INSERT INTO Users
      (
        Name,
        Email,
        Password,
        Image,
        AuthProvider,
        GoogleID
      )

      VALUES (
        $1,
        $2,
        NULL,
        $3,
        'google',
        $4
      )

      RETURNING
        UserID,
        Name,
        Email,
        Role,
        Bio,
        Image,
        AuthProvider,
        GoogleID,
        CreatedAt
      `,
      [
        name,
        email,
        picture || null,
        sub,
      ]
    )


    const user = result.rows[0]


    const token = jwt.sign(
      {
        userId: user.userid,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )


    return res.status(201).json({
      message: "Google account created successfully",
      user,
      token,
    })


  } catch (error) {
    console.error("Google login error:", error)

    return res.status(401).json({
      error: "Invalid Google token",
    })
  }
}


module.exports = {
  register,
  login,
  googleLogin,
}