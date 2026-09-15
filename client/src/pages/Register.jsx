import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"

import api from "../api/axios"

import {
  ArrowRight,
  Eye,
  EyeOff,
  Gavel,
  Globe2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  FaApple,
  FaGithub,
} from "react-icons/fa6"


const Register = () => {

  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  })


  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox"
        ? checked
        : value,
    }))

  }


  // =========================
  // NORMAL REGISTER
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault()

    setError("")


    // Required fields
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.")
      return
    }


    // Password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }


    // Password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }


    // Terms
    if (!formData.agree) {
      setError(
        "You must agree to the Terms of Service and Privacy Policy."
      )
      return
    }


    // Backend stores full name
    const name =
      `${formData.firstName.trim()} ${formData.lastName.trim()}`


    try {

      setLoading(true)


      const response = await api.post("/auth/register", {
        name,
        email: formData.email.trim(),
        password: formData.password,
      })


      // Save JWT
      localStorage.setItem(
        "token",
        response.data.token
      )


      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      )


      // Go to home page
      navigate("/")


    } catch (error) {

      console.error("Register error:", error)

      setError(
        error.response?.data?.error ||
        "Something went wrong. Please try again."
      )

    } finally {

      setLoading(false)

    }

  }


  // =========================
  // GOOGLE REGISTER / LOGIN
  // =========================

  const handleGoogleSuccess = async (credentialResponse) => {

    try {

      setError("")
      setLoading(true)


      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      })


      // Save JWT
      localStorage.setItem(
        "token",
        response.data.token
      )


      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      )


      // Go to home page
      navigate("/")


    } catch (error) {

      console.error("Google register error:", error)

      setError(
        error.response?.data?.error ||
        "Google sign up failed. Please try again."
      )

    } finally {

      setLoading(false)

    }

  }


  const handleGoogleError = () => {

    setError(
      "Google sign up failed. Please try again."
    )

  }


  return (

    <main className="min-h-screen bg-white">

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">


        {/* LEFT SIDE */}

        <section className="relative hidden overflow-hidden bg-black text-white lg:block">

          <img
            src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1600&q=90"
            alt="Luxury watch"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/55" />


          <div className="relative flex min-h-screen flex-col px-12 py-8">


            {/* Logo + Navigation */}

            <div className="flex items-center justify-between">

              <Link
                to="/"
                className="text-3xl font-semibold tracking-tight"
              >
                AuctionX
              </Link>


              <nav className="flex items-center gap-9 text-sm">

                <Link
                  to="/"
                  className="text-white/90 hover:text-white"
                >
                  Home
                </Link>

                <Link
                  to="/auctions"
                  className="text-white/90 hover:text-white"
                >
                  Explore Auctions
                </Link>

                <Link
                  to="/categories"
                  className="text-white/90 hover:text-white"
                >
                  Categories
                </Link>

                <Link
                  to="/how-it-works"
                  className="text-white/90 hover:text-white"
                >
                  How It Works
                </Link>

              </nav>

            </div>


            {/* Hero */}

            <div className="mt-20 max-w-lg">

              <p className="text-sm uppercase tracking-[0.35em] text-white/70">
                Join AuctionX
              </p>

              <h1 className="mt-6 text-6xl font-semibold leading-[1.05] tracking-tight">
                Create your
                <br />
                account
              </h1>

              <p className="mt-5 max-w-md text-lg leading-7 text-white/90">
                Be part of a global community of collectors,
                enthusiasts, and opportunity seekers.
              </p>

            </div>


            {/* Benefits */}

            <div className="mt-12 space-y-8">

              <div className="flex items-center gap-5">

                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60">
                  <Gavel size={24} />
                </div>

                <div>

                  <p className="font-medium">
                    Bid on rare items
                  </p>

                  <p className="mt-1 text-sm text-white/70">
                    Watches, art, cars, and more
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-5">

                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60">
                  <Globe2 size={24} />
                </div>

                <div>

                  <p className="font-medium">
                    Join a global community
                  </p>

                  <p className="mt-1 text-sm text-white/70">
                    Connect with collectors worldwide
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-5">

                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60">
                  <ShieldCheck size={24} />
                </div>

                <div>

                  <p className="font-medium">
                    Buy and sell with confidence
                  </p>

                  <p className="mt-1 text-sm text-white/70">
                    Secure marketplace and verified users
                  </p>

                </div>

              </div>

            </div>


            <div className="mt-auto">

              <div className="h-px w-12 bg-white/50" />

              <p className="mt-5 text-xs uppercase tracking-[0.35em] text-white/75">
                More than auctions.
              </p>

              <p className="mt-2 text-xs uppercase tracking-[0.35em] text-white/75">
                A higher standard.
              </p>

            </div>

          </div>

        </section>


        {/* RIGHT SIDE */}

        <section className="flex min-h-screen flex-col">


          {/* Login */}

          <div className="flex items-center justify-end gap-6 px-8 py-6">

            <p className="text-sm text-gray-700">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="
                rounded-lg
                border
                border-gray-300
                px-7
                py-3
                text-sm
                font-medium
                transition
                hover:bg-gray-50
              "
            >
              Log In
            </Link>

          </div>


          {/* Form */}

          <div className="flex flex-1 items-center justify-center px-6 pb-12">

            <div className="w-full max-w-xl">

              <p className="text-sm uppercase tracking-[0.25em] text-gray-600">
                Create Account
              </p>

              <h2 className="mt-4 text-5xl font-semibold tracking-tight">
                Join AuctionX
              </h2>

              <p className="mt-4 max-w-lg text-lg leading-7 text-gray-500">
                Start your journey today and discover unique items
                from around the world.
              </p>


              <form
                onSubmit={handleSubmit}
                className="mt-9"
              >


                {/* Name */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      First Name
                    </label>

                    <div className="relative">

                      <UserRound
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        className="
                          h-13
                          w-full
                          rounded-lg
                          border
                          border-gray-300
                          pl-12
                          pr-4
                          text-sm
                          outline-none
                          focus:border-black
                        "
                      />

                    </div>

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Last Name
                    </label>

                    <div className="relative">

                      <UserRound
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        className="
                          h-13
                          w-full
                          rounded-lg
                          border
                          border-gray-300
                          pl-12
                          pr-4
                          text-sm
                          outline-none
                          focus:border-black
                        "
                      />

                    </div>

                  </div>

                </div>


                {/* Email */}

                <div className="mt-5">

                  <label className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="
                        h-13
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        pl-12
                        pr-4
                        text-sm
                        outline-none
                        focus:border-black
                      "
                    />

                  </div>

                </div>


                {/* Password */}

                <div className="mt-5">

                  <label className="mb-2 block text-sm font-medium">
                    Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="
                        h-13
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        pl-12
                        pr-12
                        text-sm
                        outline-none
                        focus:border-black
                      "
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >

                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}

                    </button>

                  </div>

                </div>


                {/* Confirm Password */}

                <div className="mt-5">

                  <label className="mb-2 block text-sm font-medium">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="
                        h-13
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        pl-12
                        pr-12
                        text-sm
                        outline-none
                        focus:border-black
                      "
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >

                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}

                    </button>

                  </div>

                </div>


                {/* Terms */}

                <label className="mt-5 flex items-start gap-3 text-sm text-gray-700">

                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4"
                  />

                  <span>
                    I agree to the{" "}

                    <Link
                      to="#"
                      className="underline"
                    >
                      Terms of Service
                    </Link>

                    {" "}and{" "}

                    <Link
                      to="#"
                      className="underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>

                </label>


                {/* Error */}

                {error && (
                  <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}


                {/* Create Account */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-7
                    flex
                    h-14
                    w-full
                    items-center
                    justify-center
                    gap-4
                    rounded-lg
                    bg-black
                    text-base
                    font-medium
                    text-white
                    transition
                    hover:bg-gray-800
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading
                    ? "Creating Account..."
                    : "Create Account"
                  }

                  {!loading && (
                    <ArrowRight size={18} />
                  )}

                </button>

              </form>


              {/* Divider */}

              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-sm text-gray-500">
                  or continue with
                </span>

                <div className="h-px flex-1 bg-gray-200" />

              </div>


              {/* Social */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">


                {/* GOOGLE */}

                <div className="flex h-13 items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-white">

                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="signup_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="170"
                  />

                </div>


                {/* APPLE - UI ONLY */}

                <button
                  type="button"
                  className="
                    flex
                    h-13
                    items-center
                    justify-center
                    gap-3
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    text-sm
                    font-medium
                    hover:bg-gray-50
                  "
                >
                  <FaApple size={21} />
                  Apple
                </button>


                {/* GITHUB - UI ONLY */}

                <button
                  type="button"
                  className="
                    flex
                    h-13
                    items-center
                    justify-center
                    gap-3
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    text-sm
                    font-medium
                    hover:bg-gray-50
                  "
                >
                  <FaGithub size={20} />
                  GitHub
                </button>

              </div>


              <p className="mt-7 text-center text-sm leading-6 text-gray-500">
                By creating an account, you agree to receive updates,
                promotions, and news from AuctionX. You can opt out at any time.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>

  )

}

export default Register