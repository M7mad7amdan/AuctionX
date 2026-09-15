import { useEffect, useState } from "react"
import {
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom"

import {
  Heart,
  Grid2X2,
  List,
  ChevronDown,
  Clock3,
} from "lucide-react"

import api from "../api/axios"


// ======================================================
// CATEGORY IMAGES
// ======================================================

const categoryImages = {

  Watches:
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1600&q=85",

  Cars:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",

  Art:
    "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1600&q=85",

  Jewelry:
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=85",

  Handbags:
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1600&q=85",

  Sneakers:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=85",

  Collectibles:
    "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1600&q=85",

  "Wine & Spirits":
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=85",

  Vintage:
    "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1600&q=85",

  "Home & Design":
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1600&q=85",

  Fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=85",

  Memorabilia:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1600&q=85",

}


const defaultCategoryImage =
  "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=1600&q=85"


const CategoryDetails = () => {

  // ====================================================
  // URL
  // ====================================================

  const [
    searchParams,
  ] = useSearchParams()

  const navigate =
    useNavigate()


  const categoryId =
    searchParams.get(
      "categoryId"
    )


  // ====================================================
  // STATES
  // ====================================================

  const [
    category,
    setCategory,
  ] = useState(null)


  const [
    auctions,
    setAuctions,
  ] = useState([])


  const [
    minPrice,
    setMinPrice,
  ] = useState("")


  const [
    maxPrice,
    setMaxPrice,
  ] = useState("")


  const [
    condition,
    setCondition,
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


  const [
    favoriteIds,
    setFavoriteIds,
  ] = useState(
    new Set()
  )


  const [
    favoriteLoadingIds,
    setFavoriteLoadingIds,
  ] = useState(
    new Set()
  )


  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState("")


  // ====================================================
  // GET CATEGORY
  // ====================================================

  useEffect(() => {

    const fetchCategory = async () => {

      try {

        const response =
          await api.get(
            "/categories"
          )


        const categories =
          Array.isArray(
            response.data
          )
            ? response.data
            : response.data?.categories || []


        const foundCategory =
          categories.find(
            (item) =>
              Number(
                item.categoryid
              ) ===
              Number(
                categoryId
              )
          )


        setCategory(
          foundCategory || null
        )


      } catch (error) {

        console.error(
          "Get category error:",
          error
        )

      }

    }


    if (categoryId) {
      fetchCategory()
    }

  }, [categoryId])


  // ====================================================
  // GET FAVORITES
  // ====================================================

  useEffect(() => {

    const fetchFavorites = async () => {

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
              : response.data?.favorites || []


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
  // GET AUCTIONS
  // ====================================================

  useEffect(() => {

    const fetchAuctions = async () => {

      if (!categoryId) {

        setLoading(false)

        setError(
          "Category not found."
        )

        return

      }


      try {

        setLoading(true)

        setError("")


        const params = {

          categoryId,

          page,

          limit: 12,

        }


        // ===============================================
        // PRICE
        // ===============================================

        if (
          minPrice !== ""
        ) {

          params.minPrice =
            minPrice

        }


        if (
          maxPrice !== ""
        ) {

          params.maxPrice =
            maxPrice

        }


        // ===============================================
        // STATUS
        // ===============================================

        if (status) {

          params.status =
            status

        }


        // ===============================================
        // SORT
        // ===============================================

        if (sort) {

          params.sort =
            sort

        }


        const response =
          await api.get(
            "/auctions",
            {
              params,
            }
          )


        let auctionData =
          response.data
            ?.auctions || []


        // ===============================================
        // CONDITION
        //
        // Your backend currently doesn't support a
        // condition query, so filter it here.
        // ===============================================

        if (condition) {

          auctionData =
            auctionData.filter(
              (auction) =>
                auction.condition ===
                condition
            )

        }


        setAuctions(
          auctionData
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
          "Get category auctions error:",
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
    categoryId,
    minPrice,
    maxPrice,
    status,
    sort,
    condition,
    page,
  ])


  // ====================================================
  // TOGGLE FAVORITE
  // ====================================================

  const toggleFavorite = async (
    event,
    auctionId
  ) => {

    event.preventDefault()

    event.stopPropagation()


    const token =
      localStorage.getItem(
        "token"
      )


    if (!token) {

      navigate(
        "/login"
      )

      return

    }


    const id =
      Number(
        auctionId
      )


    if (
      favoriteLoadingIds.has(
        id
      )
    ) {

      return

    }


    setFavoriteLoadingIds(
      (current) => {

        const next =
          new Set(current)

        next.add(id)

        return next

      }
    )


    try {

      const isFavorite =
        favoriteIds.has(id)


      if (isFavorite) {

        await api.delete(
          `/favorites/${id}`
        )


        setFavoriteIds(
          (current) => {

            const next =
              new Set(current)

            next.delete(id)

            return next

          }
        )


      } else {

        await api.post(
          `/favorites/${id}`
        )


        setFavoriteIds(
          (current) => {

            const next =
              new Set(current)

            next.add(id)

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
        (current) => {

          const next =
            new Set(current)

          next.delete(id)

          return next

        }
      )

    }

  }


  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  const clearAll = () => {

    setMinPrice("")

    setMaxPrice("")

    setCondition("")

    setStatus("")

    setSort("")

    setPage(1)

  }


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
        style:
          "currency",

        currency:
          "USD",

        maximumFractionDigits:
          0,
      }
    ).format(number)

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


    if (
      auctionStatus ===
      "upcoming"
    ) {

      return "Upcoming"

    }


    const end =
      new Date(
        endTime
      ).getTime()


    const difference =
      end -
      Date.now()


    if (
      difference <= 0
    ) {

      return "Ended"

    }


    const totalMinutes =
      Math.floor(
        difference /
        (1000 * 60)
      )


    const days =
      Math.floor(
        totalMinutes /
        (60 * 24)
      )


    const hours =
      Math.floor(
        (
          totalMinutes %
          (60 * 24)
        ) /
        60
      )


    const minutes =
      totalMinutes % 60


    if (
      days > 0
    ) {

      return `${days}d ${hours}h`

    }


    if (
      hours > 0
    ) {

      return `${hours}h ${minutes}m`

    }


    return `${minutes}m`

  }


  // ====================================================
  // CHANGE PAGE
  // ====================================================

  const changePage = (
    newPage
  ) => {

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
      behavior:
        "smooth",
    })

  }


  // ====================================================
  // CATEGORY VALUES
  // ====================================================

  const categoryName =
    category?.name ||
    "Category"


  const categoryImage =
    categoryImages[
      categoryName
    ] ||
    defaultCategoryImage


  const categoryAuctionCount =
    Number(
      category?.auctioncount
    ) || 0


  return (

    <main className="pt-24">

      <div className="mx-auto max-w-[1500px] px-6">


        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="flex items-center gap-3 py-5 text-sm text-gray-500">

          <Link to="/">
            Home
          </Link>


          <span>
            ›
          </span>


          <Link to="/categories">
            Categories
          </Link>


          <span>
            ›
          </span>


          <span className="text-black">
            {categoryName}
          </span>

        </div>


        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[250px_1fr]">


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside>


            {/* FILTER HEADER */}

            <div className="flex items-center justify-between border-b pb-4">

              <h2 className="text-2xl font-semibold">
                Filters
              </h2>


              <button
                type="button"
                onClick={
                  clearAll
                }
                className="text-sm text-gray-600"
              >
                Clear all
              </button>

            </div>


            {/* ===============================================
                STATUS
            =============================================== */}

            <div className="border-b py-5">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="font-semibold">
                  Status
                </h3>


                <ChevronDown
                  size={16}
                  className="rotate-180"
                />

              </div>


              <div className="space-y-3 text-sm">


                {[
                  [
                    "",
                    "All Auctions",
                  ],
                  [
                    "live",
                    "Live",
                  ],
                  [
                    "upcoming",
                    "Upcoming",
                  ],
                  [
                    "ended",
                    "Ended",
                  ],
                  [
                    "cancelled",
                    "Cancelled",
                  ],
                ].map(
                  ([
                    value,
                    label,
                  ]) => (

                    <label
                      key={
                        label
                      }
                      className="flex items-center gap-2"
                    >

                      <input
                        type="radio"
                        name="status"
                        checked={
                          status ===
                          value
                        }
                        onChange={() => {

                          setStatus(
                            value
                          )

                          setPage(1)

                        }}
                      />


                      {label}

                    </label>

                  )
                )}

              </div>

            </div>


            {/* ===============================================
                CONDITION
            =============================================== */}

            <div className="border-b py-5">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="font-semibold">
                  Condition
                </h3>


                <ChevronDown
                  size={16}
                  className="rotate-180"
                />

              </div>


              <div className="space-y-3 text-sm">


                {[
                  [
                    "",
                    "All Conditions",
                  ],
                  [
                    "new",
                    "New",
                  ],
                  [
                    "used",
                    "Used",
                  ],
                ].map(
                  ([
                    value,
                    label,
                  ]) => (

                    <label
                      key={
                        label
                      }
                      className="flex items-center gap-2"
                    >

                      <input
                        type="radio"
                        name="condition"
                        checked={
                          condition ===
                          value
                        }
                        onChange={() => {

                          setCondition(
                            value
                          )

                          setPage(1)

                        }}
                      />


                      {label}

                    </label>

                  )
                )}

              </div>

            </div>


            {/* ===============================================
                PRICE RANGE
            =============================================== */}

            <div className="border-b py-5">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="font-semibold">
                  Price Range
                </h3>


                <ChevronDown
                  size={16}
                  className="rotate-180"
                />

              </div>


              <div className="grid grid-cols-2 gap-3">


                {/* MIN */}

                <div className="flex h-10 items-center rounded-lg border px-3">

                  <span>
                    $
                  </span>


                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={
                      minPrice
                    }
                    onChange={(e) => {

                      setMinPrice(
                        e.target.value
                      )

                      setPage(1)

                    }}
                    className="w-full px-2 text-sm outline-none"
                  />

                </div>


                {/* MAX */}

                <div className="flex h-10 items-center rounded-lg border px-3">

                  <span>
                    $
                  </span>


                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={
                      maxPrice
                    }
                    onChange={(e) => {

                      setMaxPrice(
                        e.target.value
                      )

                      setPage(1)

                    }}
                    className="w-full px-2 text-sm outline-none"
                  />

                </div>

              </div>

            </div>

          </aside>


          {/* =================================================
              CONTENT
          ================================================= */}

          <div>


            {/* ===============================================
                HERO
            =============================================== */}

            <section
              className="
                relative
                min-h-[250px]
                overflow-hidden
                rounded-xl
                bg-black
              "
            >

              <img
                src={
                  categoryImage
                }
                alt={
                  categoryName
                }
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  opacity-70
                "
              />


              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />


              <div className="relative p-8 text-white md:p-12">

                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  AuctionX Collection
                </p>


                <h1 className="mt-3 text-5xl font-semibold">
                  {categoryName}
                </h1>


                <p className="mt-3 text-lg">
                  Discover unique items and compete in live auctions.
                </p>


                <div className="mt-7">

                  <p className="text-3xl font-semibold">
                    {categoryAuctionCount.toLocaleString()}
                  </p>


                  <p className="text-sm text-white/70">
                    Auctions
                  </p>

                </div>

              </div>

            </section>


            {/* ===============================================
                RESULTS HEADER
            =============================================== */}

            <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">


              <p className="text-lg">

                {loading
                  ? "Loading..."
                  : `${pagination.totalAuctions} results`
                }

              </p>


              <div className="flex items-center gap-3">


                <span className="text-sm text-gray-500">
                  Sort by
                </span>


                {/* SORT */}

                <select
                  value={
                    sort
                  }
                  onChange={(e) => {

                    setSort(
                      e.target.value
                    )

                    setPage(1)

                  }}
                  className="
                    h-10
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
                    Newest First
                  </option>


                  <option value="price-low">
                    Price: Low to High
                  </option>


                  <option value="price-high">
                    Price: High to Low
                  </option>

                </select>


                {/* VIEW */}

                <div className="flex overflow-hidden rounded-lg border border-gray-200">


                  <button
                    type="button"
                    onClick={() =>
                      setView(
                        "grid"
                      )
                    }
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center

                      ${
                        view ===
                        "grid"
                          ? "bg-gray-100 text-black"
                          : "text-gray-500"
                      }
                    `}
                  >

                    <Grid2X2
                      size={17}
                    />

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setView(
                        "list"
                      )
                    }
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center

                      ${
                        view ===
                        "list"
                          ? "bg-gray-100 text-black"
                          : "text-gray-500"
                      }
                    `}
                  >

                    <List
                      size={18}
                    />

                  </button>

                </div>

              </div>

            </div>


            {/* ===============================================
                LOADING
            =============================================== */}

            {loading && (

              <div className="py-24 text-center text-sm text-gray-500">
                Loading auctions...
              </div>

            )}


            {/* ===============================================
                ERROR
            =============================================== */}

            {!loading &&
              error && (

                <div className="mt-5 rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
                  {error}
                </div>

              )}


            {/* ===============================================
                EMPTY
            =============================================== */}

            {!loading &&
              !error &&
              auctions.length ===
                0 && (

                <div className="py-24 text-center">

                  <p className="text-sm font-medium text-gray-700">
                    No auctions found.
                  </p>


                  <p className="mt-2 text-xs text-gray-400">
                    Try changing your filters.
                  </p>

                </div>

              )}


            {/* ===============================================
                AUCTIONS
            =============================================== */}

            {!loading &&
              !error &&
              auctions.length >
                0 && (

                <div
                  className={
                    view ===
                    "grid"
                      ? "mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                      : "mt-5 flex flex-col gap-4"
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
                              view ===
                              "list"
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
                                view ===
                                "grid"
                                  ? "h-48"
                                  : "h-44 w-72 shrink-0"
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

                              {auction.status}

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
                                    : ""
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

                          <div className="flex flex-1 flex-col p-3">

                            <h3 className="font-medium">
                              {auction.title}
                            </h3>


                            <p className="mt-1 text-xs capitalize text-gray-500">

                              {auction.condition}

                              {" · "}

                              {auction.status}

                            </p>


                            <div className="mt-3 flex items-end justify-between">


                              <div>

                                <p className="text-xl font-semibold">

                                  {formatPrice(
                                    auction.currentprice
                                  )}

                                </p>


                                <p className="mt-1 text-xs text-gray-500">

                                  {auction.bidcount}{" "}

                                  {Number(
                                    auction.bidcount
                                  ) === 1
                                    ? "bid"
                                    : "bids"
                                  }

                                </p>

                              </div>


                              <p className="flex items-center gap-1 text-xs text-gray-700">

                                <Clock3
                                  size={13}
                                />


                                {getTimeLeft(
                                  auction.endtime,
                                  auction.status
                                )}

                              </p>

                            </div>

                          </div>

                        </Link>

                      )

                    }
                  )}

                </div>

              )}


            {/* ===============================================
                PAGINATION
            =============================================== */}

            {!loading &&
              !error &&
              pagination.totalPages >
                1 && (

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

                        {pageNumber}

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

              )}

          </div>

        </div>

      </div>

    </main>

  )

}


export default CategoryDetails