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
  CircleHelp,
  CreditCard,
  Globe2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import api from "../api/axios"


const Checkout = () => {
  // ====================================================
  // ROUTER
  // ====================================================

  const { auctionId } =
    useParams()

  const navigate =
    useNavigate()


  // ====================================================
  // AUCTION
  // ====================================================

  const [
    auction,
    setAuction,
  ] = useState(null)


  // ====================================================
  // ORDER
  // ====================================================

  const [
    order,
    setOrder,
  ] = useState(null)


  // ====================================================
  // USER
  // ====================================================

  const [
    user,
    setUser,
  ] = useState(null)


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

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    confirmed,
    setConfirmed,
  ] = useState(false)


  // ====================================================
  // FORM
  // ====================================================

  const [
    formData,
    setFormData,
  ] = useState({
    fullName: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Palestine",
    saveAddress: false,
  })


  // ====================================================
  // LOAD USER
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


      setUser(
        storedUser
      )


      const name =
        storedUser.name ??
        storedUser.Name ??
        ""


      setFormData(
        (current) => ({
          ...current,
          fullName: name,
        })
      )

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
  // USER ID
  // ====================================================

  const userId =
    useMemo(() => {
      return Number(
        user?.userid ??
        user?.userId ??
        user?.UserID
      )
    }, [user])


  // ====================================================
  // GET AUCTION
  // ====================================================

  useEffect(() => {
    if (
      !auctionId ||
      !userId
    ) {
      return
    }


    const fetchAuction =
      async () => {
        try {
          setLoading(true)
          setError("")


          const response =
            await api.get(
              `/auctions/${auctionId}`
            )


          setAuction(
            response.data
          )

        } catch (error) {
          console.error(
            "Checkout auction error:",
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


            navigate("/login")

            return
          }


          if (
            error.response
              ?.status === 404
          ) {
            setError(
              "Auction not found."
            )

            return
          }


          setError(
            error.response
              ?.data
              ?.error ||
            "Failed to load checkout."
          )

        } finally {
          setLoading(false)
        }
      }


    fetchAuction()

  }, [
    auctionId,
    userId,
    navigate,
  ])


  // ====================================================
  // IMAGES
  // ====================================================

  const productImages =
    useMemo(() => {
      if (
        !auction?.images
      ) {
        return []
      }


      return auction.images
        .map(
          (image) =>
            image.imageurl
        )
        .filter(Boolean)

    }, [auction])


  const productImage =
    productImages[0] ||
    auction?.imageurl ||
    ""


  // ====================================================
  // WINNING PRICE
  // ====================================================

  const winningPrice =
    Number(
      auction?.currentprice ??
      auction?.startprice ??
      0
    )


  // ====================================================
  // IS WINNER
  // ====================================================

  const isWinner =
    Number(
      auction?.winneruserid
    ) === userId


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
  // HANDLE CHANGE
  // ====================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target


    setFormData(
      (current) => ({
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    )
  }


  // ====================================================
  // VALIDATE FORM
  // ====================================================

  const validateForm = () => {
    if (
      !formData.fullName.trim()
    ) {
      return "Full name is required."
    }


    if (
      !formData.phone.trim()
    ) {
      return "Phone number is required."
    }


    if (
      !formData.address.trim()
    ) {
      return "Address is required."
    }


    if (
      !formData.city.trim()
    ) {
      return "City is required."
    }


    if (
      !formData.country.trim()
    ) {
      return "Country is required."
    }


    return ""
  }


  // ====================================================
  // CONFIRM ORDER
  // ====================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault()


      if (!auction) {
        return
      }


      if (!isWinner) {
        setError(
          "Only the winner of this auction can confirm the order."
        )

        return
      }


      const validationError =
        validateForm()


      if (validationError) {
        setError(
          validationError
        )

        return
      }


      try {
        setSubmitting(true)
        setError("")


        const response =
          await api.post(
            "/orders",
            {
              auctionId:
                Number(
                  auctionId
                ),

              fullName:
                formData.fullName,

              phone:
                formData.phone,

              address:
                formData.address,

              apartment:
                formData.apartment,

              city:
                formData.city,

              state:
                formData.state,

              postalCode:
                formData.postalCode,

              country:
                formData.country,

              saveAddress:
                formData.saveAddress,
            }
          )


        setOrder(
          response.data.order
        )

        setConfirmed(true)

      } catch (error) {
        console.error(
          "Confirm order error:",
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


          navigate("/login")

          return
        }


        setError(
          error.response
            ?.data
            ?.error ||
          "Failed to confirm order."
        )

      } finally {
        setSubmitting(false)
      }
    }


  // ====================================================
  // LOADING
  // ====================================================

  if (
    !user ||
    loading
  ) {
    return (
      <main className="pt-24 pb-14">

        <div className="mx-auto max-w-[1500px] px-6 py-24 text-center">

          <p className="text-sm text-gray-500">
            Loading checkout...
          </p>

        </div>

      </main>
    )
  }


  // ====================================================
  // ERROR - NO AUCTION
  // ====================================================

  if (
    error &&
    !auction
  ) {
    return (
      <main className="pt-24 pb-14">

        <div className="mx-auto max-w-[1500px] px-6 py-24 text-center">

          <h1 className="text-3xl font-semibold">
            Checkout unavailable
          </h1>


          <p className="mt-3 text-sm text-gray-500">
            {error}
          </p>


          <Link
            to="/my-bids"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Back to My Bids

            <ArrowRight
              size={16}
            />
          </Link>

        </div>

      </main>
    )
  }


  // ====================================================
  // NOT WINNER
  // ====================================================

  if (
    auction &&
    !isWinner
  ) {
    return (
      <main className="pt-24 pb-14">

        <div className="mx-auto max-w-[1500px] px-6 py-24 text-center">

          <LockKeyhole
            size={38}
            className="mx-auto text-gray-300"
          />


          <h1 className="mt-5 text-3xl font-semibold">
            Checkout unavailable
          </h1>


          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
            This checkout is only available to the winner of the auction.
          </p>


          <Link
            to={`/auctions/${auctionId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            View Auction

            <ArrowRight
              size={16}
            />
          </Link>

        </div>

      </main>
    )
  }


  // ====================================================
  // CONFIRMED
  // ====================================================

  if (confirmed) {
    return (
      <main className="pt-24 pb-14">

        <div className="mx-auto max-w-2xl px-6 py-24 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

            <PackageCheck
              size={30}
              className="text-green-700"
            />

          </div>


          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Order Confirmed
          </h1>


          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-500">
            Your shipping information has been confirmed.
            Payment and delivery arrangements can now be
            completed with the seller.
          </p>


          <div className="mx-auto mt-8 max-w-md rounded-xl bg-[#f7f5f2] p-5 text-left">

            {order?.orderid && (
              <>
                <p className="text-xs text-gray-500">
                  Order ID
                </p>

                <p className="mt-1 font-medium">
                  #{order.orderid}
                </p>
              </>
            )}


            <p
              className={
                order?.orderid
                  ? "mt-5 text-xs text-gray-500"
                  : "text-xs text-gray-500"
              }
            >
              Auction
            </p>

            <p className="mt-1 font-medium">
              {auction.title}
            </p>


            <p className="mt-5 text-xs text-gray-500">
              Winning Bid
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {formatPrice(
                order?.winningamount ??
                winningPrice
              )}
            </p>


            {order?.status && (
              <>
                <p className="mt-5 text-xs text-gray-500">
                  Order Status
                </p>

                <p className="mt-1 capitalize font-medium">
                  {order.status}
                </p>
              </>
            )}

          </div>


          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <Link
              to={`/auctions/${auctionId}`}
              className="flex h-11 items-center justify-center rounded-lg border border-gray-200 px-5 text-sm font-medium"
            >
              View Auction
            </Link>


            <Link
              to="/my-bids"
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-5 text-sm font-medium text-white"
            >
              My Bids

              <ArrowRight
                size={16}
              />
            </Link>

          </div>

        </div>

      </main>
    )
  }


  return (
    <main className="pt-24 pb-14">

      <div className="mx-auto max-w-[1500px] px-6">


        {/* =================================================
            STEPS
        ================================================= */}

        <div className="mx-auto mb-8 max-w-5xl">

          <div className="grid grid-cols-3">


            {/* STEP 1 */}

            <div>

              <div className="flex items-center">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm text-white">
                  1
                </div>

                <div className="h-px flex-1 bg-black" />

              </div>


              <div className="mt-2">

                <p className="text-sm font-medium">
                  Shipping
                </p>

                <p className="text-xs text-gray-500">
                  Enter your details
                </p>

              </div>

            </div>


            {/* STEP 2 */}

            <div>

              <div className="flex items-center">

                <div className="h-px flex-1 bg-gray-200" />

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-600">
                  2
                </div>

                <div className="h-px flex-1 bg-gray-200" />

              </div>


              <div className="mt-2">

                <p className="text-sm font-medium">
                  Confirmation
                </p>

                <p className="text-xs text-gray-500">
                  Review your order
                </p>

              </div>

            </div>


            {/* STEP 3 */}

            <div>

              <div className="flex items-center">

                <div className="h-px flex-1 bg-gray-200" />

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-600">
                  3
                </div>

              </div>


              <div className="mt-2">

                <p className="text-sm font-medium">
                  Complete
                </p>

                <p className="text-xs text-gray-500">
                  Finish purchase
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            PAGE GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_430px]">


          {/* =================================================
              LEFT
          ================================================= */}

          <section>

            <div>

              <h1 className="text-4xl font-semibold tracking-tight">
                Checkout
              </h1>

              <p className="mt-2 text-gray-500">
                Confirm your shipping information for your winning auction.
              </p>

            </div>


            {/* =================================================
                SHIPPING
            ================================================= */}

            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="mt-6 rounded-xl border border-gray-200 p-6"
            >

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-4">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm text-white">
                    1
                  </div>

                  <h2 className="text-2xl font-semibold">
                    Shipping Information
                  </h2>

                </div>


                <p className="text-sm text-gray-500">
                  Enter the address for this item.
                </p>

              </div>


              {/* ROW 1 */}

              <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>


                  <div className="relative">

                    <UserRound
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />


                    <input
                      required
                      type="text"
                      name="fullName"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your full name"
                      className="h-11 w-full rounded-lg border border-gray-300 pl-11 pr-4 text-sm outline-none focus:border-black"
                    />

                  </div>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>


                  <div className="relative">

                    <Phone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />


                    <input
                      required
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your phone number"
                      className="h-11 w-full rounded-lg border border-gray-300 pl-11 pr-4 text-sm outline-none focus:border-black"
                    />

                  </div>

                </div>

              </div>


              {/* ROW 2 */}

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Address
                  </label>


                  <div className="relative">

                    <MapPin
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />


                    <input
                      required
                      type="text"
                      name="address"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Street address"
                      className="h-11 w-full rounded-lg border border-gray-300 pl-11 pr-4 text-sm outline-none focus:border-black"
                    />

                  </div>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Apartment, suite, etc. (optional)
                  </label>


                  <input
                    type="text"
                    name="apartment"
                    value={
                      formData.apartment
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Apt 5, Building 3"
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                  />

                </div>

              </div>


              {/* ROW 3 */}

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    City
                  </label>

                  <input
                    required
                    type="text"
                    name="city"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="City"
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    State / Province
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="State / Province"
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Postal Code
                  </label>

                  <input
                    type="text"
                    name="postalCode"
                    value={
                      formData.postalCode
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Postal Code"
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                  />

                </div>

              </div>


              {/* COUNTRY */}

              <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">

                <div className="w-full md:max-w-md">

                  <label className="mb-2 block text-sm font-medium">
                    Country
                  </label>


                  <div className="relative">

                    <Globe2
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />


                    <select
                      name="country"
                      value={
                        formData.country
                      }
                      onChange={
                        handleChange
                      }
                      className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-black"
                    >
                      <option value="Palestine">
                        Palestine
                      </option>

                      <option value="Jordan">
                        Jordan
                      </option>

                      <option value="United States">
                        United States
                      </option>

                      <option value="United Kingdom">
                        United Kingdom
                      </option>
                    </select>

                  </div>

                </div>


                <label className="flex items-center gap-3 text-sm">

                  <input
                    type="checkbox"
                    name="saveAddress"
                    checked={
                      formData.saveAddress
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4"
                  />

                  Use this address for future purchases

                </label>

              </div>

            </form>


            {/* =================================================
                PAYMENT
            ================================================= */}

            <div className="mt-5 rounded-xl border border-gray-200 p-6">

              <div className="flex items-center gap-4">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm text-white">
                  2
                </div>


                <div>

                  <h2 className="text-2xl font-semibold">
                    Payment
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Payment is arranged after the order is confirmed.
                  </p>

                </div>

              </div>


              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="rounded-xl border-2 border-black p-5">

                  <div className="flex items-center gap-3">

                    <PackageCheck
                      size={23}
                    />

                    <div>

                      <p className="font-medium">
                        Arrange with Seller
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Finalize payment directly after confirmation.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                  <div className="flex items-center gap-3">

                    <CreditCard
                      size={23}
                      className="text-gray-400"
                    />

                    <div>

                      <p className="font-medium text-gray-500">
                        Online Payment
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Coming soon.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              RIGHT
          ================================================= */}

          <aside>


            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <div className="rounded-xl border border-gray-200 p-6">

              <div className="flex items-center justify-between gap-4">

                <h2 className="text-2xl font-semibold">
                  Order Summary
                </h2>


                <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  🏆 You won this auction!
                </div>

              </div>


              {/* PRODUCT */}

              <div className="mt-7 flex gap-5 border-b border-gray-200 pb-6">

                <div className="h-28 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                  {productImage ? (

                    <img
                      src={
                        productImage
                      }
                      alt={
                        auction.title
                      }
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-full w-full items-center justify-center">

                      <PackageCheck
                        size={25}
                        className="text-gray-300"
                      />

                    </div>

                  )}

                </div>


                <div className="flex min-w-0 flex-1 justify-between gap-4">

                  <div className="min-w-0">

                    <h3 className="font-semibold">
                      {auction.title}
                    </h3>


                    <p className="mt-2 text-sm capitalize text-gray-500">
                      {auction.condition}
                    </p>


                    {auction.categoryname && (

                      <p className="mt-1 text-sm text-gray-500">
                        {auction.categoryname}
                      </p>

                    )}

                  </div>


                  <p className="shrink-0 text-xl font-semibold">

                    {formatPrice(
                      winningPrice
                    )}

                  </p>

                </div>

              </div>


              {/* =================================================
                  COST
              ================================================= */}

              <div className="space-y-4 border-b border-gray-200 py-6 text-sm">

                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Winning Bid
                  </span>

                  <span>
                    {formatPrice(
                      winningPrice
                    )}
                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="flex items-center gap-2 text-gray-500">

                    Buyer Protection Fee

                    <CircleHelp
                      size={14}
                    />

                  </span>

                  <span className="text-gray-400">
                    —
                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="text-gray-400">
                    Arranged with seller
                  </span>

                </div>

              </div>


              {/* =================================================
                  TOTAL
              ================================================= */}

              <div className="flex items-center justify-between py-5">

                <span className="text-xl font-semibold">
                  Winning Amount
                </span>

                <span className="text-3xl font-semibold">

                  {formatPrice(
                    winningPrice
                  )}

                </span>

              </div>


              {/* =================================================
                  NOTICE
              ================================================= */}

              <div className="rounded-xl bg-gray-50 p-4">

                <div className="flex gap-3">

                  <ShieldCheck
                    size={28}
                    className="shrink-0"
                  />


                  <div className="flex-1">

                    <p className="font-medium">
                      Auction Confirmation
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Confirm your shipping details to continue with payment and delivery arrangements.
                    </p>

                  </div>

                </div>

              </div>


              {/* ERROR */}

              {error && (

                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm text-red-600">
                    {error}
                  </p>

                </div>

              )}


              {/* =================================================
                  CONFIRM
              ================================================= */}

              <button
                type="submit"
                form="checkout-form"
                disabled={
                  submitting
                }
                className={`
                  mt-5
                  flex
                  h-13
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-lg
                  bg-black
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-gray-800

                  ${
                    submitting
                      ? "cursor-wait opacity-60"
                      : ""
                  }
                `}
              >

                <LockKeyhole
                  size={17}
                />

                {submitting
                  ? "Confirming..."
                  : "Confirm Order"
                }

                {!submitting && (
                  <ArrowRight
                    size={16}
                  />
                )}

              </button>


              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                By confirming your order, you agree to our{" "}

                <Link
                  to="#"
                  className="underline"
                >
                  Terms of Service
                </Link>

                {" "}and{" "}

                <Link
                  to="#"
                  className="underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>

            </div>


            {/* =================================================
                HELP
            ================================================= */}

            <div className="mt-5 rounded-xl border border-gray-200 p-5">

              <h3 className="text-xl font-semibold">
                Need Help?
              </h3>


              <button
                type="button"
                className="mt-5 flex w-full items-center gap-4 border-b border-gray-200 py-4 text-left"
              >

                <MessageCircle
                  size={25}
                />


                <div className="flex-1">

                  <p className="text-sm font-medium">
                    Contact Support
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    We're here to help.
                  </p>

                </div>


                <ArrowRight
                  size={15}
                />

              </button>


              <button
                type="button"
                className="flex w-full items-center gap-4 py-4 text-left"
              >

                <CircleHelp
                  size={25}
                />


                <div className="flex-1">

                  <p className="text-sm font-medium">
                    Visit Help Center
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Find answers to common questions.
                  </p>

                </div>


                <ArrowRight
                  size={15}
                />

              </button>

            </div>

          </aside>

        </div>

      </div>

    </main>
  )
}


export default Checkout