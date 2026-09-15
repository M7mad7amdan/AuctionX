import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Link,
  useNavigate,
} from "react-router-dom"

import {
  Bell,
  CirclePlus,
  Clock3,
  Gavel,
  Heart,
  Home,
  MoreVertical,
  Settings,
  Tag,
  Trophy,
  TrendingUp,
} from "lucide-react"

import api from "../api/axios"


const MyBids = () => {
  const navigate = useNavigate()

  const [bids, setBids] = useState([])

  const [tab, setTab] =
    useState("active")

  const [sort, setSort] =
    useState("newest")

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [now, setNow] =
    useState(Date.now())


  // ====================================================
  // LOAD MY BIDS
  // ====================================================

  useEffect(() => {
    const token =
      localStorage.getItem("token")

    if (!token) {
      navigate("/login")
      return
    }


    const fetchMyBids = async () => {
      try {
        setLoading(true)
        setError("")

        const response =
          await api.get("/bids/me")


        const data =
          Array.isArray(response.data)
            ? response.data
            : response.data?.bids || []


        setBids(data)

      } catch (error) {
        console.error(
          "Get my bids error:",
          error
        )


        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")

          navigate("/login")
          return
        }


        setError(
          error.response?.data?.error ||
          "Failed to load your bids."
        )

      } finally {
        setLoading(false)
      }
    }


    fetchMyBids()

  }, [navigate])


  // ====================================================
  // TIMER
  // ====================================================

  useEffect(() => {
    const interval =
      setInterval(() => {
        setNow(Date.now())
      }, 1000)


    return () => {
      clearInterval(interval)
    }
  }, [])


  // ====================================================
  // CURRENT USER
  // ====================================================

  const currentUserId =
    useMemo(() => {
      try {
        const storedUser =
          JSON.parse(
            localStorage.getItem("user")
          )

        return Number(
          storedUser?.userid ??
          storedUser?.userId ??
          storedUser?.UserID
        )

      } catch {
        return null
      }
    }, [])


  // ====================================================
  // GET BID UI STATUS
  // ====================================================

  const getBidStatus = (bid) => {
    const auctionStatus =
      bid.status

    const isHighestBidder =
      Boolean(bid.ishighestbidder)

    const winnerUserId =
      Number(bid.winneruserid)


    if (auctionStatus === "live") {
      if (isHighestBidder) {
        return "winning"
      }

      return "outbid"
    }


    if (auctionStatus === "ended") {
      if (
        currentUserId &&
        winnerUserId === currentUserId
      ) {
        return "won"
      }

      return "lost"
    }


    if (auctionStatus === "cancelled") {
      return "lost"
    }


    return auctionStatus
  }


  // ====================================================
  // NORMALIZED BIDS
  // ====================================================

  const normalizedBids =
    useMemo(() => {
      return bids.map((bid) => ({
        ...bid,

        uiStatus:
          getBidStatus(bid),
      }))
    }, [
      bids,
      currentUserId,
    ])


  // ====================================================
  // COUNTS
  // ====================================================

  const counts =
    useMemo(() => {
      return {
        active:
          normalizedBids.filter(
            (bid) =>
              bid.status === "live"
          ).length,

        winning:
          normalizedBids.filter(
            (bid) =>
              bid.uiStatus === "winning"
          ).length,

        outbid:
          normalizedBids.filter(
            (bid) =>
              bid.uiStatus === "outbid"
          ).length,

        won:
          normalizedBids.filter(
            (bid) =>
              bid.uiStatus === "won"
          ).length,

        lost:
          normalizedBids.filter(
            (bid) =>
              bid.uiStatus === "lost"
          ).length,
      }
    }, [normalizedBids])


  // ====================================================
  // FILTER + SORT
  // ====================================================

  const visibleBids =
    useMemo(() => {
      let result = []


      if (tab === "active") {
        result =
          normalizedBids.filter(
            (bid) =>
              bid.status === "live"
          )
      } else {
        result =
          normalizedBids.filter(
            (bid) =>
              bid.uiStatus === tab
          )
      }


      result = [...result]


      if (sort === "price-high") {
        result.sort(
          (a, b) =>
            Number(b.currentprice) -
            Number(a.currentprice)
        )
      }


      if (sort === "price-low") {
        result.sort(
          (a, b) =>
            Number(a.currentprice) -
            Number(b.currentprice)
        )
      }


      if (sort === "newest") {
        result.sort(
          (a, b) =>
            new Date(
              b.mylatestbidat ??
              b.createdat ??
              0
            ).getTime() -
            new Date(
              a.mylatestbidat ??
              a.createdat ??
              0
            ).getTime()
        )
      }


      return result

    }, [
      normalizedBids,
      tab,
      sort,
    ])


  // ====================================================
  // FORMAT PRICE
  // ====================================================

  const formatPrice = (value) => {
    const number =
      Number(value)

    if (
      !Number.isFinite(number)
    ) {
      return "$0"
    }


    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }
    ).format(number)
  }


  // ====================================================
  // TIME LEFT
  // ====================================================

  const getTimeLeft = (
    endTime,
    status
  ) => {
    if (status === "cancelled") {
      return "Cancelled"
    }


    if (status === "ended") {
      return "Ended"
    }


    if (!endTime) {
      return ""
    }


    const end =
      new Date(endTime).getTime()

    const difference =
      end - now


    if (difference <= 0) {
      return "Ended"
    }


    const totalSeconds =
      Math.floor(
        difference / 1000
      )

    const days =
      Math.floor(
        totalSeconds / 86400
      )

    const hours =
      Math.floor(
        (
          totalSeconds % 86400
        ) / 3600
      )

    const minutes =
      Math.floor(
        (
          totalSeconds % 3600
        ) / 60
      )

    const seconds =
      totalSeconds % 60


    if (days > 0) {
      return `${days}d ${hours}h`
    }


    const pad = (value) =>
      String(value).padStart(
        2,
        "0"
      )


    return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`
  }


  // ====================================================
  // DETAILS
  // ====================================================

  const getDetails = (bid) => {
    const parts = []


    if (bid.categoryname) {
      parts.push(
        bid.categoryname
      )
    }


    if (bid.condition) {
      const condition =
        bid.condition
          .charAt(0)
          .toUpperCase() +
        bid.condition.slice(1)

      parts.push(
        `${condition} Condition`
      )
    }


    return parts.join(" · ")
  }


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="pt-24">

        <div className="mx-auto max-w-[1500px] px-8 py-24 text-center">

          <Gavel
            size={36}
            className="mx-auto text-gray-300"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading your bids...
          </p>

        </div>

      </main>
    )
  }


  return (
    <main className="pt-24">

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 lg:grid-cols-[230px_1fr]">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="border-r border-gray-200 px-5 py-8">

          <nav className="space-y-2">

            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Home size={18} />
              Dashboard
            </Link>


            <Link
              to="/my-bids"
              className="flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium"
            >
              <Gavel size={18} />
              My Bids
            </Link>


            <Link
              to="/favorites"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Heart size={18} />
              Watchlist
            </Link>


            <Link
              to="/my-listings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Tag size={18} />
              My Listings
            </Link>


            <Link
              to="/sell"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <CirclePlus size={18} />
              Sell an Item
            </Link>

          </nav>


          <div className="my-6 border-t border-gray-200" />


          <nav className="space-y-2">

            <Link
              to="#"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Bell size={18} />
              Notifications
            </Link>


            <Link
              to="#"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings size={18} />
              Settings
            </Link>

          </nav>


          {/* PROMO */}

          <div className="mt-10 overflow-hidden rounded-xl bg-black text-white">

            <div className="p-5">

              <CirclePlus
                size={28}
              />

              <h3 className="mt-5 text-2xl font-semibold leading-tight">
                Turn your passion into opportunity
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-300">
                List your unique items and reach a global audience.
              </p>

              <Link
                to="/sell"
                className="mt-5 flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-medium text-black"
              >
                Sell an Item →
              </Link>

            </div>

          </div>

        </aside>


        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="px-8 py-8">


          {/* TITLE */}

          <div>

            <h1 className="text-5xl font-semibold tracking-tight">
              My Bids
            </h1>

            <p className="mt-2 text-gray-500">
              Track your bids and stay updated on the auctions you're participating in.
            </p>

          </div>


          {/* ERROR */}

          {error && (

            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm text-red-600">
                {error}
              </p>

            </div>

          )}


          {/* =================================================
              TABS + SORT
          ================================================= */}

          <div className="mt-8 flex flex-col justify-between gap-5 border-b border-gray-200 xl:flex-row xl:items-end">

            <div className="flex gap-9 overflow-x-auto">

              {[
                [
                  "active",
                  `Active Bids (${counts.active})`,
                ],

                [
                  "winning",
                  `Winning (${counts.winning})`,
                ],

                [
                  "outbid",
                  `Outbid (${counts.outbid})`,
                ],

                [
                  "won",
                  `Won (${counts.won})`,
                ],

                [
                  "lost",
                  `Lost (${counts.lost})`,
                ],
              ].map(
                ([value, label]) => (

                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setTab(value)
                    }
                    className={`
                      shrink-0
                      border-b-2
                      pb-4
                      text-sm
                      ${
                        tab === value
                          ? "border-black font-semibold text-black"
                          : "border-transparent text-gray-500"
                      }
                    `}
                  >
                    {label}
                  </button>

                )
              )}

            </div>


            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value
                )
              }
              className="mb-3 h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none"
            >

              <option value="newest">
                Newest First
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

            </select>

          </div>


          {/* =================================================
              BIDS
          ================================================= */}

          <div className="mt-4 space-y-3">

            {visibleBids.map(
              (bid) => {

                const status =
                  bid.uiStatus

                const auctionId =
                  bid.auctionid

                const currentBid =
                  Number(
                    bid.currentprice ??
                    bid.startprice ??
                    0
                  )

                const userBid =
                  Number(
                    bid.myhighestbid ??
                    0
                  )

                const details =
                  getDetails(bid)


                return (

                  <div
                    key={auctionId}
                    className={`
                      flex
                      flex-col
                      gap-5
                      rounded-xl
                      border
                      p-3
                      xl:flex-row
                      xl:items-center

                      ${
                        status === "winning"
                          ? "border-green-100 bg-green-50/40"

                          : status === "outbid"
                            ? "border-red-100 bg-red-50/40"

                            : "border-gray-200 bg-white"
                      }
                    `}
                  >


                    {/* PRODUCT */}

                    <div className="flex min-w-0 flex-1 items-center gap-5">

                      <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                        {bid.imageurl ? (

                          <img
                            src={bid.imageurl}
                            alt={bid.title}
                            className="h-full w-full object-cover"
                          />

                        ) : (

                          <div className="flex h-full w-full items-center justify-center">

                            <Gavel
                              size={24}
                              className="text-gray-300"
                            />

                          </div>

                        )}

                      </div>


                      <div className="min-w-0">

                        <Link
                          to={`/auctions/${auctionId}`}
                          className="text-lg font-semibold hover:underline"
                        >
                          {bid.title}
                        </Link>


                        {details && (

                          <p className="mt-2 text-sm text-gray-500">
                            {details}
                          </p>

                        )}

                      </div>

                    </div>


                    {/* STATUS */}

                    {(status === "winning" ||
                      status === "outbid" ||
                      status === "won" ||
                      status === "lost") && (

                      <div>

                        {status === "winning" && (

                          <span className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-700">

                            <Trophy
                              size={14}
                            />

                            You're winning

                          </span>

                        )}


                        {status === "outbid" && (

                          <span className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-600">

                            <TrendingUp
                              size={14}
                            />

                            You've been outbid

                          </span>

                        )}


                        {status === "won" && (

                          <span className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-700">

                            <Trophy
                              size={14}
                            />

                            Auction won

                          </span>

                        )}


                        {status === "lost" && (

                          <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
                            Auction ended
                          </span>

                        )}

                      </div>

                    )}


                    {/* CURRENT BID */}

                    <div className="min-w-[130px] border-l border-gray-200 pl-5">

                      <p className="text-xs text-gray-500">
                        Current bid
                      </p>

                      <p className="mt-2 text-xl font-semibold">
                        {formatPrice(
                          currentBid
                        )}
                      </p>

                    </div>


                    {/* YOUR BID */}

                    <div className="min-w-[130px] border-l border-gray-200 pl-5">

                      <p className="text-xs text-gray-500">
                        Your bid
                      </p>

                      <p className="mt-2 text-xl font-semibold">
                        {formatPrice(
                          userBid
                        )}
                      </p>

                    </div>


                    {/* TIME */}

                    <div className="min-w-[180px] border-l border-gray-200 pl-5">

                      <div className="flex items-center gap-2 text-sm">

                        <Clock3
                          size={17}
                        />

                        {bid.status === "live"
                          ? "Ends in"
                          : "Ended"}

                      </div>


                      <p className="mt-2 text-lg font-semibold">

                        {getTimeLeft(
                          bid.endtime,
                          bid.status
                        )}

                      </p>

                    </div>


                    {/* ACTION */}

                    <div className="flex items-center gap-3">

                      {status === "won" ? (

                        <Link
                          to={`/checkout/${auctionId}`}
                          className="flex h-11 items-center justify-center rounded-lg bg-black px-6 text-sm font-medium text-white"
                        >
                          Checkout
                        </Link>

                      ) : (

                        <Link
                          to={`/auctions/${auctionId}`}
                          className={`
                            flex
                            h-11
                            items-center
                            justify-center
                            rounded-lg
                            px-6
                            text-sm
                            font-medium

                            ${
                              status === "lost"
                                ? "border border-gray-200 bg-white text-black"
                                : "bg-black text-white"
                            }
                          `}
                        >

                          {status === "lost"
                            ? "View Results"
                            : status === "outbid"
                              ? "Bid Again"
                              : "View Auction"}

                        </Link>

                      )}


                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white"
                      >
                        <MoreVertical
                          size={18}
                        />
                      </button>

                    </div>

                  </div>

                )
              }
            )}


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {visibleBids.length === 0 && (

              <div className="py-20 text-center">

                <Gavel
                  size={38}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 font-semibold">
                  No bids here
                </h3>

                <p className="mt-2 text-sm text-gray-500">

                  {tab === "active"
                    ? "You don't have any active bids."
                    : tab === "winning"
                      ? "You're not currently leading any auctions."
                      : tab === "outbid"
                        ? "You haven't been outbid on any active auctions."
                        : tab === "won"
                          ? "You haven't won any auctions yet."
                          : "You don't have any lost auctions."}

                </p>


                <Link
                  to="/auctions"
                  className="mt-5 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
                >
                  Explore Auctions
                </Link>

              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  )
}


export default MyBids