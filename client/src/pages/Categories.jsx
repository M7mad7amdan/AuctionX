import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import api from "../api/axios"


// ======================================================
// CATEGORY IMAGES
// Images are UI only - category data comes from database
// ======================================================

const categoryImages = {

  Watches:
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",

  Cars:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85",

  Art:
    "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=85",

  Jewelry:
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85",

  Handbags:
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",

  Sneakers:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",

  Collectibles:
    "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=85",

  "Wine & Spirits":
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=85",

  Vintage:
    "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=85",

  "Home & Design":
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=85",

  Fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85",

  Memorabilia:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85",

}


// ======================================================
// DEFAULT CATEGORY IMAGE
// Used if admin creates a new category
// ======================================================

const defaultCategoryImage =
  "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=1200&q=85"


const Categories = () => {

  // ====================================================
  // STATES
  // ====================================================

  const [
    categories,
    setCategories,
  ] = useState([])


  const [
    liveAuctionsCount,
    setLiveAuctionsCount,
  ] = useState(0)


  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState("")


  // ====================================================
  // GET CATEGORIES + LIVE AUCTIONS COUNT
  // ====================================================

  useEffect(() => {

    const fetchData = async () => {

      try {

        setLoading(true)

        setError("")


        // Run both requests at the same time
        const [
          categoriesResponse,
          liveAuctionsResponse,
        ] = await Promise.all([

          api.get(
            "/categories"
          ),

          api.get(
            "/auctions",
            {
              params: {
                status: "live",
                page: 1,
                limit: 1,
              },
            }
          ),

        ])


        // ===============================================
        // CATEGORIES
        // ===============================================

        const categoriesData =
          Array.isArray(
            categoriesResponse.data
          )
            ? categoriesResponse.data
            : categoriesResponse.data?.categories || []


        setCategories(
          categoriesData
        )


        // ===============================================
        // LIVE AUCTIONS COUNT
        // ===============================================

        setLiveAuctionsCount(
          Number(
            liveAuctionsResponse
              .data
              ?.pagination
              ?.totalAuctions
          ) || 0
        )


      } catch (error) {

        console.error(
          "Get categories data error:",
          error
        )


        setError(
          error.response
            ?.data
            ?.error ||
          "Failed to load categories."
        )


      } finally {

        setLoading(false)

      }

    }


    fetchData()

  }, [])


  return (

    <main className="pt-28 pb-14">

      <div className="mx-auto max-w-7xl px-6">


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="flex flex-col justify-between gap-8 md:flex-row md:items-end">


          {/* HEADER LEFT */}

          <div>

            <p className="text-sm uppercase tracking-[0.25em] text-gray-600">
              Browse
            </p>


            <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-6xl">
              Categories
            </h1>


            <p className="mt-3 text-lg text-gray-600">
              Explore a world of unique items. Find what inspires you.
            </p>

          </div>


          {/* HEADER STATS */}

          <div className="flex items-center gap-8">


            {/* LIVE AUCTIONS */}

            <div>

              <p className="text-3xl font-semibold">

                {loading
                  ? "—"
                  : liveAuctionsCount.toLocaleString()
                }

              </p>


              <p className="mt-1 text-sm text-gray-500">
                Live Auctions
              </p>

            </div>


            {/* DIVIDER */}

            <div className="h-12 w-px bg-gray-300" />


            {/* CATEGORIES */}

            <div>

              <p className="text-3xl font-semibold">

                {loading
                  ? "—"
                  : categories.length
                }

              </p>


              <p className="mt-1 text-sm text-gray-500">
                Categories
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <section className="py-24 text-center">

            <p className="text-sm text-gray-500">
              Loading categories...
            </p>

          </section>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading &&
          error && (

            <section className="mt-10">

              <div className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </div>

            </section>

          )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          categories.length === 0 && (

            <section className="py-24 text-center">

              <p className="text-sm font-medium text-gray-700">
                No categories found.
              </p>


              <p className="mt-2 text-xs text-gray-400">
                Categories will appear here once they are added.
              </p>

            </section>

          )}


        {/* =================================================
            CATEGORY GRID
        ================================================= */}

        {!loading &&
          !error &&
          categories.length > 0 && (

            <section className="mt-10">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">


                {categories.map(
                  (category) => {

                    // PostgreSQL / pg returns lowercase keys
                    const categoryId =
                      category.categoryid


                    const categoryName =
                      category.name


                    const auctionCount =
                      Number(
                        category.auctioncount
                      ) || 0


                    const image =
                      categoryImages[
                        categoryName
                      ] ||
                      defaultCategoryImage


                    return (

                      <Link
                        key={categoryId}
                        to={`/auctions?categoryId=${categoryId}`}
                        className="
                          group
                          relative
                          h-[240px]
                          overflow-hidden
                          rounded-xl
                          bg-black
                        "
                      >


                        {/* ===================================
                            IMAGE
                        =================================== */}

                        <img
                          src={image}
                          alt={categoryName}
                          className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-500
                            group-hover:scale-105
                          "
                        />


                        {/* ===================================
                            DARK GRADIENT
                        =================================== */}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />


                        {/* ===================================
                            CONTENT
                        =================================== */}

                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">


                          {/* CATEGORY INFO */}

                          <div className="text-white">

                            <h2 className="text-2xl font-medium">
                              {categoryName}
                            </h2>


                            <p className="mt-1 text-sm text-white/80">

                              {auctionCount.toLocaleString()}{" "}

                              {auctionCount === 1
                                ? "item"
                                : "items"
                              }

                            </p>

                          </div>


                          {/* ===================================
                              ARROW
                          =================================== */}

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-white
                              text-white
                              transition
                              duration-300
                              group-hover:bg-white
                              group-hover:text-black
                            "
                          >

                            <ArrowRight
                              size={18}
                            />

                          </div>

                        </div>

                      </Link>

                    )

                  }
                )}

              </div>

            </section>

          )}

      </div>

    </main>

  )

}


export default Categories