import { useEffect, useState } from "react"
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom"

import {
  Search,
  SlidersHorizontal,
  Grid2X2,
  List,
  Clock3,
  Heart,
} from "lucide-react"

import api from "../api/axios"


const Explore = () => {

  const navigate = useNavigate()

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()


  // ====================================================
  // AUCTIONS
  // ====================================================

  const [
    auctions,
    setAuctions,
  ] = useState([])


  // ====================================================
  // CATEGORIES
  // ====================================================

  const [
    categories,
    setCategories,
  ] = useState([])


  // ====================================================
  // FILTERS
  // ====================================================

  const [
    search,
    setSearch,
  ] = useState("")


  const [
    category,
    setCategory,
  ] = useState(
    searchParams.get("categoryId") || ""
  )


  const [
    price,
    setPrice,
  ] = useState("")


  const [
    status,
    setStatus,
  ] = useState("")


  const [
    sort,
    setSort,
  ] = useState("")


  const [
    view,
    setView,
  ] = useState("grid")


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
  // PAGINATION
  // ====================================================

  const [
    page,
    setPage,
  ] = useState(1)


  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 12,
    totalAuctions: 0,
    totalPages: 0,
  })


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
  // COUNTDOWN STATE
  // ====================================================

  const [
    now,
    setNow,
  ] = useState(Date.now())


  // ====================================================
  // READ CATEGORY FROM URL
  // ====================================================

  useEffect(() => {

    const categoryId =
      searchParams.get(
        "categoryId"
      ) || ""


    setCategory(
      categoryId
    )


    setPage(1)

  }, [searchParams])


  // ====================================================
  // GET CATEGORIES
  // ====================================================

  useEffect(() => {

    const fetchCategories =
      async () => {

        try {

          const response =
            await api.get(
              "/categories"
            )


          const data =
            Array.isArray(
              response.data
            )
              ? response.data
              : response.data
                  ?.categories || []


          setCategories(
            data
          )


        } catch (error) {

          console.error(
            "Get categories error:",
            error
          )

        }

      }


    fetchCategories()

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


          const favorites =
            Array.isArray(
              response.data
            )
              ? response.data
              : response.data
                  ?.favorites || []


          const ids =
            favorites.map(
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
            error.response
              ?.status === 401
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
  // COUNTDOWN TIMER
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
  // GET AUCTIONS
  // ====================================================

  useEffect(() => {

    const fetchAuctions =
      async () => {

        try {

          setLoading(true)

          setError("")


          const params = {
            page,
            limit: 12,
          }


          // =========================
          // SEARCH
          // =========================

          if (
            search.trim()
          ) {

            params.search =
              search.trim()

          }


          // =========================
          // CATEGORY
          // =========================

          if (category) {

            params.categoryId =
              category

          }


          // =========================
          // STATUS
          // =========================

          if (status) {

            params.status =
              status

          }


          // =========================
          // SORT
          // =========================

          if (sort) {

            params.sort =
              sort

          }


          // =========================
          // PRICE
          // =========================

          if (
            price ===
            "under-1000"
          ) {

            params.maxPrice =
              1000

          } else if (
            price ===
            "1000-5000"
          ) {

            params.minPrice =
              1000

            params.maxPrice =
              5000

          } else if (
            price ===
            "5000-20000"
          ) {

            params.minPrice =
              5000

            params.maxPrice =
              20000

          } else if (
            price ===
            "20000-plus"
          ) {

            params.minPrice =
              20000

          }


          // =========================
          // REQUEST
          // =========================

          const response =
            await api.get(
              "/auctions",
              {
                params,
              }
            )


          setAuctions(
            response.data
              ?.auctions || []
          )


          setPagination(
            response.data
              ?.pagination || {
                page: 1,
                limit: 12,
                totalAuctions: 0,
                totalPages: 0,
              }
          )


        } catch (error) {

          console.error(
            "Get auctions error:",
            error
          )


          setError(
            error.response
              ?.data
              ?.error ||
            "Failed to load auctions."
          )


        } finally {

          setLoading(false)

        }

      }


    // Search debounce
    const timeout =
      setTimeout(
        fetchAuctions,
        300
      )


    return () => {

      clearTimeout(
        timeout
      )

    }

  }, [
    search,
    category,
    price,
    status,
    sort,
    page,
  ])


  // ====================================================
  // CHANGE CATEGORY
  // ====================================================

  const handleCategoryChange =
    (event) => {

      const value =
        event.target.value


      setCategory(
        value
      )


      setPage(1)


      const newParams =
        new URLSearchParams(
          searchParams
        )


      if (value) {

        newParams.set(
          "categoryId",
          value
        )

      } else {

        newParams.delete(
          "categoryId"
        )

      }


      setSearchParams(
        newParams
      )

    }


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
      // NOT LOGGED IN
      // =========================

      if (!token) {

        navigate(
          "/login"
        )

        return

      }


      const numericAuctionId =
        Number(
          auctionId
        )


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


      // =========================
      // START LOADING
      // =========================

      setFavoriteLoadingIds(
        (previous) => {

          const next =
            new Set(
              previous
            )


          next.add(
            numericAuctionId
          )


          return next

        }
      )


      try {

        // =========================
        // REMOVE
        // =========================

        if (isFavorite) {

          await api.delete(
            `/favorites/${numericAuctionId}`
          )


          setFavoriteIds(
            (previous) => {

              const next =
                new Set(
                  previous
                )


              next.delete(
                numericAuctionId
              )


              return next

            }
          )


        // =========================
        // ADD
        // =========================

        } else {

          await api.post(
            `/favorites/${numericAuctionId}`
          )


          setFavoriteIds(
            (previous) => {

              const next =
                new Set(
                  previous
                )


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
          error.response
            ?.status === 401
        ) {

          localStorage.removeItem(
            "token"
          )

          localStorage.removeItem(
            "user"
          )


          navigate(
            "/login"
          )

        }


      } finally {

        setFavoriteLoadingIds(
          (previous) => {

            const next =
              new Set(
                previous
              )


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
    (value) => {

      const number =
        Number(
          value
        )


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
      ).format(
        number
      )

    }


  // ====================================================
  // TIME LEFT
  // ====================================================

  const getTimeLeft = (
    endTime,
    auctionStatus
  ) => {

    if (
      auctionStatus ===
      "ended"
    ) {

      return "Ended"

    }


    if (
      auctionStatus ===
      "cancelled"
    ) {

      return "Cancelled"

    }


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
  // CHANGE PAGE
  // ====================================================

  const changePage =
    (newPage) => {

      if (
        newPage < 1 ||
        newPage >
          pagination.totalPages ||
        newPage === page
      ) {

        return

      }


      setPage(
        newPage
      )


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

    }


  return (

    <main className="pt-24">


      {/* =================================================
          HERO
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6">

        <div className="relative overflow-hidden rounded-2xl bg-gray-100">

          <img
            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />


          <div className="absolute inset-0 bg-white/55" />


          <div className="relative px-8 py-14 md:px-12">

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Discover extraordinary items
            </h1>


            <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">
              From rare collectibles to modern treasures,
              find something unique and place your bid.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          FILTERS
      ================================================= */}

      <section className="mx-auto mt-5 max-w-7xl px-6">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">


          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />


            <input
              type="text"
              placeholder="Search auctions..."
              value={search}
              onChange={(event) => {

                setSearch(
                  event.target.value
                )


                setPage(1)

              }}
              className="
                h-11
                w-full
                rounded-lg
                border
                border-gray-200
                bg-white
                pl-10
                pr-4
                text-sm
                outline-none
                transition
                focus:border-gray-400
              "
            />

          </div>


          {/* CATEGORY */}

          <select
            value={category}
            onChange={
              handleCategoryChange
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

            <option value="">
              Category
            </option>


            {categories.map(
              (item) => (

                <option
                  key={
                    item.categoryid
                  }
                  value={
                    item.categoryid
                  }
                >
                  {item.name}
                </option>

              )
            )}

          </select>


          {/* PRICE */}

          <select
            value={price}
            onChange={(event) => {

              setPrice(
                event.target.value
              )


              setPage(1)

            }}
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

            <option value="">
              Price
            </option>


            <option value="under-1000">
              Under $1,000
            </option>


            <option value="1000-5000">
              $1,000 - $5,000
            </option>


            <option value="5000-20000">
              $5,000 - $20,000
            </option>


            <option value="20000-plus">
              $20,000+
            </option>

          </select>


          {/* STATUS */}

          <select
            value={status}
            onChange={(event) => {

              setStatus(
                event.target.value
              )


              setPage(1)

            }}
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

            <option value="">
              Status
            </option>


            <option value="live">
              Live
            </option>


            <option value="upcoming">
              Upcoming
            </option>


            <option value="ended">
              Ended
            </option>


            <option value="cancelled">
              Cancelled
            </option>

          </select>


          {/* SORT */}

          <select
            value={sort}
            onChange={(event) => {

              setSort(
                event.target.value
              )


              setPage(1)

            }}
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

            <option value="">
              Sort by
            </option>


            <option value="price-low">
              Price: Low to High
            </option>


            <option value="price-high">
              Price: High to Low
            </option>

          </select>


          {/* FILTER BUTTON */}

          <button
            type="button"
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-lg
              px-4
              text-sm
              font-medium
              transition
              hover:bg-gray-100
            "
          >

            <SlidersHorizontal
              size={16}
            />

            Filters

          </button>

        </div>

      </section>


      {/* =================================================
          RESULTS HEADER
      ================================================= */}

      <section className="mx-auto mt-8 max-w-7xl px-6">

        <div className="flex items-center justify-between">

          <p className="text-sm text-gray-700">

            {loading
              ? "Loading auctions..."
              : `${pagination.totalAuctions} auctions found`
            }

          </p>


          <div className="flex items-center rounded-lg border border-gray-200 p-1">


            {/* GRID */}

            <button
              type="button"
              onClick={() =>
                setView(
                  "grid"
                )
              }
              className={`
                flex
                h-8
                items-center
                gap-1
                rounded-md
                px-3
                text-xs

                ${
                  view === "grid"
                    ? "bg-black text-white"
                    : "text-gray-500"
                }
              `}
            >

              <Grid2X2
                size={14}
              />

              Grid

            </button>


            {/* LIST */}

            <button
              type="button"
              onClick={() =>
                setView(
                  "list"
                )
              }
              className={`
                flex
                h-8
                items-center
                gap-1
                rounded-md
                px-3
                text-xs

                ${
                  view === "list"
                    ? "bg-black text-white"
                    : "text-gray-500"
                }
              `}
            >

              <List
                size={14}
              />

              List

            </button>

          </div>

        </div>

      </section>


      {/* =================================================
          AUCTIONS
      ================================================= */}

      <section className="mx-auto mt-5 max-w-7xl px-6">


        {/* LOADING */}

        {loading && (

          <div className="py-20 text-center text-sm text-gray-500">
            Loading auctions...
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
          auctions.length === 0 && (

            <div className="py-20 text-center">

              <p className="text-sm font-medium text-gray-700">
                No auctions found.
              </p>


              <p className="mt-2 text-xs text-gray-400">
                Try changing your search or filters.
              </p>

            </div>

          )}


        {/* AUCTION CARDS */}

        {!loading &&
          !error &&
          auctions.length > 0 && (

            <div
              className={
                view === "grid"
                  ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-4"
              }
            >

              {auctions.map(
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
                      key={
                        auctionId
                      }
                      to={`/auctions/${auctionId}`}
                      className={`
                        group
                        overflow-hidden
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        transition
                        hover:shadow-md

                        ${
                          view === "list"
                            ? "flex"
                            : ""
                        }
                      `}
                    >


                      {/* IMAGE */}

                      <div
                        className={`
                          relative
                          overflow-hidden
                          bg-gray-100

                          ${
                            view === "grid"
                              ? "h-44"
                              : "h-40 w-60 shrink-0"
                          }
                        `}
                      >

                        {auction.imageurl ? (

                          <img
                            src={
                              auction.imageurl
                            }
                            alt={
                              auction.title
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                              transition
                              duration-300
                              group-hover:scale-105
                            "
                          />

                        ) : (

                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>

                        )}


                        {/* STATUS */}

                        <span
                          className={`
                            absolute
                            left-3
                            top-3
                            rounded-full
                            px-2.5
                            py-1
                            text-[11px]
                            font-medium
                            capitalize

                            ${
                              auction.status ===
                              "live"

                                ? "bg-red-500 text-white"

                                : auction.status ===
                                  "upcoming"

                                  ? "bg-white text-black"

                                  : "bg-black/70 text-white"
                            }
                          `}
                        >

                          {
                            auction.status
                          }

                        </span>


                        {/* FAVORITE */}

                        <button
                          type="button"
                          disabled={
                            favoriteLoading
                          }
                          onClick={(
                            event
                          ) =>
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

                      </div>


                      {/* CONTENT */}

                      <div className="flex flex-1 flex-col p-4">

                        <p className="text-xs text-gray-400">
                          {
                            auction.categoryname
                          }
                        </p>


                        <h3 className="mt-1 text-sm font-semibold text-gray-900">
                          {
                            auction.title
                          }
                        </h3>


                        <p className="mt-4 text-xs text-gray-400">

                          {
                            auction.status ===
                            "upcoming"
                              ? "Starting price"
                              : "Current bid"
                          }

                        </p>


                        <p className="mt-1 text-base font-semibold">

                          {formatPrice(
                            auction.currentprice
                          )}

                        </p>


                        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-gray-500">

                          <span className="flex items-center gap-1">

                            <Clock3
                              size={13}
                            />


                            {
                              auction.status ===
                              "upcoming"

                                ? "Upcoming"

                                : getTimeLeft(
                                    auction.endtime,
                                    auction.status
                                  )
                            }

                          </span>


                          <span>
                            {
                              auction.bidcount
                            } bids
                          </span>

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
          PAGINATION
      ================================================= */}

      {!loading &&
        !error &&
        pagination.totalPages > 1 && (

          <section className="mx-auto max-w-7xl px-6">

            <div className="flex flex-wrap items-center justify-center gap-2 py-10">


              {/* PREVIOUS */}

              <button
                type="button"
                disabled={
                  page === 1
                }
                onClick={() =>
                  changePage(
                    page - 1
                  )
                }
                className="
                  flex
                  h-9
                  min-w-9
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-gray-200
                  px-3
                  text-sm
                  transition
                  hover:bg-gray-100
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                ‹
              </button>


              {/* PAGE NUMBERS */}

              {Array.from(
                {
                  length:
                    pagination.totalPages,
                },
                (
                  _,
                  index
                ) =>
                  index + 1
              ).map(
                (
                  pageNumber
                ) => (

                  <button
                    key={
                      pageNumber
                    }
                    type="button"
                    onClick={() =>
                      changePage(
                        pageNumber
                      )
                    }
                    className={`
                      flex
                      h-9
                      min-w-9
                      items-center
                      justify-center
                      rounded-md
                      px-3
                      text-sm
                      transition

                      ${
                        page ===
                        pageNumber

                          ? "bg-black text-white"

                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >

                    {
                      pageNumber
                    }

                  </button>

                )
              )}


              {/* NEXT */}

              <button
                type="button"
                disabled={
                  page ===
                  pagination.totalPages
                }
                onClick={() =>
                  changePage(
                    page + 1
                  )
                }
                className="
                  flex
                  h-9
                  min-w-9
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-gray-200
                  px-3
                  text-sm
                  transition
                  hover:bg-gray-100
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                ›
              </button>

            </div>

          </section>

        )}

    </main>

  )

}


export default Explore