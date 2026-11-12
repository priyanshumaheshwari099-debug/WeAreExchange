
import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/Navbar/Navbar";
import { State, City } from "country-state-city";
import "./Profile.css";
import Footer from "../../components/Footer/Footer";

const API = "https://wearexchange-backend.onrender.com";

function Profile() {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    const [user, setUser] = useState(savedUser);
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: savedUser?.name || "",
        phone: savedUser?.phone || "",
        state: savedUser?.state || "",
        city: savedUser?.city || ""
    });

    const states = State.getStatesOfCountry("IN");

    const selectedState = states.find(
        (item) => item.name === formData.state
    );

    const cities = selectedState
        ? City.getCitiesOfState("IN", selectedState.isoCode)
        : [];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleStateChange = (e) => {
        setFormData({
            ...formData,
            state: e.target.value,
            city: ""
        });
    };

    const handleSave = async () => {
        if (
            !formData.name ||
            !formData.phone ||
            !formData.state ||
            !formData.city
        ) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.put(
                `${API}/api/auth/profile/${user.id || user._id}`,
                formData
            );

            setUser(response.data.user);

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            window.dispatchEvent(new Event("profileUpdated"));

            toast.success("Profile updated successfully!");

            setEdit(false);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Profile update failed"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="profile-page">
                    <div className="profile-card">
                        <h2>Please login first</h2>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            <Navbar />

            <div className="profile-page">
                <div className="profile-card">
                    <div className="profile-top">
                        <img
                            src={
                                user.profileImage ||
                                "https://via.placeholder.com/120"
                            }
                            className="profile-image"
                            alt="Profile"
                        />

                        <div className="profile-info">
                            <h1>{user.name}</h1>
                            <p>{user.email}</p>
                        </div>

                        <button
                            className="edit-btn"
                            onClick={() => setEdit(true)}
                        >
                            ✏️ Edit Profile
                        </button>
                    </div>

                    <div className="details-box">
                        <h2>Profile Details</h2>

                        <div className="details-grid">
                            <div>
                                <label>Name</label>
                                <p>{user.name}</p>
                            </div>

                            <div>
                                <label>State</label>
                                <p>{user.state || "Not added"}</p>
                            </div>

                            <div>
                                <label>Email</label>
                                <p>{user.email}</p>
                            </div>

                            <div>
                                <label>City</label>
                                <p>{user.city || "Not added"}</p>
                            </div>

                            <div>
                                <label>Phone</label>
                                <p>{user.phone || "Not added"}</p>
                            </div>

                            <div>
                                <label>Login Method</label>
                                <p>
                                    {user.authProvider === "google"
                                        ? "🔵 Google"
                                        : "Email & Password"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {edit && (
                <div className="modal-overlay">
                    <div className="edit-modal">
                        <div className="modal-header">
                            <h2>Edit Profile</h2>

                            <button onClick={() => setEdit(false)}>
                                ✕
                            </button>
                        </div>

                        <img
                            src={
                                user.profileImage ||
                                "https://via.placeholder.com/100"
                            }
                            className="edit-image"
                            alt="Profile"
                        />

                        <label>Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />

                        <label>Email</label>
                        <input value={user.email} disabled />

                        <label>Phone</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                        <label>State</label>
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleStateChange}
                        >
                            <option value="">Select State</option>

                            {states.map((state) => (
                                <option
                                    key={state.isoCode}
                                    value={state.name}
                                >
                                    {state.name}
                                </option>
                            ))}
                        </select>

                        <label>City / Town</label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            disabled={!formData.state}
                        >
                            <option value="">
                                {formData.state
                                    ? "Select City / Town"
                                    : "First Select State"}
                            </option>

                            {cities.map((city) => (
                                <option
                                    key={`${city.name}-${city.stateCode}`}
                                    value={city.name}
                                >
                                    {city.name}
                                </option>
                            ))}
                        </select>

                        <div className="modal-buttons">
                            <button
                                className="cancel-btn"
                                onClick={() => setEdit(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="save-btn"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

export default Profile;
