import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Link,
} from "react-router-dom"

import {
  Bell,
  CirclePlus,
  Gavel,
  Heart,
  Home,
  MessageSquare,
  MoreVertical,
  Search,
  Settings,
  Tag,
  Clock3,
  CircleX,
} from "lucide-react"

import api from "../api/axios"


const statusStyles = {
  live: "bg-green-50 text-green-700",
  upcoming: "bg-blue-50 text-blue-700",
  ended: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-600",
}


const MyListings = () => {

  const [listings, setListings] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [tab, setTab] =
    useState("all")

  const [search, setSearch] =
    useState("")

  const [sort, setSort] =
    useState("newest")


  // ====================================================
  // CURRENT USER
  // ====================================================

  const storedUser =
    localStorage.getItem("user")

  const user =
    storedUser
      ? JSON.parse(storedUser)
      : null


  // ====================================================
  // LOAD USER LISTINGS
  // ====================================================

  useEffect(() => {

    const loadListings = async () => {

      if (!user?.userid) {
        setError(
          "Unable to identify the current user."
        )

        setLoading(false)

        return
      }


      try {

        setLoading(true)
        setError("")


        const response =
          await api.get(
            `/auctions?sellerId=${user.userid}&limit=100`
          )


        const data =
          response.data


        const auctions =
          Array.isArray(data)
            ? data
            : data.auctions || []


        setListings(auctions)


      } catch (error) {

        console.error(
          "Failed to load listings:",
          error
        )


        setError(
          error.response?.data?.error ||
          "Unable to load your listings."
        )


      } finally {

        setLoading(false)

      }

    }


    loadListings()

  }, [user?.userid])


  // ====================================================
  // COUNTS
  // ====================================================

  const counts =
    useMemo(() => {

      return {

        all:
          listings.length,

        live:
          listings.filter(
            (item) =>
              item.status === "live"
          ).length,

        upcoming:
          listings.filter(
            (item) =>
              item.status === "upcoming"
          ).length,

        ended:
          listings.filter(
            (item) =>
              item.status === "ended"
          ).length,

        cancelled:
          listings.filter(
            (item) =>
              item.status === "cancelled"
          ).length,

      }

    }, [listings])


  // ====================================================
  // FILTER + SEARCH + SORT
  // ====================================================

  const filteredListings =
    useMemo(() => {

      let result =
        [...listings]


      // STATUS

      if (tab !== "all") {

        result =
          result.filter(
            (listing) =>
              listing.status === tab
          )

      }


      // SEARCH

      if (search.trim()) {

        const query =
          search
            .trim()
            .toLowerCase()


        result =
          result.filter(
            (listing) =>

              listing.title
                ?.toLowerCase()
                .includes(query) ||

              listing.categoryname
                ?.toLowerCase()
                .includes(query)

          )

      }


      // SORT

      if (
        sort === "price-high"
      ) {

        result.sort(
          (a, b) =>
            Number(b.currentprice) -
            Number(a.currentprice)
        )

      }


      if (
        sort === "price-low"
      ) {

        result.sort(
          (a, b) =>
            Number(a.currentprice) -
            Number(b.currentprice)
        )

      }


      if (
        sort === "newest"
      ) {

        result.sort(
          (a, b) =>
            new Date(b.createdat) -
            new Date(a.createdat)
        )

      }


      return result

    }, [
      listings,
      tab,
      search,
      sort,
    ])


  // ====================================================
  // FORMAT MONEY
  // ====================================================

  const formatMoney =
    (value) => {

      return Number(
        value || 0
      ).toLocaleString()

    }


  // ====================================================
  // FORMAT DATE
  // ====================================================

  const formatDate =
    (value) => {

      if (!value) {
        return "-"
      }


      return new Date(
        value
      ).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      )

    }


  const formatTime =
    (value) => {

      if (!value) {
        return "-"
      }


      return new Date(
        value
      ).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )

    }


  // ====================================================
  // UI
  // ====================================================

  return (

    <main className="pt-24">

      <div
        className="
          mx-auto
          grid
          max-w-[1500px]
          grid-cols-1
          lg:grid-cols-[230px_1fr]
        "
      >

        {/* ============================================= */}
        {/* SIDEBAR */}
        {/* ============================================= */}

        <aside
          className="
            border-r
            border-gray-200
            px-5
            py-8
          "
        >

          <nav className="space-y-2">

            <Link
              to="/profile"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                text-gray-700
                hover:bg-gray-50
              "
            >
              <Home size={18} />
              Dashboard
            </Link>


            <Link
              to="/my-bids"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                text-gray-700
                hover:bg-gray-50
              "
            >
              <Gavel size={18} />
              My Bids
            </Link>


            <Link
              to="/profile"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                text-gray-700
                hover:bg-gray-50
              "
            >
              <Heart size={18} />
              Watchlist
            </Link>


            <Link
              to="/my-listings"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                bg-gray-100
                px-4
                py-3
                text-sm
                font-medium
              "
            >
              <Tag size={18} />
              My Listings
            </Link>


            <Link
              to="/sell-item"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                text-gray-700
                hover:bg-gray-50
              "
            >
              <CirclePlus size={18} />
              Sell an Item
            </Link>

          </nav>


          <div
            className="
              my-6
              border-t
              border-gray-200
            "
          />


          <nav className="space-y-2">

            <Link
              to="#"
              className="
                flex
                items-center
                justify-between
                rounded-xl
                px-4
                py-3
                text-sm
                text-gray-700
                hover:bg-gray-50
              "
            >

              <span
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <MessageSquare
                  size={18}
                />

                Messages
              </span>

              <span
                className="
                  rounded-full
                  bg-gray-100
                  px-2
                  py-1
                  text-xs
                "
              >
                3
              </span>

            </Link>


            <Link
              to="#"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                text-gray-700
                hover:bg-gray-50
              "
            >
              <Bell size={18} />
              Notifications
            </Link>


            <Link
              to="#"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                text-gray-700
                hover:bg-gray-50
              "
            >
              <Settings size={18} />
              Settings
            </Link>

          </nav>


          {/* PROMO */}

          <div
            className="
              mt-10
              overflow-hidden
              rounded-xl
              bg-black
              text-white
            "
          >

            <img
              src="https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=700&q=80"
              alt=""
              className="
                h-40
                w-full
                object-cover
                opacity-70
              "
            />


            <div className="p-4">

              <h3
                className="
                  text-2xl
                  font-semibold
                  leading-tight
                "
              >
                Turn your passion
                into opportunity
              </h3>


              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-gray-300
                "
              >
                List your unique
                items and reach a
                global audience.
              </p>


              <Link
                to="/sell-item"
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-black
                "
              >
                Sell an Item →
              </Link>

            </div>

          </div>

        </aside>


        {/* ============================================= */}
        {/* CONTENT */}
        {/* ============================================= */}

        <section
          className="
            px-8
            py-8
          "
        >

          {/* HEADER */}

          <div
            className="
              flex
              flex-col
              justify-between
              gap-5
              md:flex-row
              md:items-center
            "
          >

            <div>

              <h1
                className="
                  text-4xl
                  font-semibold
                  tracking-tight
                "
              >
                My Listings
              </h1>


              <p
                className="
                  mt-2
                  text-gray-500
                "
              >
                Manage your auctions,
                track performance, and
                keep your collection
                moving.
              </p>

            </div>


            <Link
              to="/sell-item"
              className="
                flex
                h-12
                items-center
                gap-2
                rounded-lg
                bg-black
                px-6
                text-sm
                font-medium
                text-white
              "
            >
              <CirclePlus
                size={18}
              />

              Sell a New Item
            </Link>

          </div>


          {/* ============================================= */}
          {/* STATS */}
          {/* ============================================= */}

          <div
            className="
              mt-7
              grid
              grid-cols-2
              gap-4
              xl:grid-cols-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-5
                rounded-xl
                bg-gray-50
                p-5
              "
            >
              <Tag size={28} />

              <div>

                <p
                  className="
                    text-2xl
                    font-semibold
                  "
                >
                  {counts.all}
                </p>

                <p
                  className="
                    text-sm
                    text-gray-600
                  "
                >
                  Total Listings
                </p>

              </div>

            </div>


            <div
              className="
                flex
                items-center
                gap-5
                rounded-xl
                bg-gray-50
                p-5
              "
            >

              <span
                className="
                  h-4
                  w-4
                  rounded-full
                  bg-green-500
                "
              />

              <div>

                <p
                  className="
                    text-2xl
                    font-semibold
                  "
                >
                  {counts.live}
                </p>

                <p
                  className="
                    text-sm
                    text-gray-600
                  "
                >
                  Active
                </p>

              </div>

            </div>


            <div
              className="
                flex
                items-center
                gap-5
                rounded-xl
                bg-gray-50
                p-5
              "
            >

              <Clock3 size={28} />

              <div>

                <p
                  className="
                    text-2xl
                    font-semibold
                  "
                >
                  {counts.upcoming}
                </p>

                <p
                  className="
                    text-sm
                    text-gray-600
                  "
                >
                  Scheduled
                </p>

              </div>

            </div>


            <div
              className="
                flex
                items-center
                gap-5
                rounded-xl
                bg-gray-50
                p-5
              "
            >

              <Gavel size={28} />

              <div>

                <p
                  className="
                    text-2xl
                    font-semibold
                  "
                >
                  {counts.ended}
                </p>

                <p
                  className="
                    text-sm
                    text-gray-600
                  "
                >
                  Ended
                </p>

              </div>

            </div>


            <div
              className="
                flex
                items-center
                gap-5
                rounded-xl
                bg-gray-50
                p-5
              "
            >

              <CircleX
                size={28}
              />

              <div>

                <p
                  className="
                    text-2xl
                    font-semibold
                  "
                >
                  {counts.cancelled}
                </p>

                <p
                  className="
                    text-sm
                    text-gray-600
                  "
                >
                  Cancelled
                </p>

              </div>

            </div>

          </div>


          {/* ============================================= */}
          {/* CONTROLS */}
          {/* ============================================= */}

          <div
            className="
              mt-7
              flex
              flex-col
              justify-between
              gap-5
              xl:flex-row
              xl:items-end
            "
          >

            {/* TABS */}

            <div
              className="
                flex
                gap-8
                overflow-x-auto
              "
            >

              {[
                [
                  "all",
                  `All Listings (${counts.all})`,
                ],

                [
                  "live",
                  `Active (${counts.live})`,
                ],

                [
                  "upcoming",
                  `Scheduled (${counts.upcoming})`,
                ],

                [
                  "ended",
                  `Ended (${counts.ended})`,
                ],

                [
                  "cancelled",
                  `Cancelled (${counts.cancelled})`,
                ],

              ].map(
                ([value, label]) => (

                  <button
                    key={value}
                    onClick={() =>
                      setTab(value)
                    }
                    className={`
                      shrink-0
                      border-b-2
                      pb-3
                      text-sm
                      ${
                        tab === value
                          ? "border-black font-medium text-black"
                          : "border-transparent text-gray-500"
                      }
                    `}
                  >
                    {label}
                  </button>

                )
              )}

            </div>


            {/* SEARCH + SORT */}

            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >

              <div className="relative">

                <Search
                  size={17}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />


                <input
                  type="text"
                  placeholder="Search your listings..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="
                    h-11
                    w-full
                    rounded-lg
                    border
                    border-gray-200
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    sm:w-64
                  "
                />

              </div>


              <select
                value={sort}
                onChange={(e) =>
                  setSort(
                    e.target.value
                  )
                }
                className="
                  h-11
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  px-4
                  text-sm
                  outline-none
                "
              >

                <option
                  value="newest"
                >
                  Newest First
                </option>

                <option
                  value="price-high"
                >
                  Price: High to Low
                </option>

                <option
                  value="price-low"
                >
                  Price: Low to High
                </option>

              </select>

            </div>

          </div>


          {/* ============================================= */}
          {/* LOADING */}
          {/* ============================================= */}

          {loading && (

            <div
              className="
                py-20
                text-center
                text-gray-500
              "
            >
              Loading your listings...
            </div>

          )}


          {/* ============================================= */}
          {/* ERROR */}
          {/* ============================================= */}

          {!loading &&
            error && (

              <div
                className="
                  mt-6
                  rounded-xl
                  bg-red-50
                  p-5
                  text-sm
                  text-red-600
                "
              >
                {error}
              </div>

            )}


          {/* ============================================= */}
          {/* EMPTY */}
          {/* ============================================= */}

          {!loading &&
            !error &&
            filteredListings.length ===
              0 && (

              <div
                className="
                  py-20
                  text-center
                "
              >

                <Tag
                  size={36}
                  className="
                    mx-auto
                    text-gray-300
                  "
                />

                <h3
                  className="
                    mt-4
                    text-lg
                    font-medium
                  "
                >
                  No listings found
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-500
                  "
                >
                  Your auctions will
                  appear here.
                </p>


                <Link
                  to="/sell-item"
                  className="
                    mt-5
                    inline-flex
                    rounded-lg
                    bg-black
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  Sell an Item
                </Link>

              </div>

            )}


          {/* ============================================= */}
          {/* TABLE */}
          {/* ============================================= */}

          {!loading &&
            !error &&
            filteredListings.length >
              0 && (

              <div
                className="
                  mt-3
                  overflow-x-auto
                  rounded-xl
                  border
                  border-gray-100
                "
              >

                <table
                  className="
                    w-full
                    min-w-[950px]
                  "
                >

                  <thead
                    className="
                      bg-gray-50
                      text-left
                      text-sm
                      text-gray-600
                    "
                  >

                    <tr>

                      <th
                        className="
                          px-3
                          py-4
                          font-medium
                        "
                      >
                        Item
                      </th>

                      <th
                        className="
                          px-3
                          py-4
                          font-medium
                        "
                      >
                        Status
                      </th>

                      <th
                        className="
                          px-3
                          py-4
                          font-medium
                        "
                      >
                        Bids
                      </th>

                      <th
                        className="
                          px-3
                          py-4
                          font-medium
                        "
                      >
                        Current Price
                      </th>

                      <th
                        className="
                          px-3
                          py-4
                          font-medium
                        "
                      >
                        End Date
                      </th>

                      <th
                        className="
                          px-3
                          py-4
                          font-medium
                        "
                      >
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredListings.map(
                      (item) => (

                        <tr
                          key={
                            item.auctionid
                          }
                          className="
                            border-t
                            border-gray-100
                          "
                        >

                          {/* ITEM */}

                          <td
                            className="
                              px-3
                              py-3
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-4
                              "
                            >

                              {item.imageurl ? (

                                <img
                                  src={
                                    item.imageurl
                                  }
                                  alt={
                                    item.title
                                  }
                                  className="
                                    h-20
                                    w-28
                                    rounded-lg
                                    object-cover
                                  "
                                />

                              ) : (

                                <div
                                  className="
                                    flex
                                    h-20
                                    w-28
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-gray-100
                                    text-xs
                                    text-gray-400
                                  "
                                >
                                  No image
                                </div>

                              )}


                              <div>

                                <p
                                  className="
                                    font-medium
                                  "
                                >
                                  {item.title}
                                </p>


                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-gray-500
                                  "
                                >
                                  {
                                    item.categoryname
                                  }

                                  {" · "}

                                  {
                                    item.condition
                                  }
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* STATUS */}

                          <td
                            className="
                              px-3
                              py-3
                            "
                          >

                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2
                                text-sm
                                capitalize
                                ${
                                  statusStyles[
                                    item.status
                                  ] ||
                                  "bg-gray-100 text-gray-500"
                                }
                              `}
                            >

                              <span
                                className={`
                                  h-2
                                  w-2
                                  rounded-full
                                  ${
                                    item.status ===
                                    "live"
                                      ? "bg-green-500"
                                      : item.status ===
                                          "upcoming"
                                        ? "bg-blue-500"
                                        : item.status ===
                                            "cancelled"
                                          ? "bg-red-500"
                                          : "bg-gray-400"
                                  }
                                `}
                              />

                              {item.status ===
                              "live"
                                ? "Active"
                                : item.status ===
                                    "upcoming"
                                  ? "Scheduled"
                                  : item.status}

                            </span>

                          </td>


                          {/* BIDS */}

                          <td
                            className="
                              px-3
                              py-3
                              text-sm
                              text-gray-600
                            "
                          >
                            {
                              item.bidcount
                            }{" "}
                            bids
                          </td>


                          {/* PRICE */}

                          <td
                            className="
                              px-3
                              py-3
                              text-lg
                              font-semibold
                            "
                          >
                            $
                            {formatMoney(
                              item.currentprice
                            )}
                          </td>


                          {/* DATE */}

                          <td
                            className="
                              px-3
                              py-3
                            "
                          >

                            <p
                              className="
                                text-sm
                              "
                            >
                              {formatDate(
                                item.endtime
                              )}
                            </p>


                            <p
                              className="
                                mt-1
                                text-sm
                                text-gray-500
                              "
                            >
                              {formatTime(
                                item.endtime
                              )}
                            </p>

                          </td>


                          {/* ACTIONS */}

                          <td
                            className="
                              px-3
                              py-3
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >

                              <Link
                                to={`/auctions/${item.auctionid}`}
                                className="
                                  flex
                                  h-10
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-gray-200
                                  px-5
                                  text-sm
                                  font-medium
                                "
                              >
                                View
                              </Link>


                              <button
                                disabled={
                                  item.status ===
                                    "ended" ||
                                  item.status ===
                                    "cancelled" ||
                                  Number(
                                    item.bidcount
                                  ) > 0
                                }
                                className="
                                  h-10
                                  rounded-lg
                                  border
                                  border-gray-200
                                  px-5
                                  text-sm
                                  font-medium
                                  disabled:cursor-not-allowed
                                  disabled:bg-gray-100
                                  disabled:text-gray-400
                                "
                              >
                                Edit
                              </button>


                              <button
                                className="
                                  flex
                                  h-10
                                  w-10
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-gray-200
                                "
                              >
                                <MoreVertical
                                  size={17}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

      </div>

    </main>

  )

}

export default MyListings