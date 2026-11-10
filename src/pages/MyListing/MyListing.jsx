import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Edit3,
    Trash2,
    Plus,
    Shirt,
    MapPin,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./MyListing.css";

const API = "http://localhost:5000";

function MyListings() {
    const [clothes, setClothes] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id || user?._id;

    // DELETE LISTING
    const deleteListing = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this listing?"
            )
        ) {
            return;
        }

        try {
            const res = await fetch(`${API}/api/clothing/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Failed to delete listing"
                );
            }

            setClothes((prev) =>
                prev.filter((item) => item._id !== id)
            );

            toast.success("Listing deleted successfully!");
        } catch (error) {
            console.log("Delete Error:", error);

            toast.error(
                error.message || "Failed to delete listing"
            );
        }
    };

    // GET MY LISTINGS
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        fetch(`${API}/api/clothing/my/${userId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch listings");
                }

                return res.json();
            })
            .then((data) => {
                setClothes(
                    Array.isArray(data) ? data : []
                );
            })
            .catch((error) => {
                console.log("My Listings Error:", error);

                toast.error("Failed to load listings");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    return (
        <>
            <Toaster position="top-right" />

            <Navbar />

            <main className="my-listings-page">

                {/* HERO */}
                <section className="my-listings-hero">

                    <Link
                        to="/admin"
                        className="back-dashboard"
                    >
                        <ArrowLeft size={16} />
                        BACK TO DASHBOARD
                    </Link>

                    <div className="my-listings-heading">

                        <span>
                            WEAREXCHANGE / ACCOUNT
                        </span>

                        <h1>
                            My <em>Listings.</em>
                        </h1>

                        <p>
                            Manage everything you've listed
                            on the WearExchange marketplace.
                        </p>

                    </div>

                    <Link
                        to="/add-clothing"
                        className="add-listing-btn"
                    >
                        <Plus size={18} />
                        ADD CLOTHING
                    </Link>

                </section>

                {/* CONTENT */}
                <section className="my-listings-content">

                    {/* TOP */}
                    <div className="listing-top">

                        <div>
                            <span>
                                YOUR COLLECTION
                            </span>

                            <h2>
                                {clothes.length}{" "}
                                {clothes.length === 1
                                    ? "Listing"
                                    : "Listings"}
                            </h2>
                        </div>

                        <div className="listing-user">

                            <div className="listing-avatar">
                                {user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                            </div>

                            <div>
                                <strong>
                                    {user?.name || "User"}
                                </strong>

                                <small>
                                    {user?.email || "Account"}
                                </small>
                            </div>

                        </div>

                    </div>

                    {/* LOADING */}
                    {loading ? (
                        <div className="listing-loading">

                            <div className="listing-spinner" />

                            <span>
                                LOADING YOUR LISTINGS...
                            </span>

                        </div>

                    ) : !clothes.length ? (

                        /* EMPTY */
                        <div className="listing-empty">

                            <div className="empty-icon">
                                <Shirt size={38} />
                            </div>

                            <span>
                                NO LISTINGS YET
                            </span>

                            <h2>
                                Your wardrobe is waiting.
                            </h2>

                            <p>
                                Add your first clothing item
                                and start exchanging with
                                the community.
                            </p>

                            <Link to="/add-clothing">
                                ADD YOUR FIRST LISTING
                                <span>↗</span>
                            </Link>

                        </div>

                    ) : (

                        /* LISTINGS */
                        <div className="my-listings-grid">

                            {clothes.map((item, index) => {

                                /*
                                 * IMPORTANT:
                                 * Backend stores images as:
                                 *
                                 * images: [
                                 *   "/uploads/filename.jpg"
                                 * ]
                                 *
                                 * So we use item.images[0]
                                 */

                                const image =
                                    item.images?.length > 0
                                        ? `${API}${item.images[0]}`
                                        : "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85";

                                const status =
                                    item.status ||
                                    "available";

                                return (
                                    <article
                                        className="my-listing-card"
                                        key={item._id}
                                    >

                                        {/* IMAGE */}
                                        <div className="listing-image-wrap">

                                            <img
                                                src={image}
                                                alt={
                                                    item.title ||
                                                    "Clothing"
                                                }
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85";
                                                }}
                                            />

                                            <span className="listing-number">
                                                {String(
                                                    index + 1
                                                ).padStart(2, "0")}
                                            </span>

                                        </div>

                                        {/* INFO */}
                                        <div className="my-listing-info">

                                            {/* CATEGORY + STATUS */}
                                            <div className="listing-category-row">

                                                <div className="listing-category">
                                                    {item.category ||
                                                        "Clothing"}
                                                </div>

                                                <span
                                                    className={`listing-badge ${status}`}
                                                >
                                                    {status ===
                                                    "not-available"
                                                        ? "NOT AVAILABLE"
                                                        : "AVAILABLE"}
                                                </span>

                                            </div>

                                            {/* TITLE */}
                                            <h3>
                                                {item.title ||
                                                    "Untitled Listing"}
                                            </h3>

                                            {/* BRAND */}
                                            {item.brand && (
                                                <p className="listing-brand">
                                                    {item.brand}
                                                </p>
                                            )}

                                            {/* LOCATION */}
                                            <div className="listing-location">

                                                <MapPin size={14} />

                                                {item.city ||
                                                    "Location"}
                                                ,{" "}
                                                {item.state ||
                                                    "India"}

                                            </div>

                                            {/* META */}
                                            <div className="listing-meta">

                                                <div>
                                                    <span>
                                                        SIZE
                                                    </span>

                                                    <strong>
                                                        {item.size ||
                                                            "N/A"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        CONDITION
                                                    </span>

                                                    <strong>
                                                        {item.condition ||
                                                            "N/A"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        VALUE
                                                    </span>

                                                    <strong>
                                                        {item.value
                                                            ? `₹${item.value}`
                                                            : "SWAP"}
                                                    </strong>
                                                </div>

                                            </div>

                                            {/* ACTIONS */}
                                            <div className="listing-actions">

                                                <Link
                                                    to={`/edit-listing/${item._id}`}
                                                    className="edit-listing"
                                                >
                                                    <Edit3
                                                        size={16}
                                                    />
                                                    EDIT
                                                </Link>

                                                <button
                                                    className="delete-listing"
                                                    onClick={() =>
                                                        deleteListing(
                                                            item._id
                                                        )
                                                    }
                                                >
                                                    <Trash2
                                                        size={16}
                                                    />
                                                    DELETE
                                                </button>

                                            </div>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </section>

            </main>

            <Footer />
        </>
    );
}

export default MyListings;