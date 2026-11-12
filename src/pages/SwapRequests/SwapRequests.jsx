
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar/Navbar";
import "./SwapRequests.css";

function SwapRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API = "https://wearexchange-backend.onrender.com";

    const getUser = () => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "null");
            const googleUser = JSON.parse(localStorage.getItem("googleUser") || "null");

            if (user?.id || user?._id) return user;
            if (googleUser?.id || googleUser?._id) return googleUser;

            return null;
        } catch {
            return null;
        }
    };

    const user = getUser();
    const userId = user?.id || user?._id;

    const getImage = (image) => {
        if (!image) return "";

        if (Array.isArray(image)) image = image[0];
        if (!image) return "";

        if (image.startsWith("http")) return image;

        return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
    };

    useEffect(() => {
        let active = true;

        const loadRequests = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(
                    `${API}/api/swapping/received/${userId}`
                );

                if (active) {
                    setRequests(Array.isArray(res.data) ? res.data : []);
                }
            } catch (error) {
                console.error("Failed to load swap requests:", error);

                if (active) setRequests([]);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadRequests();

        return () => {
            active = false;
        };
    }, [userId]);

    const handleAccept = async (id) => {
        try {
            if (!id || id === ":swapId") {
                toast.error("Invalid swap request ID");
                return;
            }

            await axios.patch(
                `${API}/api/swapping/accept/${id}`,
                { userId }
            );

            console.log("Accept Swap ID:", id);

            toast.success("Swap accepted! Choose delivery method.");
            navigate(`/delivery/${id}`);
        } catch (error) {
            console.error("Accept swap error:", error.response?.data || error);

            toast.error(
                error.response?.data?.message || "Could not accept request"
            );
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.patch(
                `${API}/api/swapping/reject/${id}`,
                { userId }
            );

            setRequests((prev) =>
                prev.filter((item) => item._id !== id)
            );

            toast.success("Swap request rejected");
        } catch (error) {
            console.error("Reject error:", error);

            toast.error(
                error.response?.data?.message || "Could not reject request"
            );
        }
    };

    const openChat = (swapId) => {
        if (!userId) return;

        navigate(`/chat/${swapId}`);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="swap-loading">Loading requests...</div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="swap-page">
                <div className="swap-header">
                    <div>
                        <span>EXCHANGE ACTIVITY</span>
                        <h1>Swap Requests</h1>
                        <p>
                            Review clothing swap requests sent to your listings.
                        </p>
                    </div>

                    <div className="swap-count">
                        {userId ? requests.length : 0}
                        <small>Pending</small>
                    </div>
                </div>

                {!userId ? (
                    <div className="swap-empty">
                        <div className="swap-empty-icon">⇄</div>
                        <h2>No swap requests yet</h2>
                        <p>
                            Your clothing exchange requests will appear here.
                        </p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="swap-empty">
                        <div className="swap-empty-icon">⇄</div>
                        <h2>No pending requests</h2>
                        <p>
                            When someone wants to exchange clothing with you,
                            their request will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="swap-list">
                        {requests.map((request, index) => (
                            <div className="swap-request-card" key={request._id}>
                                <div className="request-number">
                                    {String(index + 1).padStart(2, "0")}
                                </div>

                                <div className="swap-items">
                                    <div className="swap-item">
                                        <div className="swap-image">
                                            <img
                                                src={getImage(request.offeredItem?.images)}
                                                alt={
                                                    request.offeredItem?.title ||
                                                    "Clothing Item"
                                                }
                                            />
                                        </div>

                                        <div className="swap-item-info">
                                            <span>THEY OFFER</span>
                                            <h3>
                                                {request.offeredItem?.title ||
                                                    "Clothing Item"}
                                            </h3>
                                            <p>
                                                {request.offeredItem?.brand ||
                                                    "No brand"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="swap-arrow">⇄</div>

                                    <div className="swap-item">
                                        <div className="swap-image">
                                            <img
                                                src={getImage(request.requestedItem?.images)}
                                                alt={
                                                    request.requestedItem?.title ||
                                                    "Your Item"
                                                }
                                            />
                                        </div>

                                        <div className="swap-item-info">
                                            <span>THEY WANT</span>
                                            <h3>
                                                {request.requestedItem?.title ||
                                                    "Your Item"}
                                            </h3>
                                            <p>
                                                {request.requestedItem?.brand ||
                                                    "No brand"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="swap-actions">
                                    <button
                                        className="chat-btn"
                                        onClick={() => openChat(request._id)}
                                    >
                                        Chat
                                    </button>

                                    <button
                                        className="reject-btn"
                                        onClick={() =>
                                            handleReject(request._id)
                                        }
                                    >
                                        Reject
                                    </button>

                                    <button
                                        className="accept-btn"
                                        onClick={() =>
                                            handleAccept(request._id)
                                        }
                                    >
                                        Accept Swap
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}

export default SwapRequests;
