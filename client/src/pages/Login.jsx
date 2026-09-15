import { useState } from "react"
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"

import api from "../api/axios"

import {
  ArrowRight,
  Eye,
  EyeOff,
  Gem,
  Globe2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react"

import {
  FaApple,
  FaGithub,
} from "react-icons/fa6"


const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const redirectPath =
    location.state?.from || "/"

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    })


  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }


  // =========================
  // NORMAL LOGIN
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")

    if (
      !formData.email.trim() ||
      !formData.password
    ) {
      setError(
        "Please enter your email and password."
      )
      return
    }

    try {
      setLoading(true)

      const response =
        await api.post("/auth/login", {
          email: formData.email.trim(),
          password: formData.password,
        })

      localStorage.setItem(
        "token",
        response.data.token
      )

      localStorage.setItem(
        "user",
        JSON.stringify(
          response.data.user
        )
      )

      navigate(
        redirectPath,
        {
          replace: true,
        }
      )

    } catch (error) {
      console.error(
        "Login error:",
        error
      )

      setError(
        error.response?.data?.error ||
        "Something went wrong. Please try again."
      )

    } finally {
      setLoading(false)
    }
  }


  // =========================
  // GOOGLE LOGIN
  // =========================

  const handleGoogleSuccess =
    async (credentialResponse) => {

      try {
        setError("")
        setLoading(true)

        const response =
          await api.post(
            "/auth/google",
            {
              credential:
                credentialResponse.credential,
            }
          )

        localStorage.setItem(
          "token",
          response.data.token
        )

        localStorage.setItem(
          "user",
          JSON.stringify(
            response.data.user
          )
        )

        navigate(
          redirectPath,
          {
            replace: true,
          }
        )

      } catch (error) {
        console.error(
          "Google login error:",
          error
        )

        setError(
          error.response?.data?.error ||
          "Google login failed. Please try again."
        )

      } finally {
        setLoading(false)
      }
    }


  const handleGoogleError = () => {
    setError(
      "Google login failed. Please try again."
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
                  className="text-white/90 transition hover:text-white"
                >
                  Home
                </Link>

                <Link
                  to="/auctions"
                  className="text-white/90 transition hover:text-white"
                >
                  Explore Auctions
                </Link>

                <Link
                  to="/categories"
                  className="text-white/90 transition hover:text-white"
                >
                  Categories
                </Link>

              </nav>

            </div>


            {/* Hero Text */}

            <div className="mt-20 max-w-xl">

              <p className="text-sm uppercase tracking-[0.35em] text-white/70">
                Authentic Pieces.
              </p>

              <p className="mt-2 text-sm uppercase tracking-[0.35em] text-white/70">
                Real Opportunities.
              </p>

              <h1 className="mt-6 text-6xl font-semibold leading-[1.08] tracking-tight">
                More than
                <br />
                auctions.
              </h1>

              <p className="mt-6 max-w-md text-lg leading-7 text-white/90">
                Join a global community of collectors,
                enthusiasts, and dreamers.
              </p>

            </div>


            {/* Bottom Features */}

            <div className="mt-auto">

              <div className="grid grid-cols-3">

                <div className="flex flex-col items-center border-r border-white/30 px-6 text-center">

                  <ShieldCheck size={30} />

                  <p className="mt-4 text-base">
                    Trusted
                    <br />
                    Marketplace
                  </p>

                </div>

                <div className="flex flex-col items-center border-r border-white/30 px-6 text-center">

                  <Globe2 size={30} />

                  <p className="mt-4 text-base">
                    Global
                    <br />
                    Community
                  </p>

                </div>

                <div className="flex flex-col items-center px-6 text-center">

                  <Gem size={30} />

                  <p className="mt-4 text-base">
                    Unique
                    <br />
                    Opportunities
                  </p>

                </div>

              </div>

              <div className="mt-8 flex flex-col items-center">

                <div className="h-px w-12 bg-white/60" />

                <p className="mt-6 text-xs uppercase tracking-[0.35em] text-white/80">
                  Collect. Bid. Belong.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* RIGHT SIDE */}

        <section className="relative flex min-h-screen flex-col">

          {/* Sign Up */}

          <div className="flex items-center justify-end gap-6 px-8 py-6">

            <p className="text-sm text-gray-700">
              Don’t have an account?
            </p>

            <Link
              to="/register"
              state={{
                from:
                  location.state?.from,
              }}
              className="
                rounded-lg
                bg-black
                px-7
                py-3
                text-sm
                font-medium
                text-white
                transition
                hover:bg-gray-800
              "
            >
              Sign Up
            </Link>

          </div>


          {/* Form Wrapper */}

          <div className="flex flex-1 items-center justify-center px-6 pb-16">

            <div className="w-full max-w-xl">

              <h2 className="text-5xl font-semibold tracking-tight">
                Welcome Back
              </h2>

              <p className="mt-5 max-w-lg text-lg leading-7 text-gray-500">
                Log in to your AuctionX account and continue your journey
                in the world of unique items.
              </p>


              <form
                onSubmit={handleSubmit}
                className="mt-10"
              >

                {/* Email */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <div className="relative">

                    <Mail
                      size={20}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-700
                      "
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="
                        h-14
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        pl-12
                        pr-4
                        text-sm
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-black
                      "
                    />

                  </div>

                </div>


                {/* Password */}

                <div className="mt-6">

                  <label className="mb-2 block text-sm font-medium">
                    Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={20}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-700
                      "
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
                      placeholder="Enter your password"
                      className="
                        h-14
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        pl-12
                        pr-12
                        text-sm
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-black
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-500
                      "
                    >

                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}

                    </button>

                  </div>

                  <div className="mt-3 text-right">

                    <Link
                      to="#"
                      className="text-sm text-gray-600 underline underline-offset-2"
                    >
                      Forgot password?
                    </Link>

                  </div>

                </div>


                {/* Error */}

                {error && (
                  <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}


                {/* Login Button */}

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
                    gap-3
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
                    ? "Logging In..."
                    : "Log In"
                  }

                  {!loading && (
                    <ArrowRight size={18} />
                  )}

                </button>

              </form>


              {/* Divider */}

              <div className="my-8 flex items-center gap-4">

                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-sm text-gray-500">
                  or continue with
                </span>

                <div className="h-px flex-1 bg-gray-200" />

              </div>


              {/* SOCIAL LOGIN */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="flex h-13 items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-white">

                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="170"
                  />

                </div>

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
                    transition
                    hover:bg-gray-50
                  "
                >
                  <FaApple size={21} />
                  Apple
                </button>

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
                    transition
                    hover:bg-gray-50
                  "
                >
                  <FaGithub size={20} />
                  GitHub
                </button>

              </div>


              <p className="mt-8 text-center text-sm text-gray-500">

                By logging in, you agree to our{" "}

                <Link
                  to="#"
                  className="underline underline-offset-2"
                >
                  Terms of Service
                </Link>

                {" "}and{" "}

                <Link
                  to="#"
                  className="underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .

              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  )
}

export default Login