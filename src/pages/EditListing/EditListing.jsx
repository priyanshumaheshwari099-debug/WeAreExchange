import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft,
    Camera,
    Check,
    MapPin,
    Tag,
    Sparkles,
    Save,
    X
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./EditListing.css";

const API = "http://localhost:5000";

function EditListing() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [form, setForm] = useState({
        title: "",
        category: "",
        brand: "",
        size: "",
        condition: "",
        value: "",
        description: "",
        state: "",
        city: "",
        status: "available"
    });

    const [image, setImage] = useState(null);
    const [oldImage, setOldImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios
            .get(`${API}/api/clothing/${id}`)
            .then(({ data }) => {
                setForm({
                    title: data.title || "",
                    category: data.category || "",
                    brand: data.brand || "",
                    size: data.size || "",
                    condition: data.condition || "",
                    value: data.value || "",
                    description: data.description || "",
                    state: data.state || "",
                    city: data.city || "",
                    status: data.status || "available"
                });

                setOldImage(data.image || "");
            })
            .catch(error => {
                console.log("Edit Listing Error:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const handleChange = e => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleImage = e => {
        const file = e.target.files[0];

        if (file) {
            setImage(file);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const userId = user?.id || user?._id;

        if (!userId) {
            alert("Please login first.");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            formData.append("userId", userId);

            if (image) {
                formData.append("image", image);
            }

            await axios.put(
                `${API}/api/clothing/${id}`,
                formData
            );

            navigate("/my-listings");
        } catch (error) {
            console.log("Update Error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to update listing"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="edit-page-loading">
                    <div className="edit-loader"></div>
                    <span>LOADING LISTING...</span>
                </main>

                <Footer />
            </>
        );
    }

    const preview = image
        ? URL.createObjectURL(image)
        : oldImage
            ? `${API}${oldImage}`
            : "";

    return (
        <>
            <Navbar />

            <main className="edit-page">

                {/* TOP */}
                <header className="edit-top">

                    <button
                        className="back-edit"
                        onClick={() => navigate("/my-listings")}
                    >
                        <ArrowLeft size={17} />
                        MY LISTINGS
                    </button>

                    <div className="edit-heading">
                        <span>WEAREXCHANGE / EDIT LISTING</span>

                        <h1>
                            Refine your <em>piece.</em>
                        </h1>

                        <p>
                            Make your listing more accurate and
                            attractive to the community.
                        </p>
                    </div>

                    <div className={`edit-status ${form.status}`}>
                        <span></span>

                        {form.status === "available"
                            ? "LISTING AVAILABLE"
                            : "LISTING NOT AVAILABLE"}
                    </div>

                </header>

                <form
                    className="edit-workspace"
                    onSubmit={handleSubmit}
                >

                    {/* LEFT IMAGE */}
                    <section className="edit-visual">

                        <div className="visual-label">
                            <span>01</span>
                            <strong>PRODUCT IMAGE</strong>
                        </div>

                        <div className="edit-image-card">

                            {preview ? (
                                <img
                                    src={preview}
                                    alt={form.title}
                                />
                            ) : (
                                <div className="no-image">
                                    <Camera size={35} />
                                    <span>No image</span>
                                </div>
                            )}

                            <label className="change-image">

                                <Camera size={17} />

                                <span>
                                    CHANGE PHOTO
                                </span>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImage}
                                />

                            </label>

                            <div className="image-overlay-info">
                                <span>
                                    {form.category || "CLOTHING"}
                                </span>

                                <strong>
                                    {form.title || "Your Listing"}
                                </strong>
                            </div>

                        </div>

                        <div className="visual-tip">
                            <Sparkles size={16} />

                            <div>
                                <strong>
                                    Make it stand out
                                </strong>

                                <p>
                                    Clear, well-lit photos help
                                    other users understand your item.
                                </p>
                            </div>
                        </div>

                    </section>

                    {/* RIGHT FORM */}
                    <section className="edit-details">

                        <div className="details-head">
                            <div>
                                <span>02</span>
                                <h2>Listing Details</h2>
                            </div>

                            <Tag size={20} />
                        </div>

                        {/* BASIC INFORMATION */}
                        <div className="form-card">

                            <div className="card-label">
                                BASIC INFORMATION
                            </div>

                            <div className="field full">
                                <label>Listing Title</label>

                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Vintage Blue Denim Jacket"
                                    required
                                />
                            </div>

                            <div className="field-grid">

                                <div className="field">
                                    <label>Category</label>

                                    <input
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        placeholder="Jeans, Shirt..."
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label>Brand</label>

                                    <input
                                        name="brand"
                                        value={form.brand}
                                        onChange={handleChange}
                                        placeholder="Nike, Zara..."
                                    />
                                </div>

                            </div>

                        </div>

                        {/* CONDITION */}
                        <div className="form-card">

                            <div className="card-label">
                                ITEM CONDITION
                            </div>

                            <div className="condition-grid">

                                {[
                                    "Like New",
                                    "Excellent",
                                    "Good",
                                    "Fair"
                                ].map(option => (
                                    <button
                                        type="button"
                                        key={option}
                                        className={
                                            form.condition === option
                                                ? "condition-option active"
                                                : "condition-option"
                                        }
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                condition: option
                                            })
                                        }
                                    >
                                        <span>{option}</span>

                                        {form.condition === option && (
                                            <Check size={15} />
                                        )}
                                    </button>
                                ))}

                            </div>

                        </div>

                        {/* SIZE + VALUE */}
                        <div className="form-card">

                            <div className="card-label">
                                ITEM INFORMATION
                            </div>

                            <div className="field-grid">

                                <div className="field">
                                    <label>Size</label>

                                    <input
                                        name="size"
                                        value={form.size}
                                        onChange={handleChange}
                                        placeholder="S / M / L / XL"
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label>
                                        Estimated Swap Value
                                    </label>

                                    <div className="input-price">
                                        <span>₹</span>

                                        <input
                                            type="number"
                                            name="value"
                                            value={form.value}
                                            onChange={handleChange}
                                            placeholder="1500"
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="field full">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Tell the community something about this item..."
                                    rows="5"
                                    required
                                />
                            </div>

                        </div>

                        {/* LOCATION */}
                        <div className="form-card">

                            <div className="card-label">
                                <MapPin size={15} />
                                LOCATION
                            </div>

                            <div className="field-grid">

                                <div className="field">
                                    <label>State</label>

                                    <input
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        placeholder="Uttar Pradesh"
                                    />
                                </div>

                                <div className="field">
                                    <label>City</label>

                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="Bijnor"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* STATUS */}
                        <div className="form-card status-card">

                            <div className="card-label">
                                LISTING STATUS
                            </div>

                            <div className="status-options">

                                {/* AVAILABLE */}
                                <button
                                    type="button"
                                    className={
                                        form.status === "available"
                                            ? "status-option available active"
                                            : "status-option available"
                                    }
                                    onClick={() =>
                                        setForm({
                                            ...form,
                                            status: "available"
                                        })
                                    }
                                >
                                    <span className="status-dot"></span>

                                    <div>
                                        <strong>Available</strong>
                                        <small>
                                            Show this listing in Browse
                                        </small>
                                    </div>

                                    {form.status === "available" && (
                                        <Check size={17} />
                                    )}

                                </button>

                                {/* NOT AVAILABLE */}
                                <button
                                    type="button"
                                    className={
                                        form.status === "not_available"
                                            ? "status-option unavailable active"
                                            : "status-option unavailable"
                                    }
                                    onClick={() =>
                                        setForm({
                                            ...form,
                                            status: "not_available"
                                        })
                                    }
                                >
                                    <span className="status-dot"></span>

                                    <div>
                                        <strong>Not Available</strong>
                                        <small>
                                            Hide this listing from Browse
                                        </small>
                                    </div>

                                    {form.status === "not_available" && (
                                        <Check size={17} />
                                    )}

                                </button>

                            </div>

                        </div>

                        {/* ACTIONS */}
                        <div className="edit-footer">

                            <button
                                type="button"
                                className="cancel-edit"
                                onClick={() =>
                                    navigate("/my-listings")
                                }
                            >
                                <X size={17} />
                                CANCEL
                            </button>

                            <button
                                type="submit"
                                className="save-edit"
                                disabled={saving}
                            >
                                {saving ? (
                                    "SAVING..."
                                ) : (
                                    <>
                                        <Save size={17} />
                                        SAVE CHANGES
                                    </>
                                )}
                            </button>

                        </div>

                    </section>

                </form>

            </main>

            <Footer />
        </>
    );
}

export default EditListing;