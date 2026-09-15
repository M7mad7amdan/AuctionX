import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LogOut, Menu, X } from "lucide-react"

const publicMenuItems = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Explore",
    path: "/auctions",
  },
  {
    name: "Categories",
    path: "/categories",
  },
]

const privateMenuItems = [
  {
    name: "My Bids",
    path: "/my-bids",
  },
  {
    name: "My Listings",
    path: "/my-listings",
  },
  {
    name: "Sell Item",
    path: "/sell-item",
  },
]

const NavBar = () => {
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const token = localStorage.getItem("token")
  const isLoggedIn = Boolean(token)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    setMenuOpen(false)

    navigate("/")
    window.location.reload()
  }

  const menuItems = isLoggedIn
    ? [...publicMenuItems, ...privateMenuItems]
    : publicMenuItems

  return (
    <header>
      <nav className="fixed left-0 top-0 z-50 w-full px-4">

        <div
          className={`
            mx-auto mt-3 max-w-7xl
            transition-all duration-300
            ${
              isScrolled
                ? "rounded-2xl border border-white/20 bg-white/80 px-6 shadow-sm backdrop-blur-xl"
                : "px-2"
            }
          `}
        >

          <div className="flex h-16 items-center justify-between">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                A
              </div>

              <span className="text-xl font-semibold tracking-tight">
                AuctionX
              </span>
            </Link>


            {/* DESKTOP LINKS */}
            <ul className="hidden items-center gap-7 md:flex">

              {menuItems.map((item) => (
                <li key={item.name}>

                  <Link
                    to={item.path}
                    className="
                      text-sm font-medium text-gray-600
                      transition-colors
                      hover:text-black
                    "
                  >
                    {item.name}
                  </Link>

                </li>
              ))}

            </ul>


            {/* DESKTOP ACTIONS */}
            <div className="hidden items-center gap-3 md:flex">

              {isLoggedIn ? (

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex items-center gap-2
                    rounded-xl bg-black
                    px-5 py-2.5
                    text-sm font-medium text-white
                    transition
                    hover:bg-gray-800
                  "
                >
                  <LogOut size={16} />
                  Logout
                </button>

              ) : (

                <>
                  <Link
                    to="/login"
                    className="
                      rounded-xl px-4 py-2
                      text-sm font-medium text-gray-700
                      transition
                      hover:bg-gray-100
                    "
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="
                      rounded-xl bg-black px-5 py-2.5
                      text-sm font-medium text-white
                      transition
                      hover:bg-gray-800
                    "
                  >
                    Sign Up
                  </Link>
                </>

              )}

            </div>


            {/* MOBILE BUTTON */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                hover:bg-gray-100
                md:hidden
              "
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

          </div>


          {/* MOBILE MENU */}
          {menuOpen && (

            <div
              className="
                mb-4 rounded-2xl
                border bg-white
                p-5 shadow-lg
                md:hidden
              "
            >

              <ul className="flex flex-col gap-4">

                {menuItems.map((item) => (

                  <li key={item.name}>

                    <Link
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className="
                        block text-sm font-medium
                        text-gray-700
                      "
                    >
                      {item.name}
                    </Link>

                  </li>

                ))}

              </ul>


              <div className="mt-5 flex flex-col gap-2 border-t pt-5">

                {isLoggedIn ? (

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex items-center justify-center gap-2
                      rounded-xl bg-black
                      px-4 py-2.5
                      text-center text-sm font-medium
                      text-white
                    "
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                ) : (

                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="
                        rounded-xl border
                        px-4 py-2.5
                        text-center text-sm font-medium
                      "
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="
                        rounded-xl bg-black
                        px-4 py-2.5
                        text-center text-sm font-medium
                        text-white
                      "
                    >
                      Sign Up
                    </Link>
                  </>

                )}

              </div>

            </div>

          )}

        </div>

      </nav>
    </header>
  )
}

export default NavBar