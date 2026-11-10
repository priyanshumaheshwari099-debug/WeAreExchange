
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar/Navbar";
import "./RequestSwap.css";

const API = "http://localhost:5000";

function RequestSwap() {
    const { id } = useParams();
    const navigate = useNavigate();

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

    const [targetItem, setTargetItem] = useState(null);
    const [myItems, setMyItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        let active = true;

        const loadTarget = async () => {
            try {
                const res = await axios.get(`${API}/api/clothing/${id}`);
                if (active) setTargetItem(res.data);
            } catch (error) {
                console.error("TARGET ITEM ERROR:", error);
                if (active) setTargetItem(null);
            } finally {
                if (active) setLoading(false);
            }
        };

        if (id) loadTarget();
        else setLoading(false);

        return () => {
            active = false;
        };
    }, [id]);

    useEffect(() => {
        if (!userId) {
            setMyItems([]);
            return;
        }

        let active = true;
        const timer = setTimeout(async () => {
            try {
                setSearching(true);
                const res = await axios.get(
                    `${API}/api/clothing/my/${userId}/search`,
                    { params: { q: search, page: 1, limit: 20 } }
                );
                if (active) setMyItems(res.data.clothes || []);
            } catch (error) {
                console.error("MY CLOTHES ERROR:", error);
                if (active) setMyItems([]);
            } finally {
                if (active) setSearching(false);
            }
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [search, userId]);

    const sendRequest = async () => {
        const activeUser = getUser();
        const activeUserId = activeUser?.id || activeUser?._id;

        if (!activeUserId) {
            toast.info("Please sign up to request a swap!", {
                toastId: "guest-swap",
                autoClose: 3000
            });
            setTimeout(() => navigate("/signup"), 3000);
            return;
        }

        if (!targetItem?._id) {
            toast.error("Requested item not found");
            return;
        }

        if (!selectedItem?._id) {
            toast.error("Please select a clothing item first");
            return;
        }

        if (selectedItem._id === targetItem._id) {
            toast.error("You cannot swap an item with itself");
            return;
        }

        try {
            setSending(true);

            const res = await axios.post(`${API}/api/swapping/request`, {
                requester: activeUserId,
                offeredItem: selectedItem._id,
                requestedItem: targetItem._id
            });

            toast.success(res.data.message || "Swap request sent successfully");
            setTimeout(() => navigate("/swap-requests"), 1000);
        } catch (error) {
            console.error("SEND SWAP ERROR:", error.response?.data || error);
            toast.error(
                error.response?.data?.message || "Failed to send swap request"
            );
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="rs-loading">
                <div className="rs-loader"></div>
                <span>LOADING SWAP</span>
            </div>
        );
    }

    if (!targetItem) {
        return (
            <div className="rs-empty">
                <h2>Product not found</h2>
                <button onClick={() => navigate("/browse")}>BACK TO BROWSE</button>
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <div className="rs-page">
                <button className="rs-back" onClick={() => navigate(-1)}>
                    ← Back to product
                </button>

                <div className="rs-heading">
                    <span>WEAREXCHANGE</span>
                    <h1>Make the swap.</h1>
                    <p>Choose one of your clothes to exchange for this item.</p>
                </div>

                <section className="rs-target">
                    <div className="rs-section-title">
                        <span>YOU WANT</span>
                        <h2>The item you're interested in</h2>
                    </div>

                    <div className="rs-target-card">
                        <div className="rs-target-image">
                            <img
                                src={targetItem.images?.[0] ? `${API}${targetItem.images[0]}` : ""}
                                alt={targetItem.title}
                            />
                        </div>

                        <div className="rs-target-info">
                            <span className="rs-category">{targetItem.category}</span>
                            <p className="rs-brand">{targetItem.brand || "NO BRAND"}</p>
                            <h2>{targetItem.title}</h2>

                            <div className="rs-details">
                                <div>
                                    <span>SIZE</span>
                                    <strong>{targetItem.size || "N/A"}</strong>
                                </div>
                                <div>
                                    <span>CONDITION</span>
                                    <strong>{targetItem.condition || "N/A"}</strong>
                                </div>
                                <div>
                                    <span>VALUE</span>
                                    <strong>₹{targetItem.value || 0}</strong>
                                </div>
                            </div>

                            <p className="rs-location">
                                📍 {targetItem.city || ""}
                                {targetItem.state ? `, ${targetItem.state}` : ""}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rs-my-section">
                    <div className="rs-my-heading">
                        <div>
                            <span>YOUR CLOSET</span>
                            <h2>Choose what you'll offer</h2>
                        </div>
                        <div className="rs-count">
                            {searching ? "SEARCHING..." : `${myItems.length} ITEMS`}
                        </div>
                    </div>

                    <div className="rs-search">
                        <span>⌕</span>
                        <input
                            type="text"
                            placeholder="Search your clothes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {searching ? (
                        <div className="rs-no-items">
                            <h3>Searching...</h3>
                        </div>
                    ) : userId && myItems.length === 0 ? (
                        <div className="rs-no-items">
                            <h3>No clothing found</h3>
                            <p>Try another search or add a new clothing item.</p>
                        </div>
                    ) : userId ? (
                        <div className="rs-grid">
                            {myItems.map((item) => (
                                <div
                                    key={item._id}
                                    className={`rs-item ${selectedItem?._id === item._id ? "selected" : ""}`}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className="rs-item-image">
                                        <img
                                            src={item.images?.[0] ? `${API}${item.images[0]}` : ""}
                                            alt={item.title}
                                        />
                                        <div className="rs-select">
                                            {selectedItem?._id === item._id ? "✓" : ""}
                                        </div>
                                    </div>

                                    <div className="rs-item-info">
                                        <span>{item.brand || "NO BRAND"}</span>
                                        <h3>{item.title}</h3>
                                        <div>
                                            <small>{item.size}</small>
                                            <small>{item.condition}</small>
                                        </div>
                                        <strong>₹{item.value || 0}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rs-no-items">
                            <h3>Browse clothes and get ready to swap</h3>
                            <p>Sign up when you're ready to send your swap request.</p>
                        </div>
                    )}
                </section>

                <div className="rs-bottom">
                    <div>
                        <span>READY TO EXCHANGE?</span>
                        <p>
                            {selectedItem
                                ? `You selected "${selectedItem.title}"`
                                : "Select one item from your closet"}
                        </p>
                    </div>

                    <button
                        className="pd-swap"
                        disabled={sending}
                        onClick={sendRequest}
                    >
                        {sending ? "SENDING..." : "SEND SWAP REQUEST →"}
                    </button>
                </div>
            </div>
        </>
    );
}

export default RequestSwap;
