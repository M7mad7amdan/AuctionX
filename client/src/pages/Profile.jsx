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
  CalendarDays,
  ChevronRight,
  CirclePlus,
  Clock3,
  Edit3,
  Gavel,
  Heart,
  Home,
  LogOut,
  Mail,
  Settings,
  Tag,
  Trophy,
  UserRound,
} from "lucide-react"

import api from "../api/axios"


const Profile = () => {

  // ====================================================
  // ROUTER
  // ====================================================

  const navigate =
    useNavigate()


  // ====================================================
  // USER
  // ====================================================

  const [user, setUser] =
    useState(null)


  // ====================================================
  // FAVORITES
  // ====================================================

  const [
    favorites,
    setFavorites,
  ] = useState([])


  // ====================================================
  // AUCTIONS
  // ====================================================

  const [
    auctions,
    setAuctions,
  ] = useState([])


  // ====================================================
  // MY BIDS
  // ====================================================

  const [
    myBids,
    setMyBids,
  ] = useState([])


  // ====================================================
  // PAGE STATE
  // ====================================================

  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState("")


  // ====================================================
  // TIMER
  // ====================================================

  const [
    now,
    setNow,
  ] = useState(Date.now())


  // ====================================================
  // GET USER FROM LOCAL STORAGE
  // ====================================================

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      )


    if (!token) {

      navigate("/login")

      return
    }


    try {

      const storedUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          )
        )


      if (!storedUser) {

        navigate("/login")

        return
      }


      setUser(storedUser)

    } catch (error) {

      console.error(
        "Parse user error:",
        error
      )


      localStorage.removeItem(
        "token"
      )

      localStorage.removeItem(
        "user"
      )


      navigate("/login")
    }

  }, [navigate])


  // ====================================================
  // GET DASHBOARD DATA
  // ====================================================

  useEffect(() => {

    if (!user) {
      return
    }


    const fetchDashboardData =
      async () => {

        try {

          setLoading(true)
          setError("")


          const [
            favoritesResponse,
            auctionsResponse,
            bidsResponse,
          ] = await Promise.all([

            api.get(
              "/favorites"
            ),

            api.get(
              "/auctions",
              {
                params: {
                  page: 1,
                  limit: 100,
                },
              }
            ),

            api.get(
              "/bids/me"
            ),

          ])


          // ==============================================
          // FAVORITES
          // ==============================================

          const favoriteData =
            Array.isArray(
              favoritesResponse.data
            )
              ? favoritesResponse.data
              : favoritesResponse.data
                  ?.favorites || []


          setFavorites(
            favoriteData
          )


          // ==============================================
          // AUCTIONS
          // ==============================================

          const auctionData =
            Array.isArray(
              auctionsResponse.data
            )
              ? auctionsResponse.data
              : auctionsResponse.data
                  ?.auctions || []


          setAuctions(
            auctionData
          )


          // ==============================================
          // MY BIDS
          // ==============================================

          const bidsData =
            Array.isArray(
              bidsResponse.data
            )
              ? bidsResponse.data
              : bidsResponse.data
                  ?.bids || []


          setMyBids(
            bidsData
          )


        } catch (error) {

          console.error(
            "Profile data error:",
            error
          )


          if (
            error.response?.status === 401
          ) {

            localStorage.removeItem(
              "token"
            )

            localStorage.removeItem(
              "user"
            )


            navigate("/login")

            return
          }


          setError(
            error.response
              ?.data
              ?.error ||
            "Failed to load dashboard."
          )


        } finally {

          setLoading(false)

        }

      }


    fetchDashboardData()

  }, [
    user,
    navigate,
  ])


  // ====================================================
  // TIMER
  // ====================================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        setNow(
          Date.now()
        )

      }, 1000)


    return () =>
      clearInterval(
        interval
      )

  }, [])


  // ====================================================
  // USER ID
  // ====================================================

  const userId =
    Number(
      user?.userid ??
      user?.userId ??
      user?.UserID
    )


  // ====================================================
  // MY LISTINGS
  // ====================================================

  const myListings =
    useMemo(() => {

      if (!userId) {
        return []
      }


      return auctions.filter(
        (auction) =>
          Number(
            auction.sellerid
          ) === userId
      )

    }, [
      auctions,
      userId,
    ])


  // ====================================================
  // ACTIVE LISTINGS
  // ====================================================

  const activeListings =
    useMemo(() => {

      return myListings.filter(
        (auction) =>
          auction.status ===
            "live" ||
          auction.status ===
            "upcoming"
      )

    }, [myListings])


  // ====================================================
  // ACTIVE BIDS
  // ====================================================

  const activeBids =
    useMemo(() => {

      return myBids.filter(
        (bid) =>
          bid.status === "live"
      )

    }, [myBids])


  // ====================================================
  // WON AUCTIONS
  // ====================================================

  const wonAuctions =
    useMemo(() => {

      return myBids.filter(
        (bid) =>
          bid.status === "ended" &&
          Number(
            bid.winneruserid
          ) === userId
      )

    }, [
      myBids,
      userId,
    ])


  // ====================================================
  // FORMAT PRICE
  // ====================================================

  const formatPrice = (
    value
  ) => {

    const number =
      Number(value)


    if (
      !Number.isFinite(
        number
      )
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

    if (
      status === "cancelled"
    ) {
      return "Cancelled"
    }


    if (
      status === "ended"
    ) {
      return "Ended"
    }


    if (
      status === "upcoming"
    ) {
      return "Upcoming"
    }


    if (!endTime) {
      return ""
    }


    const difference =
      new Date(
        endTime
      ).getTime() - now


    if (
      difference <= 0
    ) {
      return "Ended"
    }


    const totalSeconds =
      Math.floor(
        difference / 1000
      )


    const days =
      Math.floor(
        totalSeconds /
        86400
      )


    const hours =
      Math.floor(
        (
          totalSeconds %
          86400
        ) / 3600
      )


    const minutes =
      Math.floor(
        (
          totalSeconds %
          3600
        ) / 60
      )


    const seconds =
      totalSeconds % 60


    if (days > 0) {

      return `${days}d ${hours}h`

    }


    if (hours > 0) {

      return `${hours}h ${minutes}m`

    }


    if (minutes > 0) {

      return `${minutes}m ${seconds}s`

    }


    return `${seconds}s`
  }


  // ====================================================
  // JOIN DATE
  // ====================================================

  const formatJoinDate = (
    date
  ) => {

    if (!date) {
      return null
    }


    const parsedDate =
      new Date(date)


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return null
    }


    return parsedDate
      .toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      )

  }


  const joinedDate =
    formatJoinDate(
      user?.createdat ??
      user?.createdAt
    )


  // ====================================================
  // USER VALUES
  // ====================================================

  const userName =
    user?.name ||
    user?.Name ||
    "AuctionX User"


  const userEmail =
    user?.email ||
    user?.Email ||
    ""


  const userImage =
    user?.image ||
    user?.Image ||
    ""


  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    )

    localStorage.removeItem(
      "user"
    )


    navigate("/login")
  }


  // ====================================================
  // LOADING
  // ====================================================

  if (
    !user ||
    loading
  ) {

    return (

      <main className="pt-24">

        <div className="mx-auto max-w-[1500px] px-6 py-24 text-center">

          <p className="text-sm text-gray-500">
            Loading dashboard...
          </p>

        </div>

      </main>

    )

  }


  return (

    <main className="pt-24">

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 lg:grid-cols-[230px_1fr_300px]">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="border-r border-gray-200 px-5 py-8">

          <nav className="space-y-2">


            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium"
            >

              <Home size={18} />

              Dashboard

            </Link>


            <Link
              to="/my-bids"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
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


          {/* SELL CARD */}

          <div className="mt-10 overflow-hidden rounded-xl bg-black text-white">

            <div className="p-5">

              <CirclePlus
                size={28}
              />


              <h3 className="mt-5 text-2xl font-semibold leading-tight">
                Have something to sell?
              </h3>


              <p className="mt-3 text-sm leading-6 text-gray-300">
                Create an auction and let buyers compete for your item.
              </p>


              <Link
                to="/sell"
                className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-black"
              >

                Sell an Item

                <ChevronRight
                  size={16}
                />

              </Link>

            </div>

          </div>

        </aside>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section className="px-8 py-8">


          {/* PROFILE HEADER */}

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">


            <div className="flex items-center gap-5">

              {userImage ? (

                <img
                  src={userImage}
                  alt={userName}
                  className="h-24 w-24 rounded-full object-cover"
                />

              ) : (

                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">

                  <UserRound
                    size={34}
                    className="text-gray-500"
                  />

                </div>

              )}


              <div>

                <h1 className="text-3xl font-semibold">
                  {userName}
                </h1>


                {userEmail && (

                  <p className="mt-1 text-sm text-gray-500">
                    {userEmail}
                  </p>

                )}


                {joinedDate && (

                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">

                    <CalendarDays
                      size={15}
                    />

                    Member since {joinedDate}

                  </p>

                )}

              </div>

            </div>


            <button
              type="button"
              className="
                flex
                h-11
                items-center
                gap-2
                rounded-lg
                border
                border-gray-200
                px-4
                text-sm
                font-medium
              "
            >

              <Edit3
                size={16}
              />

              Edit Profile

            </button>

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
              STATS
          ================================================= */}

          <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">


            <div className="flex items-center gap-5 rounded-xl bg-gray-50 p-5">

              <Gavel size={27} />

              <div>

                <p className="text-2xl font-semibold">
                  {activeBids.length}
                </p>

                <p className="text-sm text-gray-600">
                  Active Bids
                </p>

              </div>

            </div>


            <div className="flex items-center gap-5 rounded-xl bg-gray-50 p-5">

              <Trophy size={27} />

              <div>

                <p className="text-2xl font-semibold">
                  {wonAuctions.length}
                </p>

                <p className="text-sm text-gray-600">
                  Won Auctions
                </p>

              </div>

            </div>


            <div className="flex items-center gap-5 rounded-xl bg-gray-50 p-5">

              <Tag size={27} />

              <div>

                <p className="text-2xl font-semibold">
                  {activeListings.length}
                </p>

                <p className="text-sm text-gray-600">
                  Active Listings
                </p>

              </div>

            </div>


            <div className="flex items-center gap-5 rounded-xl bg-gray-50 p-5">

              <Heart size={27} />

              <div>

                <p className="text-2xl font-semibold">
                  {favorites.length}
                </p>

                <p className="text-sm text-gray-600">
                  Saved Items
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              ACTIVE BIDS
          ================================================= */}

          <div className="mt-8 rounded-xl bg-gray-50 p-4">


            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-semibold">
                Active Bids
              </h2>


              <Link
                to="/my-bids"
                className="flex items-center gap-2 text-sm text-gray-600"
              >

                View All

                <ChevronRight
                  size={15}
                />

              </Link>

            </div>


            {activeBids.length === 0 ? (

              <div className="flex min-h-44 flex-col items-center justify-center py-8 text-center">

                <Gavel
                  size={28}
                  className="text-gray-400"
                />


                <p className="mt-3 text-sm font-medium">
                  No active bids
                </p>


                <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                  Auctions you bid on will appear here while they are active.
                </p>


                <Link
                  to="/auctions"
                  className="mt-4 flex items-center gap-2 text-sm font-medium"
                >

                  Explore auctions

                  <ChevronRight
                    size={15}
                  />

                </Link>

              </div>

            ) : (

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                {activeBids
                  .slice(0, 4)
                  .map(
                    (item) => (

                      <Link
                        key={
                          item.auctionid
                        }
                        to={`/auctions/${item.auctionid}`}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-sm"
                      >

                        <div className="relative h-44 bg-gray-100">

                          {item.imageurl ? (

                            <img
                              src={
                                item.imageurl
                              }
                              alt={
                                item.title
                              }
                              className="h-full w-full object-cover"
                            />

                          ) : (

                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              No image
                            </div>

                          )}


                          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">

                            <Clock3
                              size={12}
                            />

                            {getTimeLeft(
                              item.endtime,
                              item.status
                            )}

                          </span>


                          <span
                            className={`
                              absolute
                              right-3
                              top-3
                              rounded-full
                              px-2.5
                              py-1
                              text-[11px]
                              font-medium

                              ${
                                item.ishighestbidder
                                  ? "bg-green-600 text-white"
                                  : "bg-red-500 text-white"
                              }
                            `}
                          >

                            {item.ishighestbidder
                              ? "Highest bidder"
                              : "Outbid"
                            }

                          </span>

                        </div>


                        <div className="p-3">

                          <h3 className="truncate font-medium">
                            {item.title}
                          </h3>


                          <div className="mt-3 grid grid-cols-2 gap-3">

                            <div>

                              <p className="text-xs text-gray-500">
                                Current bid
                              </p>

                              <p className="mt-1 text-lg font-semibold">

                                {formatPrice(
                                  item.currentprice
                                )}

                              </p>

                            </div>


                            <div>

                              <p className="text-xs text-gray-500">
                                Your bid
                              </p>

                              <p className="mt-1 text-sm font-medium">

                                {formatPrice(
                                  item.myhighestbid
                                )}

                              </p>

                            </div>

                          </div>


                          <p className="mt-3 text-xs text-gray-500">

                            {item.bidcount}{" "}

                            {Number(
                              item.bidcount
                            ) === 1
                              ? "bid"
                              : "bids"
                            }

                          </p>

                        </div>

                      </Link>

                    )
                  )}

              </div>

            )}

          </div>


          {/* =================================================
              BOTTOM GRID
          ================================================= */}

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">


            {/* =================================================
                WATCHLIST
            ================================================= */}

            <div className="rounded-xl border border-gray-200 p-4">


              <div className="flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  Watchlist
                </h2>


                <Link
                  to="/favorites"
                  className="flex items-center gap-2 text-sm text-gray-500"
                >

                  View All

                  <ChevronRight
                    size={15}
                  />

                </Link>

              </div>


              {favorites.length === 0 ? (

                <div className="flex min-h-40 flex-col items-center justify-center text-center">

                  <Heart
                    size={25}
                    className="text-gray-400"
                  />


                  <p className="mt-3 text-sm font-medium">
                    Your watchlist is empty
                  </p>


                  <Link
                    to="/auctions"
                    className="mt-3 text-xs text-gray-500 hover:text-black"
                  >
                    Explore auctions
                  </Link>

                </div>

              ) : (

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">

                  {favorites
                    .slice(0, 4)
                    .map(
                      (item) => (

                        <Link
                          key={
                            item.auctionid
                          }
                          to={`/auctions/${item.auctionid}`}
                        >

                          <div className="relative overflow-hidden rounded-lg bg-gray-100">

                            {item.imageurl ? (

                              <img
                                src={
                                  item.imageurl
                                }
                                alt={
                                  item.title
                                }
                                className="h-32 w-full object-cover"
                              />

                            ) : (

                              <div className="flex h-32 items-center justify-center text-xs text-gray-400">
                                No image
                              </div>

                            )}


                            <Heart
                              size={18}
                              fill="currentColor"
                              className="absolute right-2 top-2 text-white"
                            />

                          </div>


                          <p className="mt-2 truncate text-sm font-medium">
                            {item.title}
                          </p>


                          <p className="mt-1 text-sm font-semibold">

                            {formatPrice(
                              item.currentprice ??
                              item.startprice
                            )}

                          </p>

                        </Link>

                      )
                    )}

                </div>

              )}

            </div>


            {/* =================================================
                MY LISTINGS
            ================================================= */}

            <div className="rounded-xl border border-gray-200 p-4">


              <div className="flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  My Listings
                </h2>


                <Link
                  to="/my-listings"
                  className="flex items-center gap-2 text-sm text-gray-500"
                >

                  View All

                  <ChevronRight
                    size={15}
                  />

                </Link>

              </div>


              {myListings.length === 0 ? (

                <div className="flex min-h-40 flex-col items-center justify-center text-center">

                  <Tag
                    size={25}
                    className="text-gray-400"
                  />


                  <p className="mt-3 text-sm font-medium">
                    No listings yet
                  </p>


                  <Link
                    to="/sell"
                    className="mt-3 flex items-center gap-1 text-xs text-gray-500 hover:text-black"
                  >

                    Create your first auction

                    <ChevronRight
                      size={13}
                    />

                  </Link>

                </div>

              ) : (

                <div className="mt-3">

                  {myListings
                    .slice(0, 4)
                    .map(
                      (item) => (

                        <Link
                          key={
                            item.auctionid
                          }
                          to={`/auctions/${item.auctionid}`}
                          className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-0"
                        >

                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">

                            {item.imageurl ? (

                              <img
                                src={
                                  item.imageurl
                                }
                                alt={
                                  item.title
                                }
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <div className="flex h-full w-full items-center justify-center">

                                <Tag
                                  size={16}
                                  className="text-gray-400"
                                />

                              </div>

                            )}

                          </div>


                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-medium">
                              {item.title}
                            </p>


                            <p className="mt-1 text-xs capitalize text-gray-500">
                              {item.status}
                            </p>

                          </div>


                          <p className="text-sm font-medium">

                            {formatPrice(
                              item.currentprice
                            )}

                          </p>


                          <ChevronRight
                            size={15}
                            className="text-gray-400"
                          />

                        </Link>

                      )
                    )}

                </div>

              )}

            </div>

          </div>

        </section>


        {/* =================================================
            RIGHT PANEL
        ================================================= */}

        <aside className="px-4 py-8">


          {/* ACCOUNT CARD */}

          <div className="overflow-hidden rounded-xl bg-black p-5 text-white">

            <UserRound
              size={30}
            />


            <h3 className="mt-6 text-2xl">
              {userName}
            </h3>


            <p className="mt-3 text-sm leading-6 text-gray-300">
              Manage your auctions, bids and saved items from your AuctionX dashboard.
            </p>


            <div className="mt-5 h-px w-10 bg-white/70" />

          </div>


          {/* =================================================
              PROFILE INFO
          ================================================= */}

          <div className="mt-4 rounded-xl border border-gray-200 p-5">

            <h3 className="text-xl font-semibold">
              Profile Information
            </h3>


            <div className="mt-5 space-y-4 text-sm">


              <div className="flex items-center gap-3">

                <UserRound
                  size={17}
                />

                <span className="break-all">
                  {userName}
                </span>

              </div>


              {userEmail && (

                <div className="flex items-start gap-3">

                  <Mail
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span className="break-all">
                    {userEmail}
                  </span>

                </div>

              )}


              {joinedDate && (

                <div className="flex items-center gap-3">

                  <CalendarDays
                    size={17}
                  />

                  Joined {joinedDate}

                </div>

              )}

            </div>

          </div>


          {/* =================================================
              ACCOUNT OVERVIEW
          ================================================= */}

          <div className="mt-4 rounded-xl border border-gray-200 p-5">

            <h3 className="text-xl font-semibold">
              Account Overview
            </h3>


            <div className="mt-5 space-y-4 text-sm">


              <div className="flex items-center justify-between">

                <span className="flex items-center gap-3">

                  <Gavel
                    size={17}
                  />

                  Active Bids

                </span>


                <span className="font-medium">
                  {activeBids.length}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="flex items-center gap-3">

                  <Heart
                    size={17}
                  />

                  Saved Items

                </span>


                <span className="font-medium">
                  {favorites.length}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="flex items-center gap-3">

                  <Tag
                    size={17}
                  />

                  Listings

                </span>


                <span className="font-medium">
                  {myListings.length}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="flex items-center gap-3">

                  <Trophy
                    size={17}
                  />

                  Won

                </span>


                <span className="font-medium">
                  {wonAuctions.length}
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <div className="mt-4 rounded-xl border border-gray-200 p-5">

            <h3 className="text-xl font-semibold">
              Quick Actions
            </h3>


            <div className="mt-4">


              <Link
                to="/my-bids"
                className="flex w-full items-center justify-between border-b py-3 text-sm"
              >

                <span className="flex items-center gap-3">

                  <Gavel
                    size={17}
                  />

                  My Bids

                </span>


                <ChevronRight
                  size={15}
                />

              </Link>


              <Link
                to="/sell"
                className="flex w-full items-center justify-between border-b py-3 text-sm"
              >

                <span className="flex items-center gap-3">

                  <CirclePlus
                    size={17}
                  />

                  Sell an Item

                </span>


                <ChevronRight
                  size={15}
                />

              </Link>


              <Link
                to="/favorites"
                className="flex w-full items-center justify-between border-b py-3 text-sm"
              >

                <span className="flex items-center gap-3">

                  <Heart
                    size={17}
                  />

                  Watchlist

                </span>


                <ChevronRight
                  size={15}
                />

              </Link>


              <Link
                to="/my-listings"
                className="flex w-full items-center justify-between py-3 text-sm"
              >

                <span className="flex items-center gap-3">

                  <Tag
                    size={17}
                  />

                  My Listings

                </span>


                <ChevronRight
                  size={15}
                />

              </Link>

            </div>

          </div>


          {/* =================================================
              LOGOUT
          ================================================= */}

          <div className="mt-4 rounded-xl border border-gray-200 p-5">

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="flex w-full items-center gap-3 text-sm text-red-600"
            >

              <LogOut
                size={17}
              />

              Log Out

            </button>

          </div>

        </aside>

      </div>

    </main>

  )

}


export default Profile