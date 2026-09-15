import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom"

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Expand,
  Heart,
  LockKeyhole,
  Package,
  ShieldCheck,
  UserRound,
  Clock3,
} from "lucide-react"

import api from "../api/axios"
import BidModal from "../components/BidModal"


const tabs = [
  "Description",
  "Details",
  "Seller",
  "Bid History",
  "Shipping & Payment",
]


const AuctionDetails = () => {

  // ====================================================
  // ROUTER
  // ====================================================

  const { id } = useParams()

  const navigate = useNavigate()


  // ====================================================
  // AUCTION
  // ====================================================

  const [
    auction,
    setAuction,
  ] = useState(null)


  const [
    relatedAuctions,
    setRelatedAuctions,
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
  // GALLERY
  // ====================================================

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(0)


  // ====================================================
  // TABS
  // ====================================================

  const [
    activeTab,
    setActiveTab,
  ] = useState("Description")


  // ====================================================
  // BID
  // ====================================================

  const [
    showBidModal,
    setShowBidModal,
  ] = useState(false)


  const [
    bidAmount,
    setBidAmount,
  ] = useState("")


  // ====================================================
  // FAVORITE
  // ====================================================

  const [
    isFavorite,
    setIsFavorite,
  ] = useState(false)


  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false)


  // ====================================================
  // COUNTDOWN
  // ====================================================

  const [
    now,
    setNow,
  ] = useState(Date.now())


  // ====================================================
  // GET AUCTION
  // ====================================================

  useEffect(() => {

    const fetchAuction = async () => {

      try {

        setLoading(true)
        setError("")


        const response =
          await api.get(
            `/auctions/${id}`
          )


        setAuction(
          response.data
        )


        setSelectedImage(0)


      } catch (error) {

        console.error(
          "Get auction error:",
          error
        )


        if (
          error.response?.status === 404
        ) {

          setError(
            "Auction not found."
          )

        } else {

          setError(
            error.response
              ?.data
              ?.error ||
            "Failed to load auction."
          )

        }


      } finally {

        setLoading(false)

      }

    }


    if (id) {
      fetchAuction()
    }

  }, [id])


  // ====================================================
  // GET RELATED AUCTIONS
  // ====================================================

  useEffect(() => {

    const fetchRelatedAuctions =
      async () => {

        if (
          !auction?.categoryid
        ) {
          return
        }


        try {

          const response =
            await api.get(
              "/auctions",
              {
                params: {

                  categoryId:
                    auction.categoryid,

                  page: 1,

                  limit: 5,

                },
              }
            )


          const data =
            response.data
              ?.auctions || []


          const filtered =
            data
              .filter(
                (item) =>
                  Number(
                    item.auctionid
                  ) !==
                  Number(id)
              )
              .slice(0, 4)


          setRelatedAuctions(
            filtered
          )


        } catch (error) {

          console.error(
            "Get related auctions error:",
            error
          )

        }

      }


    fetchRelatedAuctions()

  }, [
    auction?.categoryid,
    id,
  ])


  // ====================================================
  // GET FAVORITE STATUS
  // ====================================================

  useEffect(() => {

    const fetchFavoriteStatus =
      async () => {

        const token =
          localStorage.getItem(
            "token"
          )


        if (!token) {

          setIsFavorite(false)

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


          const found =
            favorites.some(
              (favorite) =>
                Number(
                  favorite.auctionid
                ) ===
                Number(id)
            )


          setIsFavorite(found)


        } catch (error) {

          console.error(
            "Get favorites error:",
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

            setIsFavorite(false)

          }

        }

      }


    if (id) {
      fetchFavoriteStatus()
    }

  }, [id])


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
  // PRODUCT IMAGES
  // ====================================================

  const productImages =
    useMemo(() => {

      if (!auction?.images) {
        return []
      }


      return auction.images
        .map(
          (image) =>
            image.imageurl
        )
        .filter(Boolean)

    }, [auction])


  // ====================================================
  // CURRENT BID
  // ====================================================

  const currentBid =
    Number(
      auction?.currentprice
    ) || 0


  // ====================================================
  // BID INFORMATION
  // ====================================================

  const minIncrease =
    Number(
      auction?.minincrease
    ) || 0


  const bidCount =
    Number(
      auction?.bidcount
    ) || 0


  const minNextBid =
    bidCount === 0
      ? Number(
          auction?.startprice
        ) || 0
      : currentBid +
        minIncrease


  // ====================================================
  // KEEP BID INPUT VALID
  // ====================================================

  useEffect(() => {

    if (!auction) {
      return
    }


    setBidAmount(
      String(minNextBid)
    )

  }, [
    minNextBid,
    auction?.auctionid,
  ])


  // ====================================================
  // BID PLACED SUCCESSFULLY
  // ====================================================

  const handleBidPlaced = (
    data
  ) => {

    const newBid =
      data?.bid


    if (!newBid) {
      return
    }


    let currentUser = null


    try {

      currentUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          )
        )

    } catch {
      currentUser = null
    }


    setAuction(
      (current) => {

        if (!current) {
          return current
        }


        const currentHistory =
          Array.isArray(
            current.recentBids
          )
            ? current.recentBids
            : []


        const formattedBid = {

          ...newBid,

          bidid:
            newBid.bidid ??
            newBid.BidID,

          auctionid:
            newBid.auctionid ??
            newBid.AuctionID,

          userid:
            newBid.userid ??
            newBid.UserID,

          amount:
            newBid.amount ??
            newBid.Amount,

          createdat:
            newBid.createdat ??
            newBid.CreatedAt,

          biddername:
            currentUser?.name ||
            currentUser?.Name ||
            "You",

        }


        return {

          ...current,

          currentprice:
            Number(
              data.currentPrice ??
              formattedBid.amount
            ),

          bidcount:
            Number(
              current.bidcount || 0
            ) + 1,

          recentBids: [
            formattedBid,
            ...currentHistory,
          ].slice(0, 10),

        }

      }
    )

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
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }
    ).format(number)

  }


  // ====================================================
  // COUNTDOWN
  // ====================================================

  const getCountdown = (
    endTime
  ) => {

    if (!endTime) {

      return {
        hours: "00",
        minutes: "00",
        seconds: "00",
        text: "00 : 00 : 00",
      }

    }


    const end =
      new Date(
        endTime
      ).getTime()


    const difference =
      Math.max(
        0,
        end - now
      )


    const totalSeconds =
      Math.floor(
        difference / 1000
      )


    const totalHours =
      Math.floor(
        totalSeconds / 3600
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


    const hoursText =
      String(
        totalHours
      ).padStart(
        2,
        "0"
      )


    const minutesText =
      String(
        minutes
      ).padStart(
        2,
        "0"
      )


    const secondsText =
      String(
        seconds
      ).padStart(
        2,
        "0"
      )


    return {

      hours:
        hoursText,

      minutes:
        minutesText,

      seconds:
        secondsText,

      text:
        `${hoursText} : ${minutesText} : ${secondsText}`,

    }

  }


  const countdown =
    getCountdown(
      auction?.endtime
    )


  // ====================================================
  // RELATED TIME
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


    const difference =
      new Date(
        endTime
      ).getTime() - now


    if (
      difference <= 0
    ) {
      return "Ended"
    }


    const totalMinutes =
      Math.floor(
        difference / 60000
      )


    const days =
      Math.floor(
        totalMinutes / 1440
      )


    const hours =
      Math.floor(
        (
          totalMinutes %
          1440
        ) / 60
      )


    const minutes =
      totalMinutes % 60


    if (days > 0) {

      return `${days}d ${hours}h left`

    }


    if (hours > 0) {

      return `${hours}h ${minutes}m left`

    }


    return `${minutes}m left`

  }


  // ====================================================
  // PREVIOUS IMAGE
  // ====================================================

  const previousImage = () => {

    if (
      productImages.length === 0
    ) {
      return
    }


    setSelectedImage(
      (current) =>
        current === 0
          ? productImages.length - 1
          : current - 1
    )

  }


  // ====================================================
  // NEXT IMAGE
  // ====================================================

  const nextImage = () => {

    if (
      productImages.length === 0
    ) {
      return
    }


    setSelectedImage(
      (current) =>
        current ===
        productImages.length - 1
          ? 0
          : current + 1
    )

  }


  // ====================================================
  // FAVORITE
  // ====================================================

  const toggleFavorite =
    async () => {

      const token =
        localStorage.getItem(
          "token"
        )


      if (!token) {

        navigate("/login")

        return

      }


      if (
        favoriteLoading
      ) {
        return
      }


      try {

        setFavoriteLoading(true)


        if (isFavorite) {

          await api.delete(
            `/favorites/${id}`
          )


          setIsFavorite(false)


        } else {

          await api.post(
            `/favorites/${id}`
          )


          setIsFavorite(true)

        }


      } catch (error) {

        console.error(
          "Favorite error:",
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

        }


      } finally {

        setFavoriteLoading(false)

      }

    }


  // ====================================================
  // OPEN BID MODAL
  // ====================================================

  const openBidModal = () => {

    const token =
      localStorage.getItem(
        "token"
      )


    if (!token) {

      navigate("/login")

      return

    }


    setShowBidModal(true)

  }


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {

    return (

      <main className="pt-24">

        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <p className="text-sm text-gray-500">
            Loading auction...
          </p>

        </div>

      </main>

    )

  }


  // ====================================================
  // ERROR
  // ====================================================

  if (
    error ||
    !auction
  ) {

    return (

      <main className="pt-24">

        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <h1 className="text-2xl font-semibold">
            Auction unavailable
          </h1>


          <p className="mt-3 text-sm text-gray-500">

            {error ||
              "Auction not found."}

          </p>


          <Link
            to="/auctions"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium"
          >

            Explore auctions

            <ArrowRight
              size={15}
            />

          </Link>

        </div>

      </main>

    )

  }


  const canBid =
    auction.status === "live"


  return (

    <main className="pt-24">

      <div className="mx-auto max-w-7xl px-6">


        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">

          <Link
            to="/"
            className="hover:text-black"
          >
            Home
          </Link>


          <ChevronRight
            size={14}
          />


          <Link
            to="/auctions"
            className="hover:text-black"
          >
            Explore Auctions
          </Link>


          <ChevronRight
            size={14}
          />


          <Link
            to={`/auctions?categoryId=${auction.categoryid}`}
            className="hover:text-black"
          >
            {auction.categoryname}
          </Link>


          <ChevronRight
            size={14}
          />


          <span className="text-black">
            {auction.title}
          </span>

        </div>


        {/* =================================================
            TOP AREA
        ================================================= */}

        <section className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.9fr]">


          {/* =================================================
              LEFT - GALLERY
          ================================================= */}

          <div>

            <div className="relative overflow-hidden rounded-xl bg-gray-100">

              {productImages.length > 0 ? (

                <img
                  src={
                    productImages[
                      selectedImage
                    ]
                  }
                  alt={
                    auction.title
                  }
                  className="h-[600px] w-full object-cover"
                />

              ) : (

                <div className="flex h-[600px] w-full items-center justify-center text-sm text-gray-400">
                  No image available
                </div>

              )}


              {/* PREVIOUS */}

              {productImages.length > 1 && (

                <button
                  type="button"
                  onClick={
                    previousImage
                  }
                  className="
                    absolute
                    left-5
                    top-1/2
                    flex
                    h-11
                    w-11
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-black/40
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-black/60
                  "
                >

                  <ChevronLeft
                    size={21}
                  />

                </button>

              )}


              {/* NEXT */}

              {productImages.length > 1 && (

                <button
                  type="button"
                  onClick={
                    nextImage
                  }
                  className="
                    absolute
                    right-5
                    top-1/2
                    flex
                    h-11
                    w-11
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-black/40
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-black/60
                  "
                >

                  <ChevronRight
                    size={21}
                  />

                </button>

              )}


              {/* EXPAND */}

              {productImages.length > 0 && (

                <a
                  href={
                    productImages[
                      selectedImage
                    ]
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    absolute
                    right-5
                    top-5
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-white/80
                    text-black
                    backdrop-blur
                  "
                >

                  <Expand
                    size={18}
                  />

                </a>

              )}

            </div>


            {/* THUMBNAILS */}

            {productImages.length > 1 && (

              <div className="mt-3 grid grid-cols-5 gap-3">

                {productImages.map(
                  (
                    image,
                    index
                  ) => (

                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() =>
                        setSelectedImage(
                          index
                        )
                      }
                      className={`
                        overflow-hidden
                        rounded-lg
                        border-2

                        ${
                          selectedImage === index
                            ? "border-black"
                            : "border-transparent"
                        }
                      `}
                    >

                      <img
                        src={image}
                        alt=""
                        className="h-24 w-full object-cover"
                      />

                    </button>

                  )
                )}

              </div>

            )}

          </div>


          {/* =================================================
              RIGHT - INFORMATION
          ================================================= */}

          <div>

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {auction.categoryname}
            </p>


            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              {auction.title}
            </h1>


            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">

              <span className="capitalize">
                {auction.condition}
              </span>

              <span>•</span>

              <span className="capitalize">
                {auction.status}
              </span>

              <span>•</span>

              <span>
                Sold by {auction.sellername}
              </span>

            </div>


            {/* FAVORITE */}

            <div className="mt-5 flex justify-end">

              <button
                type="button"
                disabled={
                  favoriteLoading
                }
                onClick={
                  toggleFavorite
                }
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-gray-300
                  px-5
                  py-3
                  text-sm
                  font-medium
                  transition
                  hover:bg-gray-50

                  ${
                    isFavorite
                      ? "text-red-500"
                      : ""
                  }

                  ${
                    favoriteLoading
                      ? "cursor-wait opacity-60"
                      : ""
                  }
                `}
              >

                <Heart
                  size={18}
                  fill={
                    isFavorite
                      ? "currentColor"
                      : "none"
                  }
                />

                {isFavorite
                  ? "Saved"
                  : "Save"
                }

              </button>

            </div>


            {/* =================================================
                BID BOX
            ================================================= */}

            <div className="mt-7 rounded-xl bg-[#f7f5f2] p-7">

              <div className="grid grid-cols-2 gap-8">

                <div>

                  <p className="text-sm text-gray-600">

                    {bidCount === 0
                      ? "Starting price"
                      : "Current bid"
                    }

                  </p>


                  <p className="mt-2 text-5xl font-medium">

                    {formatPrice(
                      currentBid
                    )}

                  </p>


                  <p className="mt-2 text-sm text-gray-500">

                    {bidCount}{" "}

                    {bidCount === 1
                      ? "bid"
                      : "bids"
                    }

                  </p>

                </div>


                {/* COUNTDOWN */}

                <div>

                  <p className="text-sm text-gray-600">

                    {auction.status === "live"
                      ? "Auction ends in"
                      : "Auction status"
                    }

                  </p>


                  {auction.status === "live" ? (

                    <>

                      <p className="mt-2 text-4xl font-medium tracking-wide">
                        {countdown.text}
                      </p>


                      <div className="mt-2 grid grid-cols-3 text-xs text-gray-500">

                        <span>
                          Hours
                        </span>

                        <span>
                          Minutes
                        </span>

                        <span>
                          Seconds
                        </span>

                      </div>

                    </>

                  ) : (

                    <p className="mt-2 text-4xl font-medium capitalize">
                      {auction.status}
                    </p>

                  )}

                </div>

              </div>


              {/* BID INPUT */}

              {canBid && (

                <>

                  <div className="mt-8 flex overflow-hidden rounded-lg border border-gray-300 bg-white">

                    <div className="flex w-14 items-center justify-center border-r border-gray-300 text-lg">
                      $
                    </div>


                    <input
                      type="number"
                      min={
                        minNextBid
                      }
                      step={
                        minIncrease
                      }
                      placeholder="Enter your bid amount"
                      value={
                        bidAmount
                      }
                      onChange={(
                        event
                      ) =>
                        setBidAmount(
                          event.target.value
                        )
                      }
                      className="
                        h-14
                        flex-1
                        px-4
                        text-sm
                        outline-none
                      "
                    />

                  </div>


                  <button
                    type="button"
                    onClick={
                      openBidModal
                    }
                    className="
                      mt-4
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
                    "
                  >

                    Place a bid

                    <ArrowRight
                      size={18}
                    />

                  </button>


                  <p className="mt-3 text-sm text-gray-600">

                    Minimum next bid:{" "}

                    <span className="font-medium text-black">

                      {formatPrice(
                        minNextBid
                      )}

                    </span>

                  </p>

                </>

              )}


              {!canBid && (

                <div className="mt-8 rounded-lg border border-gray-200 bg-white px-5 py-4">

                  <p className="text-sm font-medium capitalize">
                    This auction is {auction.status}.
                  </p>


                  <p className="mt-1 text-xs text-gray-500">

                    {auction.status === "upcoming"
                      ? "Bidding will become available when the auction starts."
                      : "Bidding is no longer available for this auction."
                    }

                  </p>

                </div>

              )}

            </div>


            {/* TRUST */}

            <div className="mt-7 grid grid-cols-3 gap-4">

              <div className="flex items-center gap-3">

                <ShieldCheck
                  size={22}
                />

                <span className="text-sm">
                  Registered seller
                </span>

              </div>


              <div className="flex items-center gap-3">

                <CreditCard
                  size={22}
                />

                <span className="text-sm">
                  Payment after auction
                </span>

              </div>


              <div className="flex items-center gap-3">

                <LockKeyhole
                  size={22}
                />

                <span className="text-sm">
                  Secure bidding
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            TABS
        ================================================= */}

        <section className="mt-14">

          <div className="flex gap-10 overflow-x-auto border-b border-gray-200">

            {tabs.map(
              (tab) => (

                <button
                  type="button"
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={`
                    shrink-0
                    border-b-2
                    pb-4
                    text-sm
                    transition

                    ${
                      activeTab === tab
                        ? "border-black text-black"
                        : "border-transparent text-gray-500"
                    }
                  `}
                >
                  {tab}
                </button>

              )
            )}

          </div>

        </section>


        {/* =================================================
            TAB CONTENT
        ================================================= */}

        <section className="py-10">


          {/* DESCRIPTION */}

          {activeTab === "Description" && (

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_0.9fr]">

              <div>

                <h2 className="text-3xl font-semibold">
                  Description
                </h2>


                <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-7 text-gray-600">

                  {auction.description ||
                    "No description provided."}

                </p>

              </div>


              <div className="rounded-xl bg-[#f7f5f2] p-7">

                <div className="grid grid-cols-2 gap-x-10 gap-y-8">

                  <div className="flex gap-4">

                    <Package
                      size={21}
                      className="mt-1 shrink-0"
                    />


                    <div>

                      <p className="text-xs text-gray-500">
                        Condition
                      </p>

                      <p className="mt-1 text-sm font-medium capitalize">
                        {auction.condition}
                      </p>

                    </div>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500">
                      Category
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {auction.categoryname}
                    </p>

                  </div>


                  <div className="flex gap-4">

                    <UserRound
                      size={21}
                      className="mt-1 shrink-0"
                    />


                    <div>

                      <p className="text-xs text-gray-500">
                        Seller
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {auction.sellername}
                      </p>

                    </div>

                  </div>


                  <div>

                    <p className="text-xs text-gray-500">
                      Minimum increase
                    </p>

                    <p className="mt-1 text-sm font-medium">

                      {formatPrice(
                        auction.minincrease
                      )}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          )}


          {/* DETAILS */}

          {activeTab === "Details" && (

            <div>

              <h2 className="text-3xl font-semibold">
                Auction Details
              </h2>


              <div className="mt-7 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-[#f7f5f2] p-5">

                  <p className="text-xs text-gray-500">
                    Starting Price
                  </p>

                  <p className="mt-2 font-medium">
                    {formatPrice(
                      auction.startprice
                    )}
                  </p>

                </div>


                <div className="rounded-xl bg-[#f7f5f2] p-5">

                  <p className="text-xs text-gray-500">
                    Current Price
                  </p>

                  <p className="mt-2 font-medium">
                    {formatPrice(
                      currentBid
                    )}
                  </p>

                </div>


                <div className="rounded-xl bg-[#f7f5f2] p-5">

                  <p className="text-xs text-gray-500">
                    Minimum Increase
                  </p>

                  <p className="mt-2 font-medium">
                    {formatPrice(
                      auction.minincrease
                    )}
                  </p>

                </div>


                <div className="rounded-xl bg-[#f7f5f2] p-5">

                  <p className="text-xs text-gray-500">
                    Condition
                  </p>

                  <p className="mt-2 font-medium capitalize">
                    {auction.condition}
                  </p>

                </div>


                <div className="rounded-xl bg-[#f7f5f2] p-5">

                  <p className="text-xs text-gray-500">
                    Status
                  </p>

                  <p className="mt-2 font-medium capitalize">
                    {auction.status}
                  </p>

                </div>


                <div className="rounded-xl bg-[#f7f5f2] p-5">

                  <p className="text-xs text-gray-500">
                    Bids
                  </p>

                  <p className="mt-2 font-medium">
                    {bidCount}
                  </p>

                </div>

              </div>

            </div>

          )}


          {/* SELLER */}

          {activeTab === "Seller" && (

            <div>

              <h2 className="text-3xl font-semibold">
                Seller
              </h2>


              <div className="mt-7 flex max-w-xl items-center gap-5 rounded-xl bg-[#f7f5f2] p-6">

                {auction.sellerimage ? (

                  <img
                    src={
                      auction.sellerimage
                    }
                    alt={
                      auction.sellername
                    }
                    className="h-16 w-16 rounded-full object-cover"
                  />

                ) : (

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">

                    <UserRound
                      size={24}
                    />

                  </div>

                )}


                <div>

                  <p className="text-lg font-semibold">
                    {auction.sellername}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    AuctionX seller
                  </p>

                </div>

              </div>

            </div>

          )}


          {/* BID HISTORY */}

          {activeTab === "Bid History" && (

            <div>

              <h2 className="text-3xl font-semibold">
                Bid History
              </h2>


              {!auction.recentBids ||
              auction.recentBids.length === 0 ? (

                <p className="mt-6 text-sm text-gray-500">
                  No bids have been placed yet.
                </p>

              ) : (

                <div className="mt-7 max-w-3xl overflow-hidden rounded-xl border border-gray-200">

                  {auction.recentBids.map(
                    (
                      bid,
                      index
                    ) => (

                      <div
                        key={
                          bid.bidid ||
                          `${bid.userid}-${bid.createdat}-${index}`
                        }
                        className={`
                          flex
                          items-center
                          justify-between
                          gap-4
                          px-5
                          py-4

                          ${
                            index !==
                            auction.recentBids.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          }
                        `}
                      >

                        <div>

                          <p className="text-sm font-medium">
                            {bid.biddername || "Bidder"}
                          </p>


                          <p className="mt-1 text-xs text-gray-500">

                            {bid.createdat
                              ? new Date(
                                  bid.createdat
                                ).toLocaleString()
                              : ""
                            }

                          </p>

                        </div>


                        <p className="font-semibold">

                          {formatPrice(
                            bid.amount
                          )}

                        </p>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          )}


          {/* SHIPPING & PAYMENT */}

          {activeTab === "Shipping & Payment" && (

            <div>

              <h2 className="text-3xl font-semibold">
                Shipping & Payment
              </h2>


              <div className="mt-7 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-[#f7f5f2] p-6">

                  <Package
                    size={22}
                  />


                  <h3 className="mt-4 font-semibold">
                    Shipping
                  </h3>


                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Shipping arrangements are handled after the auction has ended.
                  </p>

                </div>


                <div className="rounded-xl bg-[#f7f5f2] p-6">

                  <CreditCard
                    size={22}
                  />


                  <h3 className="mt-4 font-semibold">
                    Payment
                  </h3>


                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    AuctionX does not process real payments in the current version.
                  </p>

                </div>

              </div>

            </div>

          )}

        </section>


        {/* =================================================
            RELATED AUCTIONS
        ================================================= */}

        {relatedAuctions.length > 0 && (

          <section className="border-t border-gray-200 py-10">

            <div className="flex items-center justify-between">

              <h2 className="text-3xl font-semibold">
                You may also like
              </h2>


              <Link
                to={`/auctions?categoryId=${auction.categoryid}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
              >

                View all

                <ArrowRight
                  size={15}
                />

              </Link>

            </div>


            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {relatedAuctions.map(
                (
                  relatedAuction
                ) => (

                  <Link
                    key={
                      relatedAuction.auctionid
                    }
                    to={`/auctions/${relatedAuction.auctionid}`}
                    className="
                      group
                      overflow-hidden
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      transition
                      hover:shadow-md
                    "
                  >

                    <div className="relative h-56 overflow-hidden bg-gray-100">

                      {relatedAuction.imageurl ? (

                        <img
                          src={
                            relatedAuction.imageurl
                          }
                          alt={
                            relatedAuction.title
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
                            relatedAuction.status === "live"
                              ? "bg-red-500 text-white"
                              : relatedAuction.status === "upcoming"
                                ? "bg-white text-black"
                                : "bg-black/70 text-white"
                          }
                        `}
                      >

                        {relatedAuction.status}

                      </span>

                    </div>


                    <div className="p-4">

                      <h3 className="font-medium">
                        {relatedAuction.title}
                      </h3>


                      <p className="mt-1 text-sm capitalize text-gray-500">
                        {relatedAuction.condition}
                      </p>


                      <p className="mt-4 text-xl font-semibold">

                        {formatPrice(
                          relatedAuction.currentprice
                        )}

                      </p>


                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">

                        <span>

                          {relatedAuction.bidcount}{" "}

                          {Number(
                            relatedAuction.bidcount
                          ) === 1
                            ? "bid"
                            : "bids"
                          }

                        </span>


                        <span className="flex items-center gap-1">

                          <Clock3
                            size={12}
                          />

                          {getTimeLeft(
                            relatedAuction.endtime,
                            relatedAuction.status
                          )}

                        </span>

                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>

          </section>

        )}

      </div>


      {/* =================================================
          BID MODAL
      ================================================= */}

      <BidModal
        isOpen={
          showBidModal
        }

        onClose={() =>
          setShowBidModal(
            false
          )
        }

        auctionId={
          Number(id)
        }

        auctionTitle={
          auction.title
        }

        currentBid={
          currentBid
        }

        minNextBid={
          minNextBid
        }

        timeLeft={
          countdown.text
        }

        bidAmount={
          bidAmount
        }

        setBidAmount={
          setBidAmount
        }

        onBidPlaced={
          handleBidPlaced
        }
      />

    </main>

  )

}


export default AuctionDetails