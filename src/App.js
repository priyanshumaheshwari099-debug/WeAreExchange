import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Delivery from "./pages/Delivery/Delivery";
import DeliveryOverview from "./pages/DeliveryOverview/DeliveryOverview";
import DeliveryConfirmation from "./pages/Delivery Confirmation/Delivery Confirmation";
import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import AddClothing from "./pages/AddClothing/AddClothing";
import AdminDashboard from "./pages/Admin  DashBoard/AdminDashboard";
import Browse from "./pages/Browse/browse";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Preloader from "./components/Preloader/Preloader";
import MyListings from "./pages/MyListing/MyListing";
import EditListing from "./pages/EditListing/EditListing";
import RequestSwap from "./pages/RequestSwap/RequestSwap";
import SwapRequests from "./pages/SwapRequests/SwapRequests";
import Chat from "./pages/Chat/Chat";
import NotificationMessages from "./pages/NotificationMessages/NotificationMessages";
import MySwaps from "./pages/MySwaps/MySwaps";
function ProtectedRoute({ children }) {
    let user = null;
    let googleUser = null;

    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
        googleUser = JSON.parse(localStorage.getItem("googleUser") || "null");
    } catch (error) {
        console.error("Login data error:", error);
    }

    const isLoggedIn = Boolean(
        user?.id || user?._id || googleUser?.id || googleUser?._id
    );

    if (!isLoggedIn) {
        return <Navigate to="/signup" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Preloader />
            <ScrollToTop />

            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="colored"
                newestOnTop
                closeOnClick
                pauseOnHover
            />

            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/request-swap/:id" element={<RequestSwap />} />
                <Route path="/add-clothing" element={<AddClothing />} />

                {/* Protected routes */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
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
                    path="/edit-listing/:id"
                    element={
                        <ProtectedRoute>
                            <EditListing />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/swap-requests"
                    element={
                        <ProtectedRoute>
                            <SwapRequests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/chat/:swapId"
                    element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/notification-messages"
                    element={
                        <ProtectedRoute>
                            <NotificationMessages />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Delivery overview */}
                <Route
                    path="/delivery"
                    element={
                        <ProtectedRoute>
                            <DeliveryOverview />
                        </ProtectedRoute>
                    }
                />

                {/* Individual swap delivery */}
                <Route
                    path="/delivery/:swapId"
                    element={
                        <ProtectedRoute>
                            <Delivery />
                        </ProtectedRoute>
                    }
                />

                {/* Delivery method confirmation */}
                <Route
                    path="/delivery-confirmation/:swapId"
                    element={
                        <ProtectedRoute>
                            <DeliveryConfirmation />
                        </ProtectedRoute>
                    }
                />

                {/* Keep this route last */}
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/my-swaps"   element={
        <ProtectedRoute>
            <MySwaps />
        </ProtectedRoute>
    }
/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;