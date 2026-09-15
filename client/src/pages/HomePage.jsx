import { useEffect, useState } from "react"
import {
  Link,
  useNavigate,
} from "react-router-dom"

import api from "../api/axios"

import {
  ArrowRight,
  ShieldCheck,
  WalletCards,
  Users,
  Eye,
  Heart,
} from "lucide-react"


// ======================================================
// CURATED COLLECTIONS
// ======================================================

const collections = [
  {
    title: "Rare Watches",
    subtitle: "Timeless investments",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Art & Antiques",
    subtitle: "History lives here",
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Collector Cars",
    subtitle: "Icons on auction",
    image:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Sneakers",
    subtitle: "Culture in every step",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
  },
]


const HomePage = () => {

  const navigate = useNavigate()


  // ====================================================
  // AUCTIONS
  // ====================================================

  const [
    liveAuctions,
    setLiveAuctions,
  ] = useState([])


  // ====================================================
  // FAVORITES
  // ====================================================

  const [
    favoriteIds,
    setFavoriteIds,
  ] = useState(new Set())


  const [
    favoriteLoadingIds,
    setFavoriteLoadingIds,
  ] = useState(new Set())


  // ====================================================
  // PAGE STATES
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
  // GET LIVE AUCTIONS
  // ====================================================

  useEffect(() => {

    const fetchLiveAuctions =
      async () => {

        try {

          setLoading(true)

          setError("")


          const response =
            await api.get(
              "/auctions",
              {
                params: {
                  status: "live",
                  page: 1,
                  limit: 4,
                },
              }
            )


          setLiveAuctions(
            response.data.auctions || []
          )


        } catch (error) {

          console.error(
            "Get live auctions error:",
            error
          )


          setError(
            error.response
              ?.data
              ?.error ||
            "Failed to load live auctions."
          )


        } finally {

          setLoading(false)

        }

      }


    fetchLiveAuctions()

  }, [])


  // ====================================================
  // GET FAVORITES
  // ====================================================

  useEffect(() => {

    const fetchFavorites =
      async () => {

        const token =
          localStorage.getItem(
            "token"
          )


        if (!token) {

          setFavoriteIds(
            new Set()
          )

          return

        }


        try {

          const response =
            await api.get(
              "/favorites"
            )


          const ids =
            response.data.map(
              (favorite) =>
                Number(
                  favorite.auctionid
                )
            )


          setFavoriteIds(
            new Set(ids)
          )


        } catch (error) {

          console.error(
            "Get favorites error:",
            error
          )


          if (
            error.response?.status ===
            401
          ) {

            localStorage.removeItem(
              "token"
            )

            localStorage.removeItem(
              "user"
            )


            setFavoriteIds(
              new Set()
            )

          }

        }

      }


    fetchFavorites()

  }, [])


  // ====================================================
  // UPDATE COUNTDOWN
  // ====================================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        setNow(
          Date.now()
        )

      }, 1000)


    return () => {

      clearInterval(
        interval
      )

    }

  }, [])


  // ====================================================
  // TOGGLE FAVORITE
  // ====================================================

  const toggleFavorite =
    async (
      event,
      auctionId
    ) => {

      event.preventDefault()

      event.stopPropagation()


      const token =
        localStorage.getItem(
          "token"
        )


      // =========================
      // USER NOT LOGGED IN
      // =========================

      if (!token) {

        navigate("/login")

        return

      }


      const numericAuctionId =
        Number(auctionId)


      // Already processing
      if (
        favoriteLoadingIds.has(
          numericAuctionId
        )
      ) {

        return

      }


      const isFavorite =
        favoriteIds.has(
          numericAuctionId
        )


      // Add loading state
      setFavoriteLoadingIds(
        (previous) => {

          const next =
            new Set(previous)

          next.add(
            numericAuctionId
          )

          return next

        }
      )


      try {

        // =========================
        // REMOVE FAVORITE
        // =========================

        if (isFavorite) {

          await api.delete(
            `/favorites/${numericAuctionId}`
          )


          setFavoriteIds(
            (previous) => {

              const next =
                new Set(previous)


              next.delete(
                numericAuctionId
              )


              return next

            }
          )


        // =========================
        // ADD FAVORITE
        // =========================

        } else {

          await api.post(
            `/favorites/${numericAuctionId}`
          )


          setFavoriteIds(
            (previous) => {

              const next =
                new Set(previous)


              next.add(
                numericAuctionId
              )


              return next

            }
          )

        }


      } catch (error) {

        console.error(
          "Favorite error:",
          error
        )


        if (
          error.response?.status ===
          401
        ) {

          localStorage.removeItem(
            "token"
          )

          localStorage.removeItem(
            "user"
          )


          navigate("/login")

        }

      } finally {

        setFavoriteLoadingIds(
          (previous) => {

            const next =
              new Set(previous)


            next.delete(
              numericAuctionId
            )


            return next

          }
        )

      }

    }


  // ====================================================
  // FORMAT PRICE
  // ====================================================

  const formatPrice =
    (price) => {

      const number =
        Number(price)


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
  // FORMAT TIME LEFT
  // ====================================================

  const getTimeLeft =
    (endTime) => {

      const end =
        new Date(
          endTime
        ).getTime()


      const difference =
        end - now


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
          (60 * 60 * 24)
        )


      const hours =
        Math.floor(
          (
            totalSeconds %
            (60 * 60 * 24)
          ) /
          (60 * 60)
        )


      const minutes =
        Math.floor(
          (
            totalSeconds %
            (60 * 60)
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
  // FEATURED AUCTION
  // ====================================================

  const featuredAuction =
    liveAuctions.length > 0
      ? liveAuctions[0]
      : null


  return (

    <main className="pt-24">


      {/* =================================================
          HERO
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6">

        <div className="relative overflow-hidden rounded-3xl bg-gray-100">

          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />


          <div className="relative grid min-h-[430px] grid-cols-1 gap-10 p-8 md:grid-cols-2 md:p-12 lg:p-16">


            {/* HERO LEFT */}

            <div className="flex flex-col justify-center">

              <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-black md:text-6xl">

                Bid on what

                <span className="block text-gray-600">
                  matters to you
                </span>

              </h1>


              <p className="mt-6 max-w-md text-sm leading-6 text-gray-600">

                Discover unique items, join live auctions, and compete
                for the things worth owning.

              </p>


              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  to="/auctions"
                  className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
                >

                  Explore auctions

                  <ArrowRight
                    size={16}
                  />

                </Link>


                <Link
                  to="/categories"
                  className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-black"
                >

                  Explore categories

                  <ArrowRight
                    size={16}
                  />

                </Link>

              </div>


              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">


                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={22}
                  />

                  <div>

                    <p className="text-sm font-medium">
                      Trusted community
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Buy and sell with confidence
                    </p>

                  </div>

                </div>


                <div className="flex items-start gap-3">

                  <WalletCards
                    size={22}
                  />

                  <div>

                    <p className="text-sm font-medium">
                      Secure payments
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Safe and hassle-free
                    </p>

                  </div>

                </div>


                <div className="flex items-start gap-3">

                  <Users
                    size={22}
                  />

                  <div>

                    <p className="text-sm font-medium">
                      Unique finds
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Rare collectibles and more
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                HERO AUCTION CARD
            ================================================= */}

            <div className="flex items-center justify-center">

              {loading ? (

                <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

                  <p className="text-center text-sm text-gray-500">
                    Loading live auction...
                  </p>

                </div>

              ) : featuredAuction ? (

                <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">


                  {/* IMAGE */}

                  <div className="relative overflow-hidden rounded-xl">

                    {featuredAuction.imageurl ? (

                      <img
                        src={
                          featuredAuction.imageurl
                        }
                        alt={
                          featuredAuction.title
                        }
                        className="h-56 w-full object-cover"
                      />

                    ) : (

                      <div className="flex h-56 w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                        No image
                      </div>

                    )}


                    <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
                      Live
                    </span>


                    {/* FAVORITE */}

                    <button
                      type="button"
                      disabled={
                        favoriteLoadingIds.has(
                          Number(
                            featuredAuction.auctionid
                          )
                        )
                      }
                      onClick={(event) =>
                        toggleFavorite(
                          event,
                          featuredAuction.auctionid
                        )
                      }
                      className={`
                        absolute
                        right-3
                        top-3
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-white/90
                        transition

                        ${
                          favoriteIds.has(
                            Number(
                              featuredAuction.auctionid
                            )
                          )
                            ? "text-red-500"
                            : "text-gray-600"
                        }

                        ${
                          favoriteLoadingIds.has(
                            Number(
                              featuredAuction.auctionid
                            )
                          )
                            ? "cursor-wait opacity-60"
                            : "hover:scale-105"
                        }
                      `}
                    >

                      <Heart
                        size={16}
                        fill={
                          favoriteIds.has(
                            Number(
                              featuredAuction.auctionid
                            )
                          )
                            ? "currentColor"
                            : "none"
                        }
                      />

                    </button>

                  </div>


                  {/* DETAILS */}

                  <div className="mt-4">

                    <h3 className="text-lg font-semibold">
                      {
                        featuredAuction.title
                      }
                    </h3>


                    <p className="mt-2 text-xs text-gray-500">
                      Current bid
                    </p>


                    <div className="mt-1 flex items-center justify-between">

                      <p className="text-2xl font-semibold">

                        {formatPrice(
                          featuredAuction.currentprice
                        )}

                      </p>


                      <div className="rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm">

                        {getTimeLeft(
                          featuredAuction.endtime
                        )}

                      </div>

                    </div>


                    <div className="mt-4 flex items-center justify-between">

                      <div className="flex items-center gap-4 text-xs text-gray-500">

                        <span className="flex items-center gap-1">

                          <Users
                            size={14}
                          />

                          {
                            featuredAuction.bidcount
                          } bids

                        </span>


                        <span className="flex items-center gap-1">

                          <Eye
                            size={14}
                          />

                          Live

                        </span>

                      </div>


                      <Link
                        to={`/auctions/${featuredAuction.auctionid}`}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                      >
                        Place a bid
                      </Link>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

                  <p className="text-center text-sm text-gray-500">
                    No live auctions right now.
                  </p>


                  <Link
                    to="/auctions"
                    className="mt-4 flex items-center justify-center gap-2 text-sm font-medium"
                  >

                    Explore auctions

                    <ArrowRight
                      size={16}
                    />

                  </Link>

                </div>

              )}

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          LIVE AUCTIONS
      ================================================= */}

      <section className="mx-auto mt-12 max-w-7xl px-6">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Live Auctions
          </h2>


          <Link
            to="/auctions"
            className="flex items-center gap-2 text-sm"
          >

            View all

            <ArrowRight
              size={16}
            />

          </Link>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="py-10 text-center text-sm text-gray-500">
            Loading live auctions...
          </div>

        )}


        {/* ERROR */}

        {!loading &&
          error && (

            <div className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>

          )}


        {/* NO AUCTIONS */}

        {!loading &&
          !error &&
          liveAuctions.length === 0 && (

            <div className="rounded-xl border border-gray-200 py-10 text-center">

              <p className="text-sm text-gray-500">
                There are no live auctions right now.
              </p>


              <Link
                to="/auctions"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium"
              >

                Explore all auctions

                <ArrowRight
                  size={16}
                />

              </Link>

            </div>

          )}


        {/* AUCTIONS */}

        {!loading &&
          !error &&
          liveAuctions.length > 0 && (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {liveAuctions.map(
                (auction) => {

                  const auctionId =
                    Number(
                      auction.auctionid
                    )


                  const isFavorite =
                    favoriteIds.has(
                      auctionId
                    )


                  const favoriteLoading =
                    favoriteLoadingIds.has(
                      auctionId
                    )


                  return (

                    <Link
                      key={auctionId}
                      to={`/auctions/${auctionId}`}
                      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
                    >


                      {/* IMAGE */}

                      <div className="relative">

                        {auction.imageurl ? (

                          <img
                            src={
                              auction.imageurl
                            }
                            alt={
                              auction.title
                            }
                            className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                          />

                        ) : (

                          <div className="flex h-44 w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>

                        )}


                        {/* LIVE */}

                        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                          Live
                        </span>


                        {/* FAVORITE */}

                        <button
                          type="button"
                          disabled={
                            favoriteLoading
                          }
                          onClick={(event) =>
                            toggleFavorite(
                              event,
                              auctionId
                            )
                          }
                          className={`
                            absolute
                            right-3
                            top-3
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-white/90
                            transition

                            ${
                              isFavorite
                                ? "text-red-500"
                                : "text-gray-600"
                            }

                            ${
                              favoriteLoading
                                ? "cursor-wait opacity-60"
                                : "hover:scale-105"
                            }
                          `}
                        >

                          <Heart
                            size={15}
                            fill={
                              isFavorite
                                ? "currentColor"
                                : "none"
                            }
                          />

                        </button>


                        {/* TIME */}

                        <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs">

                          {getTimeLeft(
                            auction.endtime
                          )}

                        </span>

                      </div>


                      {/* DETAILS */}

                      <div className="p-4">

                        <p className="text-xs text-gray-400">
                          {
                            auction.categoryname
                          }
                        </p>


                        <h3 className="mt-1 text-sm font-medium">
                          {
                            auction.title
                          }
                        </h3>


                        <p className="mt-3 text-xs text-gray-500">
                          Current bid
                        </p>


                        <p className="mt-1 text-lg font-semibold">

                          {formatPrice(
                            auction.currentprice
                          )}

                        </p>


                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">

                          <Users
                            size={14}
                          />

                          {
                            auction.bidcount
                          } bids

                        </div>

                      </div>

                    </Link>

                  )

                }
              )}

            </div>

          )}

      </section>


      {/* =================================================
          CURATED COLLECTIONS
      ================================================= */}

      <section className="mx-auto mt-12 max-w-7xl px-6">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Curated Collections
          </h2>


          <Link
            to="/categories"
            className="flex items-center gap-2 text-sm"
          >

            View all

            <ArrowRight
              size={16}
            />

          </Link>

        </div>


        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {collections.map(
            (collection) => (

              <div
                key={
                  collection.title
                }
                className="group relative h-64 overflow-hidden rounded-xl"
              >

                <img
                  src={
                    collection.image
                  }
                  alt={
                    collection.title
                  }
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />


                <div className="absolute inset-0 bg-black/45" />


                <div className="relative flex h-full flex-col justify-between p-5 text-white">

                  <div>

                    <h3 className="text-lg font-medium">
                      {
                        collection.title
                      }
                    </h3>


                    <p className="mt-1 text-xs text-white/70">
                      {
                        collection.subtitle
                      }
                    </p>

                  </div>


                  <div className="flex justify-end">

                    <Link
                      to="/categories"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black"
                    >

                      <ArrowRight
                        size={16}
                      />

                    </Link>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* =================================================
          BOTTOM BANNER
      ================================================= */}

      <section className="mx-auto my-12 max-w-7xl px-6">

        <div className="relative min-h-[220px] overflow-hidden rounded-2xl bg-black">

          <img
            src="https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=1200&q=80"
            alt=""
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-70"
          />


          <div className="relative flex min-h-[220px] items-center p-8 md:p-10">

            <div className="max-w-md text-white">

              <h2 className="text-3xl font-semibold">
                More than auctions.
              </h2>


              <p className="mt-3 text-sm text-gray-300">
                A community of passionate collectors.
              </p>


              <Link
                to="/auctions"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-black"
              >

                Explore auctions

                <ArrowRight
                  size={16}
                />

              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>

  )

}


export default HomePage