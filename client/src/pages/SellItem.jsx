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
  ArrowLeft,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Eye,
  Gavel,
  Heart,
  Home,
  ImagePlus,
  Lightbulb,
  MessageSquare,
  Pencil,
  Settings,
  Tag,
  Trash2,
  Upload,
  Wrench,
} from "lucide-react"

import api from "../api/axios"


const SellItem = () => {
  const navigate =
    useNavigate()


  // ====================================================
  // STEP
  // ====================================================

  const [
    step,
    setStep,
  ] = useState(1)


  // ====================================================
  // CATEGORIES
  // ====================================================

  const [
    categories,
    setCategories,
  ] = useState([])


  // ====================================================
  // IMAGES
  // ====================================================

  const [
    images,
    setImages,
  ] = useState([])


  // ====================================================
  // FORM
  // ====================================================

  const [
    formData,
    setFormData,
  ] = useState({
    title: "",
    categoryId: "",
    brand: "",
    model: "",
    description: "",
    condition: "excellent",
    year: "",
    material: "",
    boxPapers: "",
    referenceNumber: "",

    startPrice: "",
    minIncrease: "",
    startTime: "",
    endTime: "",
  })


  // ====================================================
  // PAGE STATE
  // ====================================================

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true)

  const [
    publishing,
    setPublishing,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")


  // ====================================================
  // AUTH CHECK
  // ====================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      )

    if (!token) {
      navigate("/login")
    }
  }, [navigate])


  // ====================================================
  // GET CATEGORIES
  // ====================================================

  useEffect(() => {
    const fetchCategories =
      async () => {
        try {
          setLoadingCategories(true)


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

          setError(
            "Failed to load categories."
          )

        } finally {
          setLoadingCategories(false)
        }
      }


    fetchCategories()
  }, [])


  // ====================================================
  // SELECTED CATEGORY
  // ====================================================

  const selectedCategory =
    useMemo(() => {
      return categories.find(
        (category) =>
          Number(
            category.categoryid
          ) ===
          Number(
            formData.categoryId
          )
      )
    }, [
      categories,
      formData.categoryId,
    ])


  // ====================================================
  // HANDLE CHANGE
  // ====================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target


    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    )


    setError("")
  }


  // ====================================================
  // IMAGE CHANGE
  // ====================================================

  const handleImagesChange = (
    event
  ) => {
    const files =
      Array.from(
        event.target.files || []
      )


    if (
      files.length === 0
    ) {
      return
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]


    const invalidFile =
      files.find(
        (file) =>
          !allowedTypes.includes(
            file.type
          )
      )


    if (invalidFile) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      )

      return
    }


    const tooLarge =
      files.find(
        (file) =>
          file.size >
          5 * 1024 * 1024
      )


    if (tooLarge) {
      setError(
        "Each image must be 5MB or smaller."
      )

      return
    }


    const newImages =
      files.map(
        (file) => ({
          file,
          preview:
            URL.createObjectURL(
              file
            ),
        })
      )


    setImages(
      (current) => [
        ...current,
        ...newImages,
      ]
    )


    setError("")


    event.target.value = ""
  }


  // ====================================================
  // REMOVE IMAGE
  // ====================================================

  const removeImage = (
    index
  ) => {
    setImages(
      (current) => {
        const image =
          current[index]


        if (image?.preview) {
          URL.revokeObjectURL(
            image.preview
          )
        }


        return current.filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
      }
    )
  }


  // ====================================================
  // CLEAN IMAGE PREVIEWS
  // ====================================================

  useEffect(() => {
    return () => {
      images.forEach(
        (image) => {
          if (image.preview) {
            URL.revokeObjectURL(
              image.preview
            )
          }
        }
      )
    }
  }, [])


  // ====================================================
  // BUILD DESCRIPTION
  // ====================================================

  const buildDescription =
    () => {
      const details = []


      if (
        formData.brand.trim()
      ) {
        details.push(
          `Brand: ${formData.brand.trim()}`
        )
      }


      if (
        formData.model.trim()
      ) {
        details.push(
          `Model: ${formData.model.trim()}`
        )
      }


      if (
        formData.year.trim()
      ) {
        details.push(
          `Year: ${formData.year.trim()}`
        )
      }


      if (
        formData.material.trim()
      ) {
        details.push(
          `Material: ${formData.material.trim()}`
        )
      }


      if (
        formData.boxPapers
      ) {
        details.push(
          `Box & Papers: ${
            formData.boxPapers ===
            "yes"
              ? "Yes"
              : "No"
          }`
        )
      }


      if (
        formData.referenceNumber.trim()
      ) {
        details.push(
          `Reference Number: ${formData.referenceNumber.trim()}`
        )
      }


      if (
        formData.condition
      ) {
        details.push(
          `Condition Detail: ${
            formData.condition
              .replace("-", " ")
              .replace(
                /\b\w/g,
                (character) =>
                  character.toUpperCase()
              )
          }`
        )
      }


      if (
        details.length === 0
      ) {
        return formData
          .description
          .trim()
      }


      return `${formData.description.trim()}

${details.join("\n")}`
    }


  // ====================================================
  // DATABASE CONDITION
  // ====================================================

  const databaseCondition =
    formData.condition === "new"
      ? "new"
      : "used"


  // ====================================================
  // VALIDATE STEP 1
  // ====================================================

  const validateItemDetails =
    () => {
      if (
        !formData.title.trim()
      ) {
        return "Title is required."
      }


      if (
        !formData.categoryId
      ) {
        return "Category is required."
      }


      if (
        !formData.description.trim()
      ) {
        return "Description is required."
      }


      return ""
    }


  // ====================================================
  // VALIDATE PHOTOS
  // ====================================================

  const validatePhotos =
    () => {
      if (
        images.length === 0
      ) {
        return "Add at least one photo."
      }


      return ""
    }


  // ====================================================
  // VALIDATE PRICING
  // ====================================================

  const validatePricing =
    () => {
      const startPrice =
        Number(
          formData.startPrice
        )

      const minIncrease =
        Number(
          formData.minIncrease
        )


      if (
        !Number.isFinite(
          startPrice
        ) ||
        startPrice <= 0
      ) {
        return "Enter a valid starting price."
      }


      if (
        !Number.isFinite(
          minIncrease
        ) ||
        minIncrease <= 0
      ) {
        return "Enter a valid minimum bid increase."
      }


      if (
        !formData.startTime
      ) {
        return "Start time is required."
      }


      if (
        !formData.endTime
      ) {
        return "End time is required."
      }


      const start =
        new Date(
          formData.startTime
        )

      const end =
        new Date(
          formData.endTime
        )


      if (
        Number.isNaN(
          start.getTime()
        ) ||
        Number.isNaN(
          end.getTime()
        )
      ) {
        return "Invalid auction date."
      }


      if (
        end <= start
      ) {
        return "End time must be after start time."
      }


      return ""
    }


  // ====================================================
  // NEXT
  // ====================================================

  const handleNext = () => {
    setError("")


    if (step === 1) {
      const validationError =
        validateItemDetails()


      if (validationError) {
        setError(
          validationError
        )

        return
      }
    }


    if (step === 2) {
      const validationError =
        validatePhotos()


      if (validationError) {
        setError(
          validationError
        )

        return
      }
    }


    if (step === 3) {
      const validationError =
        validatePricing()


      if (validationError) {
        setError(
          validationError
        )

        return
      }
    }


    setStep(
      (current) =>
        Math.min(
          current + 1,
          4
        )
    )


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }


  // ====================================================
  // BACK
  // ====================================================

  const handleBack = () => {
    setError("")


    setStep(
      (current) =>
        Math.max(
          current - 1,
          1
        )
    )


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }


  // ====================================================
  // PUBLISH
  // ====================================================

  const handlePublish =
    async () => {
      const itemError =
        validateItemDetails()

      const photoError =
        validatePhotos()

      const pricingError =
        validatePricing()


      if (
        itemError ||
        photoError ||
        pricingError
      ) {
        setError(
          itemError ||
          photoError ||
          pricingError
        )

        return
      }


      let createdProductId =
        null


      try {
        setPublishing(true)
        setError("")


        // ================================================
        // 1. CREATE PRODUCT
        // ================================================

        const productResponse =
          await api.post(
            "/products",
            {
              title:
                formData.title.trim(),

              description:
                buildDescription(),

              condition:
                databaseCondition,
            }
          )


        const product =
          productResponse.data
            ?.product ??
          productResponse.data


        createdProductId =
          product?.productid ??
          product?.ProductID ??
          product?.productId


        if (
          !createdProductId
        ) {
          throw new Error(
            "Product ID was not returned by the server."
          )
        }


        // ================================================
        // 2. CREATE AUCTION
        // ================================================

        const auctionResponse =
          await api.post(
            "/auctions",
            {
              productId:
                Number(
                  createdProductId
                ),

              categoryId:
                Number(
                  formData.categoryId
                ),

              startPrice:
                Number(
                  formData.startPrice
                ),

              minIncrease:
                Number(
                  formData.minIncrease
                ),

              startTime:
                new Date(
                  formData.startTime
                ).toISOString(),

              endTime:
                new Date(
                  formData.endTime
                ).toISOString(),
            }
          )


        const auction =
          auctionResponse.data
            ?.auction ??
          auctionResponse.data


        const createdAuctionId =
          auction?.auctionid ??
          auction?.AuctionID ??
          auction?.auctionId


        if (
          !createdAuctionId
        ) {
          throw new Error(
            "Auction ID was not returned by the server."
          )
        }


        // ================================================
        // 3. UPLOAD PRODUCT IMAGES
        // ================================================

        for (
          const image
          of images
        ) {
          const imageFormData =
            new FormData()


          imageFormData.append(
            "image",
            image.file
          )


          await api.post(
            `/product-images/product/${createdProductId}`,
            imageFormData
          )
        }


        // ================================================
        // SUCCESS
        // ================================================

        navigate(
          `/auctions/${createdAuctionId}`
        )

      } catch (error) {
        console.error(
          "Publish auction error:",
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
          error.message ||
          "Failed to publish auction."
        )

      } finally {
        setPublishing(false)
      }
    }


  // ====================================================
  // CONDITION LABEL
  // ====================================================

  const conditionLabel =
    formData.condition
      .replace("-", " ")
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      )


  // ====================================================
  // STEPS
  // ====================================================

  const steps = [
    [
      "1",
      "Item Details",
      "Basic information",
    ],

    [
      "2",
      "Photos",
      "Add images",
    ],

    [
      "3",
      "Pricing",
      "Set your auction",
    ],

    [
      "4",
      "Review",
      "Check and publish",
    ],
  ]


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
              to="/sell-item"
              className="flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium"
            >
              <CirclePlus size={18} />
              Sell an Item
            </Link>

          </nav>


          <div className="my-6 border-t border-gray-200" />


          <nav className="space-y-2">

            <Link
              to="#"
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="flex items-center gap-3">
                <MessageSquare size={18} />
                Messages
              </span>
            </Link>


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
                List your unique items and reach buyers through AuctionX.
              </p>

            </div>

          </div>

        </aside>


        {/* =================================================
            MAIN
        ================================================= */}

        <section className="px-8 py-8">


          {/* HEADER */}

          <div>

            <h1 className="text-5xl font-semibold tracking-tight">
              Sell an Item
            </h1>


            <p className="mt-2 text-gray-500">
              List your item and start an auction.
            </p>

          </div>


          {/* =================================================
              STEPS
          ================================================= */}

          <div className="mt-7 grid grid-cols-4">

            {steps.map(
              (
                [
                  number,
                  title,
                  subtitle,
                ],
                index
              ) => {
                const stepNumber =
                  index + 1

                const completed =
                  stepNumber <
                  step

                const active =
                  stepNumber ===
                  step


                return (
                  <div
                    key={number}
                  >

                    <div className="flex items-center">

                      <div
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-sm

                          ${
                            active ||
                            completed
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-500"
                          }
                        `}
                      >
                        {completed ? (
                          <Check
                            size={16}
                          />
                        ) : (
                          number
                        )}
                      </div>


                      {index < 3 && (
                        <div
                          className={`
                            mx-3
                            h-px
                            flex-1

                            ${
                              step >
                              stepNumber
                                ? "bg-black"
                                : "bg-gray-200"
                            }
                          `}
                        />
                      )}

                    </div>


                    <div className="mt-2">

                      <p
                        className={`
                          text-sm
                          font-medium

                          ${
                            active
                              ? "text-black"
                              : "text-gray-600"
                          }
                        `}
                      >
                        {title}
                      </p>


                      <p className="mt-1 text-xs text-gray-500">
                        {subtitle}
                      </p>

                    </div>

                  </div>
                )
              }
            )}

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
              PAGE GRID
          ================================================= */}

          <div className="mt-7 grid grid-cols-1 gap-7 xl:grid-cols-[1fr_350px]">


            {/* =================================================
                FORM CONTENT
            ================================================= */}

            <section className="rounded-xl border border-gray-200 p-6">


              {/* =================================================
                  STEP 1 - ITEM DETAILS
              ================================================= */}

              {step === 1 && (
                <>

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Tag
                        size={17}
                      />
                    </div>


                    <h2 className="text-xl font-semibold">
                      Item Information
                    </h2>

                  </div>


                  {/* TITLE */}

                  <div className="mt-6">

                    <label className="mb-2 block text-sm font-medium">
                      Title{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>


                    <input
                      type="text"
                      name="title"
                      value={
                        formData.title
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Rolex Submariner Date"
                      className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                    />

                  </div>


                  {/* CATEGORY / BRAND / MODEL */}

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_0.7fr_0.7fr]">

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Category{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>


                      <div className="relative">

                        <select
                          name="categoryId"
                          value={
                            formData.categoryId
                          }
                          onChange={
                            handleChange
                          }
                          disabled={
                            loadingCategories
                          }
                          className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none focus:border-black"
                        >

                          <option value="">
                            {loadingCategories
                              ? "Loading categories..."
                              : "Select a category"
                            }
                          </option>


                          {categories.map(
                            (category) => (
                              <option
                                key={
                                  category.categoryid
                                }
                                value={
                                  category.categoryid
                                }
                              >
                                {category.name}
                              </option>
                            )
                          )}

                        </select>


                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        />

                      </div>

                    </div>


                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Brand
                      </label>


                      <input
                        type="text"
                        name="brand"
                        value={
                          formData.brand
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. Rolex"
                        className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                      />

                    </div>


                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Model
                      </label>


                      <input
                        type="text"
                        name="model"
                        value={
                          formData.model
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. Submariner"
                        className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                      />

                    </div>

                  </div>


                  {/* DESCRIPTION */}

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-medium">
                      Description{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>


                    <textarea
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={
                        handleChange
                      }
                      maxLength={2000}
                      placeholder="Provide a detailed description of your item..."
                      className="min-h-[120px] w-full resize-none rounded-lg border border-gray-300 p-4 text-sm outline-none focus:border-black"
                    />


                    <p className="mt-1 text-right text-xs text-gray-500">
                      {formData.description.length}/2000
                    </p>

                  </div>


                  {/* CONDITION */}

                  <div className="mt-5">

                    <label className="mb-3 block text-sm font-medium">
                      Condition{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>


                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

                      {[
                        [
                          "new",
                          "New",
                          "Never used",
                        ],

                        [
                          "like-new",
                          "Like New",
                          "Minimal signs",
                        ],

                        [
                          "excellent",
                          "Excellent",
                          "Light signs",
                        ],

                        [
                          "good",
                          "Good",
                          "Used condition",
                        ],

                        [
                          "fair",
                          "Fair",
                          "Major signs",
                        ],
                      ].map(
                        ([
                          value,
                          title,
                          subtitle,
                        ]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setFormData(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  condition:
                                    value,
                                })
                              )
                            }
                            className={`
                              rounded-lg
                              border
                              p-4
                              text-left
                              transition

                              ${
                                formData.condition ===
                                value
                                  ? "border-black bg-gray-50"
                                  : "border-gray-200"
                              }
                            `}
                          >

                            <div className="flex items-start gap-3">

                              <span
                                className={`
                                  mt-1
                                  flex
                                  h-4
                                  w-4
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  border

                                  ${
                                    formData.condition ===
                                    value
                                      ? "border-black bg-black"
                                      : "border-gray-300"
                                  }
                                `}
                              >
                                {formData.condition ===
                                  value && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </span>


                              <div>

                                <p className="text-sm font-medium">
                                  {title}
                                </p>


                                <p className="mt-1 text-xs leading-4 text-gray-500">
                                  {subtitle}
                                </p>

                              </div>

                            </div>

                          </button>
                        )
                      )}

                    </div>

                  </div>


                  {/* ADDITIONAL */}

                  <div className="mt-6">

                    <h3 className="text-sm font-medium">
                      Additional Details (optional)
                    </h3>


                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">

                      <div>

                        <label className="mb-2 block text-sm">
                          Year
                        </label>

                        <input
                          type="text"
                          name="year"
                          value={
                            formData.year
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="e.g. 2022"
                          className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                        />

                      </div>


                      <div>

                        <label className="mb-2 block text-sm">
                          Material
                        </label>

                        <input
                          type="text"
                          name="material"
                          value={
                            formData.material
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="e.g. Steel"
                          className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                        />

                      </div>


                      <div>

                        <label className="mb-2 block text-sm">
                          Box & Papers
                        </label>

                        <select
                          name="boxPapers"
                          value={
                            formData.boxPapers
                          }
                          onChange={
                            handleChange
                          }
                          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none focus:border-black"
                        >
                          <option value="">
                            Select
                          </option>

                          <option value="yes">
                            Yes
                          </option>

                          <option value="no">
                            No
                          </option>
                        </select>

                      </div>


                      <div>

                        <label className="mb-2 block text-sm">
                          Reference Number
                        </label>

                        <input
                          type="text"
                          name="referenceNumber"
                          value={
                            formData.referenceNumber
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="e.g. 126610LN"
                          className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                        />

                      </div>

                    </div>

                  </div>

                </>
              )}


              {/* =================================================
                  STEP 2 - PHOTOS
              ================================================= */}

              {step === 2 && (
                <>

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Camera
                        size={17}
                      />
                    </div>


                    <div>

                      <h2 className="text-xl font-semibold">
                        Item Photos
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Add clear photos of your item.
                      </p>

                    </div>

                  </div>


                  <label className="mt-7 flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 text-center transition hover:border-black">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

                      <Upload
                        size={24}
                      />

                    </div>


                    <h3 className="mt-4 font-semibold">
                      Upload product photos
                    </h3>


                    <p className="mt-2 text-sm text-gray-500">
                      JPG, PNG or WEBP · Maximum 5MB per image
                    </p>


                    <span className="mt-5 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white">
                      Choose Photos
                    </span>


                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={
                        handleImagesChange
                      }
                      className="hidden"
                    />

                  </label>


                  {images.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">

                      {images.map(
                        (
                          image,
                          index
                        ) => (
                          <div
                            key={`${image.file.name}-${index}`}
                            className="group relative overflow-hidden rounded-xl bg-gray-100"
                          >

                            <img
                              src={
                                image.preview
                              }
                              alt=""
                              className="h-48 w-full object-cover"
                            />


                            {index === 0 && (
                              <span className="absolute left-3 top-3 rounded-md bg-black px-2 py-1 text-xs text-white">
                                Main Photo
                              </span>
                            )}


                            <button
                              type="button"
                              onClick={() =>
                                removeImage(
                                  index
                                )
                              }
                              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>
                        )
                      )}


                      <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300">

                        <ImagePlus
                          size={25}
                        />


                        <span className="mt-2 text-sm font-medium">
                          Add More
                        </span>


                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={
                            handleImagesChange
                          }
                          className="hidden"
                        />

                      </label>

                    </div>
                  )}

                </>
              )}


              {/* =================================================
                  STEP 3 - PRICING
              ================================================= */}

              {step === 3 && (
                <>

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Gavel
                        size={17}
                      />
                    </div>


                    <div>

                      <h2 className="text-xl font-semibold">
                        Auction Pricing
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Set the price and auction schedule.
                      </p>

                    </div>

                  </div>


                  <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Starting Price{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>


                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          $
                        </span>


                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          name="startPrice"
                          value={
                            formData.startPrice
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="0.00"
                          className="h-11 w-full rounded-lg border border-gray-300 pl-8 pr-4 text-sm outline-none focus:border-black"
                        />

                      </div>

                    </div>


                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Minimum Bid Increase{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>


                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          $
                        </span>


                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          name="minIncrease"
                          value={
                            formData.minIncrease
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="0.00"
                          className="h-11 w-full rounded-lg border border-gray-300 pl-8 pr-4 text-sm outline-none focus:border-black"
                        />

                      </div>

                    </div>

                  </div>


                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        Start Time{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>


                      <input
                        type="datetime-local"
                        name="startTime"
                        value={
                          formData.startTime
                        }
                        onChange={
                          handleChange
                        }
                        className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                      />

                    </div>


                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        End Time{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>


                      <input
                        type="datetime-local"
                        name="endTime"
                        value={
                          formData.endTime
                        }
                        onChange={
                          handleChange
                        }
                        className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-black"
                      />

                    </div>

                  </div>


                  <div className="mt-6 rounded-xl bg-gray-50 p-5">

                    <div className="flex gap-3">

                      <Lightbulb
                        size={21}
                        className="shrink-0"
                      />


                      <div>

                        <p className="text-sm font-medium">
                          Pricing Tip
                        </p>


                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          Choose a realistic starting price and minimum increase. Buyers will not be able to place bids below the amount allowed by your auction settings.
                        </p>

                      </div>

                    </div>

                  </div>

                </>
              )}


              {/* =================================================
                  STEP 4 - REVIEW
              ================================================= */}

              {step === 4 && (
                <>

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Eye
                        size={17}
                      />
                    </div>


                    <div>

                      <h2 className="text-xl font-semibold">
                        Review Listing
                      </h2>


                      <p className="mt-1 text-sm text-gray-500">
                        Check your auction before publishing.
                      </p>

                    </div>

                  </div>


                  <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">

                    <div className="overflow-hidden rounded-xl bg-gray-100">

                      {images[0] ? (
                        <img
                          src={
                            images[0].preview
                          }
                          alt={
                            formData.title
                          }
                          className="h-60 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-60 items-center justify-center">
                          <Camera
                            size={30}
                            className="text-gray-300"
                          />
                        </div>
                      )}

                    </div>


                    <div>

                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {selectedCategory
                          ?.name ||
                          "Category"
                        }
                      </p>


                      <h3 className="mt-2 text-3xl font-semibold">
                        {formData.title}
                      </h3>


                      <p className="mt-3 capitalize text-sm text-gray-500">
                        {conditionLabel} Condition
                      </p>


                      <p className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-600">
                        {formData.description}
                      </p>


                      <div className="mt-6 grid grid-cols-2 gap-4">

                        <div className="rounded-lg bg-gray-50 p-4">

                          <p className="text-xs text-gray-500">
                            Starting Price
                          </p>


                          <p className="mt-1 text-xl font-semibold">
                            $
                            {Number(
                              formData.startPrice
                            ).toLocaleString()}
                          </p>

                        </div>


                        <div className="rounded-lg bg-gray-50 p-4">

                          <p className="text-xs text-gray-500">
                            Minimum Increase
                          </p>


                          <p className="mt-1 text-xl font-semibold">
                            $
                            {Number(
                              formData.minIncrease
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>


                  <div className="mt-7 border-t border-gray-200 pt-6">

                    <h3 className="font-semibold">
                      Auction Schedule
                    </h3>


                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div className="rounded-lg border border-gray-200 p-4">

                        <p className="text-xs text-gray-500">
                          Starts
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {new Date(
                            formData.startTime
                          ).toLocaleString()}
                        </p>

                      </div>


                      <div className="rounded-lg border border-gray-200 p-4">

                        <p className="text-xs text-gray-500">
                          Ends
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {new Date(
                            formData.endTime
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>

                  </div>

                </>
              )}


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="mt-8 flex flex-col justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">

                {step > 1 ? (
                  <button
                    type="button"
                    onClick={
                      handleBack
                    }
                    disabled={
                      publishing
                    }
                    className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 px-8 text-sm font-medium transition hover:bg-gray-50"
                  >
                    <ArrowLeft
                      size={17}
                    />

                    Back
                  </button>
                ) : (
                  <Link
                    to="/profile"
                    className="flex h-12 items-center justify-center rounded-lg border border-gray-300 px-8 text-sm font-medium transition hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                )}


                {step < 4 ? (
                  <button
                    type="button"
                    onClick={
                      handleNext
                    }
                    className="flex h-12 items-center justify-center gap-3 rounded-lg bg-black px-8 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    {step === 1 &&
                      "Continue to Photos"
                    }

                    {step === 2 &&
                      "Continue to Pricing"
                    }

                    {step === 3 &&
                      "Review Listing"
                    }


                    <ChevronRight
                      size={17}
                    />

                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handlePublish
                    }
                    disabled={
                      publishing
                    }
                    className={`
                      flex
                      h-12
                      items-center
                      justify-center
                      gap-3
                      rounded-lg
                      bg-black
                      px-8
                      text-sm
                      font-medium
                      text-white
                      transition
                      hover:bg-gray-800

                      ${
                        publishing
                          ? "cursor-wait opacity-60"
                          : ""
                      }
                    `}
                  >
                    {publishing
                      ? "Publishing..."
                      : "Publish Auction"
                    }

                    {!publishing && (
                      <Gavel
                        size={17}
                      />
                    )}

                  </button>
                )}

              </div>

            </section>


            {/* =================================================
                RIGHT
            ================================================= */}

            <aside>


              {/* TIPS */}

              <div className="rounded-xl border border-gray-200 p-5">

                <div className="flex items-center gap-3">

                  <Lightbulb
                    size={22}
                  />

                  <h3 className="text-lg font-semibold">
                    Tips for a Successful Listing
                  </h3>

                </div>


                <div className="mt-5 space-y-5">

                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Camera
                        size={18}
                      />
                    </div>


                    <div>

                      <p className="text-sm font-medium">
                        Use clear photos
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Show your item from multiple angles.
                      </p>

                    </div>

                  </div>


                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Pencil
                        size={18}
                      />
                    </div>


                    <div>

                      <p className="text-sm font-medium">
                        Write a detailed description
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Include important details about the item.
                      </p>

                    </div>

                  </div>


                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Gavel
                        size={18}
                      />
                    </div>


                    <div>

                      <p className="text-sm font-medium">
                        Set a realistic price
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        A good starting price can attract more bidders.
                      </p>

                    </div>

                  </div>


                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Wrench
                        size={18}
                      />
                    </div>


                    <div>

                      <p className="text-sm font-medium">
                        Describe the condition
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Be transparent about signs of use.
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  PREVIEW
              ================================================= */}

              <div className="mt-4 rounded-xl border border-gray-200 p-5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <Eye
                      size={22}
                    />

                    <h3 className="text-lg font-semibold">
                      Listing Preview
                    </h3>

                  </div>


                  <span className="rounded-md bg-gray-50 px-3 py-1 text-xs text-gray-500">
                    Preview
                  </span>

                </div>


                <div className="mt-5 overflow-hidden rounded-lg bg-gray-100">

                  {images[0] ? (
                    <img
                      src={
                        images[0].preview
                      }
                      alt={
                        formData.title
                      }
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 flex-col items-center justify-center text-gray-400">

                      <Camera
                        size={27}
                      />

                      <p className="mt-2 text-xs">
                        Your main photo will appear here
                      </p>

                    </div>
                  )}

                </div>


                <h4 className="mt-4 text-xl font-semibold">
                  {formData.title ||
                    "Your item title"
                  }
                </h4>


                <p className="mt-2 text-sm text-gray-500">

                  {selectedCategory
                    ?.name ||
                    "Category"
                  }

                  {formData.brand && (
                    <>
                      {" · "}
                      {formData.brand}
                    </>
                  )}

                  {" · "}

                  {conditionLabel} Condition

                </p>


                <p className="mt-4 text-2xl font-semibold">
                  {formData.startPrice
                    ? `$${Number(
                        formData.startPrice
                      ).toLocaleString()}`
                    : "$0"
                  }
                </p>


                <p className="mt-1 text-xs text-gray-500">
                  Starting bid · 0 bids
                </p>

              </div>

            </aside>

          </div>

        </section>

      </div>

    </main>
  )
}


export default SellItem