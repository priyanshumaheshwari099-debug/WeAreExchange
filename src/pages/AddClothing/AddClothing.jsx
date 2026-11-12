
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import LocationPicker from "./LocationPicker/LocationPicker";
import "./AddClothing.css";

const API = "https://wearexchange-backend.onrender.com";

const categories = ["Men's Wear", "Women's Wear", "Kids Wear", "Footwear", "Winter Wear", "Sports Wear", "Ethnic Wear", "Accessories", "Others", "Top", "Jeans"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const conditions = ["New", "Like New", "Good", "Fair"];
const popular = [["👕", "Men's Wear"], ["👗", "Women's Wear"], ["🧥", "Winter Wear"], ["👟", "Footwear"], ["🏃", "Sports Wear"], ["🧣", "Accessories"]];
const tips = ["Upload clear photos from different angles.", "Mention the actual product condition.", "Add a realistic swap value.", "Select the correct category."];

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

function AddClothing() {
    const navigate = useNavigate();
    const user = getUser();
    const fileRef = useRef(null);

    const emptyForm = {
        title: "",
        category: "",
        brand: "",
        size: "",
        condition: "",
        conditionDescription: "",
        value: "",
        description: "",
        country: "India",
        state: user?.state || "",
        city: user?.city || "",
        latitude: "",
        longitude: ""
    };

    const [formData, setFormData] = useState(emptyForm);
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const change = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const imageChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is larger than 5MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length) {
            setImages(prev => [...prev, ...validFiles]);
            setPreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
        }
        e.target.value = "";
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const clearForm = () => {
        previews.forEach(url => URL.revokeObjectURL(url));
        setFormData(emptyForm);
        setImages([]);
        setPreviews([]);
        if (fileRef.current) fileRef.current.value = "";
    };

    const submit = async (e) => {
        e.preventDefault();

        const activeUser = getUser();
        const activeUserId = activeUser?.id || activeUser?._id;

        if (!activeUserId) {
            toast.info("Please sign up to add clothing!", { autoClose: 3000 });
            setTimeout(() => navigate("/signup"), 3000);
            return;
        }

        const required = ["title", "category", "size", "condition", "conditionDescription", "description"];
        const missing = required.some(key => !String(formData[key] || "").trim());

        if (missing) {
            toast.error("Please fill all required fields");
            return;
        }

        if (!images.length) {
            toast.error("Please upload at least one clothing image");
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            data.append("userId", activeUserId);
            images.forEach(file => data.append("images", file));

            await axios.post(`${API}/api/clothing`, data);

            toast.success("Clothing added successfully!");
            clearForm();
        } catch (error) {
            console.error("ADD CLOTHING ERROR:", error);
            toast.error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to add clothing"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="add-clothing-page">
                <header className="add-header">
                    <h1>Add Your Clothing</h1>
                    <p>Give your clothes a second life by listing them for exchange.</p>
                </header>

                <div className="add-layout">
                    <form className="clothing-form" onSubmit={submit}>
                        <div className="section-heading">
                            <h2>Clothing Details</h2>
                            <p>Enter accurate information about your item.</p>
                        </div>

                        <div className="image-upload">
                            <label htmlFor="clothing-image">
                                <div className="upload-icon">↑</div>
                                <strong>{images.length ? "Add More Photos" : "Upload Clothing Images"}</strong>
                                <span>PNG, JPG or WEBP · Max 5MB per image</span>
                            </label>

                            <input
                                ref={fileRef}
                                id="clothing-image"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={imageChange}
                            />

                            {previews.length > 0 && (
                                <div className="image-gallery">
                                    {previews.map((src, index) => (
                                        <div className="preview-card" key={`${src}-${index}`}>
                                            <img src={src} alt={`Clothing ${index + 1}`} />
                                            <button type="button" onClick={() => removeImage(index)}>×</button>
                                            <span>Photo {index + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-grid">
                            <div className="field full">
                                <label>Clothing Name <span className="required-star">*</span></label>
                                <input name="title" value={formData.title} onChange={change} placeholder="e.g. Nike Black Hoodie" />
                            </div>

                            <div className="field">
                                <label>Category <span className="required-star">*</span></label>
                                <select name="category" value={formData.category} onChange={change}>
                                    <option value="">Select category</option>
                                    {categories.map(category => <option key={category} value={category}>{category}</option>)}
                                </select>
                            </div>

                            <div className="field">
                                <label>Brand</label>
                                <input name="brand" value={formData.brand} onChange={change} placeholder="e.g. Nike, Zara" />
                            </div>

                            <div className="field">
                                <label>Size <span className="required-star">*</span></label>
                                <select name="size" value={formData.size} onChange={change}>
                                    <option value="">Select size</option>
                                    {sizes.map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                            </div>

                            <div className="field">
                                <label>Condition <span className="required-star">*</span></label>
                                <select name="condition" value={formData.condition} onChange={change}>
                                    <option value="">Select condition</option>
                                    {conditions.map(condition => <option key={condition} value={condition}>{condition}</option>)}
                                </select>
                                <small className="field-hint">Select the overall condition of your clothing.</small>
                            </div>

                            <div className="field">
                                <label>Estimated Swap Value</label>
                                <div className="price-input">
                                    <span>₹</span>
                                    <input type="number" name="value" value={formData.value} onChange={change} placeholder="500" min="0" />
                                </div>
                            </div>

                            <div className="field full">
                                <label>Condition Description <span className="required-star">*</span></label>
                                <textarea
                                    name="conditionDescription"
                                    value={formData.conditionDescription}
                                    onChange={change}
                                    placeholder="Mention stains, tears, fading, damage or visible signs of wear..."
                                />
                                <small className="field-hint">Describe the actual condition of the item.</small>
                            </div>

                            <div className="field full">
                                <label>Description <span className="required-star">*</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={change}
                                    placeholder="Describe the item, material, style, usage, fit and features..."
                                />
                                <small className="field-hint">Add details that help other users understand the item.</small>
                            </div>
                        </div>

                        <div className="location-box">
                            <div className="location-top">
                                <div>
                                    <h3>📍 Item Location</h3>
                                    <p>Select your location or automatically detect it.</p>
                                </div>
                            </div>

                            <LocationPicker
                                value={{
                                    country: formData.country,
                                    state: formData.state,
                                    city: formData.city
                                }}
                                onChange={location => setFormData(prev => ({
                                    ...prev,
                                    country: location.country,
                                    state: location.state,
                                    city: location.city
                                }))}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={clearForm} disabled={loading}>
                                Clear
                            </button>
                            <button type="submit" className="add-btn" disabled={loading}>
                                {loading ? "Adding..." : "+ Add Clothing"}
                            </button>
                        </div>
                    </form>

                    <aside className="add-sidebar">
                        <div className="side-card">
                            <h3>💡 Listing Tips</h3>
                            {tips.map((tip, index) => (
                                <div className="tip" key={tip}>
                                    <b>0{index + 1}</b>
                                    <span>{tip}</span>
                                </div>
                            ))}
                        </div>

                        <div className="side-card eco-card">
                            <div className="eco-icon">♻</div>
                            <h3>Why Swap?</h3>
                            <p>Keep wearable clothes in use and help reduce textile waste through sustainable exchanges.</p>
                        </div>

                        <div className="side-card">
                            <h3>Popular Categories</h3>
                            <div className="categories">
                                {popular.map(([icon, name]) => (
                                    <button
                                        type="button"
                                        key={name}
                                        onClick={() => setFormData(prev => ({ ...prev, category: name }))}
                                    >
                                        {icon} {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default AddClothing;
