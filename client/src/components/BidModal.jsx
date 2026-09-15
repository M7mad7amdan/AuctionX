import { useEffect, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  X,
} from "lucide-react"

import api from "../api/axios"


const BidModal = ({
  isOpen,
  onClose,
  auctionId,
  auctionTitle,
  currentBid,
  minNextBid,
  timeLeft,
  bidAmount,
  setBidAmount,
  onBidPlaced,
}) => {

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState(false)


  // ====================================================
  // RESET MODAL STATE
  // ====================================================

  useEffect(() => {

    if (isOpen) {

      setError("")
      setSuccess(false)

    }

  }, [isOpen])


  // ====================================================
  // CLOSE WITH ESC
  // ====================================================

  useEffect(() => {

    if (!isOpen) {
      return
    }


    const handleKeyDown = (
      event
    ) => {

      if (
        event.key === "Escape" &&
        !loading
      ) {

        onClose()

      }

    }


    window.addEventListener(
      "keydown",
      handleKeyDown
    )


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      )

    }

  }, [
    isOpen,
    loading,
    onClose,
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
  // PLACE BID
  // ====================================================

  const handlePlaceBid =
    async () => {

      setError("")
      setSuccess(false)


      // ================================================
      // FRONTEND VALIDATION
      // ================================================

      if (
        bidAmount === "" ||
        bidAmount === null ||
        bidAmount === undefined
      ) {

        setError(
          "Please enter a bid amount."
        )

        return

      }


      const amount =
        Number(
          bidAmount
        )


      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {

        setError(
          "Please enter a valid bid amount."
        )

        return

      }


      if (
        amount <
        Number(
          minNextBid
        )
      ) {

        setError(
          `Minimum next bid is ${formatPrice(
            minNextBid
          )}.`
        )

        return

      }


      try {

        setLoading(true)


        // ================================================
        // REAL BID REQUEST
        // ================================================

        const response =
          await api.post(
            `/bids/auction/${auctionId}`,
            {
              amount,
            }
          )


        setSuccess(true)


        // ================================================
        // UPDATE PARENT PAGE IF PROVIDED
        // ================================================

        if (
          onBidPlaced
        ) {

          onBidPlaced(
            response.data
          )

        }


      } catch (error) {

        console.error(
          "Place bid error:",
          error
        )


        if (
          error.response
            ?.status === 401
        ) {

          setError(
            "You need to log in before placing a bid."
          )

          return

        }


        setError(
          error.response
            ?.data
            ?.error ||
          "Failed to place bid."
        )


      } finally {

        setLoading(false)

      }

    }


  // ====================================================
  // DON'T RENDER
  // ====================================================

  if (!isOpen) {
    return null
  }


  return (

    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        px-4
        backdrop-blur-sm
      "
      onMouseDown={(
        event
      ) => {

        if (
          event.target ===
          event.currentTarget &&
          !loading
        ) {

          onClose()

        }

      }}
    >

      <div
        className="
          relative
          w-full
          max-w-lg
          rounded-2xl
          bg-white
          p-7
          shadow-2xl
        "
      >


        {/* =================================================
            CLOSE
        ================================================= */}

        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            text-gray-500
            transition
            hover:bg-gray-100
            hover:text-black
            disabled:opacity-40
          "
        >

          <X size={19} />

        </button>


        {/* =================================================
            SUCCESS
        ================================================= */}

        {success ? (

          <div className="py-5 text-center">


            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-green-50
                text-green-600
              "
            >

              <CheckCircle2
                size={28}
              />

            </div>


            <h2 className="mt-5 text-2xl font-semibold">
              Bid placed successfully
            </h2>


            <p className="mt-3 text-sm leading-6 text-gray-500">

              Your bid of{" "}

              <span className="font-medium text-black">

                {formatPrice(
                  bidAmount
                )}

              </span>{" "}

              has been placed on{" "}

              <span className="font-medium text-black">
                {auctionTitle}
              </span>.

            </p>


            <button
              type="button"
              onClick={onClose}
              className="
                mt-7
                h-12
                w-full
                rounded-lg
                bg-black
                text-sm
                font-medium
                text-white
                transition
                hover:bg-gray-800
              "
            >
              Done
            </button>

          </div>

        ) : (

          <>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="pr-10">

              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                Confirm your bid
              </p>


              <h2 className="mt-3 text-2xl font-semibold">
                Place a bid
              </h2>


              <p className="mt-2 text-sm text-gray-500">
                {auctionTitle}
              </p>

            </div>


            {/* =================================================
                AUCTION INFO
            ================================================= */}

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-4
                rounded-xl
                bg-[#f7f5f2]
                p-5
              "
            >


              <div>

                <p className="text-xs text-gray-500">
                  Current bid
                </p>


                <p className="mt-1 text-lg font-semibold">

                  {formatPrice(
                    currentBid
                  )}

                </p>

              </div>


              <div>

                <p className="text-xs text-gray-500">
                  Time left
                </p>


                <p className="mt-1 text-lg font-semibold">
                  {timeLeft}
                </p>

              </div>

            </div>


            {/* =================================================
                BID INPUT
            ================================================= */}

            <div className="mt-6">

              <label
                htmlFor="modal-bid-amount"
                className="text-sm font-medium"
              >
                Your bid
              </label>


              <div
                className="
                  mt-2
                  flex
                  overflow-hidden
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  transition
                  focus-within:border-black
                "
              >

                <div
                  className="
                    flex
                    w-14
                    items-center
                    justify-center
                    border-r
                    border-gray-300
                    text-lg
                  "
                >
                  $
                </div>


                <input
                  id="modal-bid-amount"
                  type="number"
                  min={
                    minNextBid
                  }
                  value={
                    bidAmount
                  }
                  onChange={(
                    event
                  ) => {

                    setBidAmount(
                      event.target.value
                    )

                    setError("")

                  }}
                  className="
                    h-14
                    flex-1
                    px-4
                    text-base
                    outline-none
                  "
                  autoFocus
                />

              </div>


              <p className="mt-2 text-xs text-gray-500">

                Minimum next bid:{" "}

                <span className="font-medium text-black">

                  {formatPrice(
                    minNextBid
                  )}

                </span>

              </p>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div
                className="
                  mt-4
                  rounded-lg
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                "
              >
                {error}
              </div>

            )}


            {/* =================================================
                CONFIRM BUTTON
            ================================================= */}

            <button
              type="button"
              disabled={loading}
              onClick={
                handlePlaceBid
              }
              className="
                mt-6
                flex
                h-14
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
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {loading
                ? "Placing bid..."
                : "Confirm bid"
              }


              {!loading && (

                <ArrowRight
                  size={17}
                />

              )}

            </button>


            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              Your bid will be submitted immediately after confirmation.
            </p>

          </>

        )}

      </div>

    </div>

  )

}


export default BidModal