import { Link } from "react-router-dom"
import { Mail } from "lucide-react"

import {
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6"

const footerLinks = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Explore Auctions",
    path: "/auctions",
  },
  {
    title: "Categories",
    path: "/categories",
  },
  {
    title: "How It Works",
    path: "/how-it-works",
  },
  {
    title: "Privacy",
    path: "/privacy",
  },
  {
    title: "Help",
    path: "/help",
  },
]

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">

      <div className="mx-auto max-w-7xl px-6">

        {/* Top Section */}
        <div
          className="
            flex flex-col
            justify-between
            gap-10
            py-12
            md:flex-row
          "
        >

          {/* Left */}
          <div className="max-w-md">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2"
            >
              <div
                className="
                  flex h-10 w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-black
                  font-semibold
                  text-white
                "
              >
                A
              </div>

              <span
                className="
                  text-xl
                  font-semibold
                  tracking-tight
                "
              >
                AuctionX
              </span>
            </Link>

            {/* Description */}
            <p
              className="
                mt-5
                max-w-sm
                text-sm
                leading-6
                text-gray-500
              "
            >
              Discover unique products,
              join live auctions,
              and compete in real time
              with bidders from anywhere.
            </p>

            {/* Links */}
            <ul
              className="
                mt-6
                flex
                flex-wrap
                gap-x-6
                gap-y-3
              "
            >
              {footerLinks.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.path}
                    className="
                      text-sm
                      text-gray-500
                      transition
                      hover:text-black
                    "
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

          </div>


          {/* Newsletter */}
          <div className="w-full max-w-sm">

            <h3
              className="
                text-base
                font-semibold
                text-gray-900
              "
            >
              Stay up to date
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              Get updates about new auctions
              and featured products.
            </p>

            <form
              className="
                mt-5
                flex
                gap-2
              "
              onSubmit={(e) => e.preventDefault()}
            >

              <input
                type="email"
                placeholder="Enter your email"
                className="
                  h-11
                  flex-1
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  text-sm
                  outline-none
                  transition
                  focus:border-black
                "
              />

              <button
                type="submit"
                className="
                  h-11
                  rounded-xl
                  bg-black
                  px-5
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Subscribe
              </button>

            </form>

          </div>

        </div>


        {/* Divider */}
        <div className="border-t border-gray-200" />


        {/* Bottom */}
        <div
          className="
            flex flex-col-reverse
            items-center
            justify-between
            gap-5
            py-7
            sm:flex-row
          "
        >

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AuctionX.
            All rights reserved.
          </p>


          {/* Social */}
          <div className="flex items-center gap-5">

            <a
              href="mailto:contact@auctionx.com"
              className="
                text-gray-500
                transition
                hover:text-black
              "
            >
              <Mail size={19} />
            </a>

            <a
              href="#"
              className="
                text-gray-500
                transition
                hover:text-black
              "
            >
              <FaXTwitter size={18} />
            </a>

            <a
              href="#"
              className="
                text-gray-500
                transition
                hover:text-black
              "
            >
              <FaInstagram size={18} />
            </a>

            <a
              href="#"
              className="
                text-gray-500
                transition
                hover:text-black
              "
            >
              <FaYoutube size={18} />
            </a>

            <a
              href="#"
              className="
                text-gray-500
                transition
                hover:text-black
              "
            >
              <FaGithub size={18} />
            </a>

          </div>

        </div>

      </div>

    </footer>
  )
}

export default Footer