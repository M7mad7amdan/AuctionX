import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom"

import NavBar from "./components/NavBar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"

import HomePage from "./pages/HomePage"
import Explore from "./pages/Explore"
import AuctionDetails from "./pages/AuctionDetails"
import Categories from "./pages/Categories"
import CategoryDetails from "./pages/CategoryDetails"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MyListings from "./pages/MyListings"
import Checkout from "./pages/Checkout"
import MyBids from "./pages/MyBids"
import SellItem from "./pages/SellItem"


const AppContent = () => {
  const location = useLocation()

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register"

  return (
    <div className="min-h-screen bg-white text-black">

      {!hideLayout && <NavBar />}

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/auctions"
          element={<Explore />}
        />

        <Route
          path="/auctions/:id"
          element={<AuctionDetails />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route
          path="/categories/:id"
          element={<CategoryDetails />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            PROTECTED ROUTES
        ========================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bids"
          element={
            <ProtectedRoute>
              <MyBids />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell-item"
          element={
            <ProtectedRoute>
              <SellItem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout/:auctionId"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

      </Routes>

      {!hideLayout && <Footer />}

    </div>
  )
}


function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App