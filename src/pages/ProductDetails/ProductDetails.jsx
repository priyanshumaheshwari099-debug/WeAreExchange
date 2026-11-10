
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ProductGallery from "../../components/ProductGallery/ProductGallery";
import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/clothing/${id}`)
            .then(({ data }) => setProduct(data))
            .catch(error => console.log("Product Error:", error))
            .finally(() => setLoading(false));
    }, [id]);

    const handleRequestSwap = () => {
        let user = null;
        let googleUser = null;

        try {
            user = JSON.parse(localStorage.getItem("user") || "null");
            googleUser = JSON.parse(localStorage.getItem("googleUser") || "null");
        } catch (error) {
            console.error("USER DATA ERROR:", error);
        }

        const isLoggedIn = !!(
            user?.id ||
            user?._id ||
            googleUser?.id ||
            googleUser?._id
        );

        if (!isLoggedIn) {
            toast.info("Please sign up or log in to request a swap!", {
                toastId: "login-required",
                autoClose: 3000
            });

            setTimeout(() => navigate("/signup"), 3000);
            return;
        }

        navigate(`/request-swap/${product._id}`);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="pd-loading">
                    <div className="pd-loader"></div>
                    <span>LOADING PRODUCT</span>
                </div>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Navbar />
                <div className="pd-empty">
                    <span>PRODUCT NOT FOUND</span>
                    <h2>This listing is no longer available.</h2>
                    <button onClick={() => navigate("/browse")}>
                        ← BACK TO BROWSE
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="pd-page">
                <button className="pd-back" onClick={() => navigate("/browse")}>
                    ← Back to Browse
                </button>

                <section className="pd-main">
                    <div className="pd-gallery">
                        <ProductGallery images={product.images || []} />
                    </div>

                    <div className="pd-info">
                        <div className="pd-category-row">
                            <span className="pd-category">
                                {product.category || "CLOTHING"}
                            </span>
                            <button className="pd-wishlist">♡</button>
                        </div>

                        <h1>{product.title}</h1>

                        {product.brand && (
                            <p className="pd-brand">{product.brand}</p>
                        )}

                        <div className="pd-price">
                            {product.value ? `₹${product.value}` : "SWAP"}
                        </div>

                        <div className="pd-line"></div>

                        <div className="pd-stats">
                            <div>
                                <span>SIZE</span>
                                <strong>{product.size || "N/A"}</strong>
                            </div>
                            <div>
                                <span>CONDITION</span>
                                <strong>{product.condition || "N/A"}</strong>
                            </div>
                            <div>
                                <span>VALUE</span>
                                <strong>
                                    {product.value ? `₹${product.value}` : "SWAP"}
                                </strong>
                            </div>
                        </div>

                        <div className="pd-location">
                            <span className="pd-location-icon">⌖</span>
                            <div>
                                <strong>{product.city || "Location not added"}</strong>
                                <small>{product.state || "India"}</small>
                            </div>
                        </div>

                        <div className="pd-actions">
                            <button
                                className="pd-swap"
                                onClick={handleRequestSwap}
                            >
                                ⇄ &nbsp; REQUEST SWAP
                            </button>
                            <button className="pd-action-heart">♡</button>
                        </div>

                        <div className="pd-info-box">
                            <div>
                                <span>♧</span>
                                <div>
                                    <strong>Sustainable Choice</strong>
                                    <small>Give clothes a longer life</small>
                                </div>
                            </div>
                            <div>
                                <span>↔</span>
                                <div>
                                    <strong>Swap, Don't Buy</strong>
                                    <small>Save money & resources</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pd-lower">
                    <div className="pd-tabs">
                        <span className="active">Details</span>
                        <span>Size & Fit</span>
                        <span>Shipping & Exchange</span>
                    </div>

                    <div className="pd-columns">
                        <div className="pd-card">
                            <h2>Product Details</h2>

                            <div className="pd-detail-row">
                                <span>Category</span>
                                <strong>{product.category || "N/A"}</strong>
                            </div>
                            <div className="pd-detail-row">
                                <span>Brand</span>
                                <strong>{product.brand || "Not specified"}</strong>
                            </div>
                            <div className="pd-detail-row">
                                <span>Size</span>
                                <strong>{product.size || "N/A"}</strong>
                            </div>
                            <div className="pd-detail-row">
                                <span>Condition</span>
                                <strong>{product.condition || "N/A"}</strong>
                            </div>
                            <div className="pd-detail-row">
                                <span>Estimated Value</span>
                                <strong>
                                    {product.value ? `₹${product.value}` : "Swap"}
                                </strong>
                            </div>

                            <div className="pd-description">
                                <h2>Condition Details</h2>
                                <p>
                                    {product.conditionDescription ||
                                        "No condition details provided."}
                                </p>
                            </div>

                            <div className="pd-description">
                                <h2>Description</h2>
                                <p>
                                    {product.description ||
                                        "No description provided for this listing."}
                                </p>
                            </div>
                        </div>

                        <div className="pd-card">
                            <h2>About This Listing</h2>

                            <div className="pd-listing">
                                <div className="pd-listing-icon">
                                    {product.title?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <strong>Community Member</strong>
                                    <span>WearExchange Seller</span>
                                </div>
                            </div>

                            <div className="pd-listing-info">
                                <div>
                                    <strong>✓</strong>
                                    <span>Community Listing</span>
                                </div>
                                <div>
                                    <strong>↔</strong>
                                    <span>Open for Swap</span>
                                </div>
                                <div>
                                    <strong>⌖</strong>
                                    <span>{product.city || "India"}</span>
                                </div>
                            </div>

                            <div className="pd-swap-box">
                                <h3>Want to swap instead of buying?</h3>
                                <p>
                                    Make an offer and exchange this item with
                                    someone in your community.
                                </p>
                                <button onClick={handleRequestSwap}>
                                    MAKE AN OFFER →
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

export default ProductDetails;
