
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    LayoutDashboard, Shirt, ArrowLeftRight, Plus, Search, Bell,
    UserRound, MapPin, Package, RefreshCw, ArrowUpRight, ChevronRight,
    Truck
} from "lucide-react";
import "./AdminDashboard.css";
import Footer from "../../components/Footer/Footer";

const API = "https://wearexchange-backend.onrender.com";

const navItems = [
    [LayoutDashboard, "Dashboard", "/admin"],
    [Shirt, "My Listings", "/my-listings"],
    [ArrowLeftRight, "Swap Requests", "/swap-requests"],
    [ArrowLeftRight, "My Swaps", "/my-swaps"],
    [Plus, "Add Clothing", "/add-clothing"],
    [UserRound, "Profile", "/profile"],
    [Truck, "Delivery", "/delivery"]
];

const quickActions = [
    [Plus, "Add Clothing", "Create new listing", "/add-clothing"],
    [Search, "Browse Listings", "View marketplace", "/browse"],
    [ArrowLeftRight, "Swap Requests", "Manage exchanges", "/swap-requests"],
    [ArrowLeftRight, "My Swaps", "View completed exchanges", "/my-swaps"],
    [Truck, "Delivery", "View delivery status", "/delivery"],
    [UserRound, "My Profile", "Manage account", "/profile"]
];

const Stat = ({ icon: Icon, title, value, text }) => (
    <div className="stat-card">
        <div className="stat-icon">
            <Icon size={19} />
        </div>
        <div>
            <span>{title}</span>
            <h2>{value}</h2>
            <small>{text}</small>
        </div>
    </div>
);

const Avatar = ({ user, className }) => (
    <div className={className}>
        {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" />
        ) : (
            user?.name?.charAt(0) || "A"
        )}
    </div>
);

function AdminDashboard() {
    const [clothes, setClothes] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = useMemo(() => {
        try {
            return (
                JSON.parse(localStorage.getItem("user") || "null") ||
                JSON.parse(localStorage.getItem("googleUser") || "null")
            );
        } catch {
            return null;
        }
    }, []);

    const fetchClothes = async () => {
        try {
            setLoading(true);

            const res = await fetch(`${API}/api/clothing`);

            if (!res.ok) {
                throw new Error("Could not load clothing listings");
            }

            const data = await res.json();
            const userId = user?.id || user?._id;

            const myClothes = Array.isArray(data)
                ? data.filter(item => {
                    const itemUserId = item.userId?._id || item.userId;
                    return String(itemUserId) === String(userId);
                })
                : [];

            setClothes(myClothes);
        } catch (error) {
            console.error("Clothing fetch error:", error);
            setClothes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClothes();
    }, []);

    const available = useMemo(
        () => clothes.filter(item => item.status === "available").length,
        [clothes]
    );

    const categories = useMemo(
        () => [...new Set(clothes.map(item => item.category).filter(Boolean))],
        [clothes]
    );

    const locations = useMemo(
        () => [
            ...new Set(
                clothes
                    .map(item =>
                        [item.city, item.state].filter(Boolean).join(", ")
                    )
                    .filter(Boolean)
            )
        ],
        [clothes]
    );

    return (
        <>
            <div className="admin-layout">
                <aside className="sidebar">
                    <Link to="/" className="admin-brand">
                        <div>
                            <h1>
                                WEAR<span>EXCHANGE</span>
                            </h1>
                        </div>
                    </Link>

                    <nav className="sidebar-nav">
                        {navItems.map(([Icon, text, path]) => (
                            <Link
                                key={text}
                                to={path}
                                className={`nav-item ${
                                    path === "/admin" ? "active" : ""
                                }`}
                            >
                                <Icon size={18} />
                                {text}
                            </Link>
                        ))}
                    </nav>

                    <div className="sidebar-bottom">
                        <Link to="/" className="back-home">
                            <ArrowUpRight size={15} />
                            View Website
                        </Link>

                        <Link to="/profile" className="admin-user">
                            <Avatar
                                user={user}
                                className="admin-avatar"
                            />
                            <div>
                                <strong>{user?.name || "Admin"}</strong>
                                <span>Administrator</span>
                            </div>
                        </Link>
                    </div>
                </aside>

                <main className="main-content">
                    <header className="topbar">
                        <div>
                            <span className="top-label">WEAR EXCHANGE</span>
                            <h1>Dashboard</h1>
                        </div>

                        <div className="topbar-right">
                            <button
                                className="icon-button"
                                onClick={fetchClothes}
                                title="Refresh"
                            >
                                <RefreshCw size={18} />
                            </button>

                            <Link to="/profile" className="top-profile">
                                <Avatar
                                    user={user}
                                    className="top-avatar"
                                />
                                <div>
                                    <strong>{user?.name || "Admin"}</strong>
                                    <span>Admin</span>
                                </div>
                            </Link>
                        </div>
                    </header>

                    <section className="dashboard">
                        <div className="welcome-row">
                            <div>
                                <span className="welcome-label">
                                    WELCOME BACK
                                </span>
                                <h2>
                                    {user?.name?.split(" ") || "Admin"}
                                    <b> </b>
                                </h2>
                                <p>
                                    Manage your clothing exchange marketplace.
                                </p>
                            </div>

                            <Link to="/add-clothing" className="add-btn">
                                <Plus size={17} />
                                Add cLOTHING
                            </Link>
                        </div>

                        <div className="stats-grid">
                            <Stat
                                icon={Shirt}
                                title="Total Listings"
                                value={clothes.length}
                                text="Your clothing items"
                            />

                            <Stat
                                icon={Package}
                                title="Available"
                                value={available}
                                text="Ready for exchange"
                            />

                            <Stat
                                icon={ArrowLeftRight}
                                title="Categories"
                                value={categories.length}
                                text="Your clothing categories"
                            />

                            <Stat
                                icon={MapPin}
                                title="Locations"
                                value={locations.length}
                                text="Your active locations"
                            />
                        </div>

                        <div className="dashboard-grid">
                            <section className="panel listings-panel">
                                <div className="panel-header">
                                    <div>
                                        <span>MARKETPLACE</span>
                                        <h2>Recent Listings</h2>
                                    </div>

                                    <Link to="/browse" className="view-link">
                                        View All <ArrowUpRight size={13} />
                                    </Link>
                                </div>

                                {loading ? (
                                    <div className="empty-state">
                                        <RefreshCw size={24} />
                                        <p>Loading listings...</p>
                                    </div>
                                ) : !clothes.length ? (
                                    <div className="empty-state">
                                        <Shirt size={28} />
                                        <h3>No listings yet</h3>
                                        <p>
                                            Add clothing to see it here.
                                        </p>
                                        <Link to="/add-clothing">
                                            Add Clothing
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="listing-list">
                                        {clothes.slice(0, 6).map(item => {
                                            const image =
                                                item.images?.[0] || item.image;

                                            return (
                                                <div
                                                    className="listing-row"
                                                    key={item._id}
                                                >
                                                    <div className="listing-image">
                                                        {image ? (
                                                            <img
                                                                src={
                                                                    image.startsWith("http")
                                                                        ? image
                                                                        : `${API}${image}`
                                                                }
                                                                alt={item.title}
                                                            />
                                                        ) : (
                                                            <Shirt size={22} />
                                                        )}
                                                    </div>

                                                    <div className="listing-info">
                                                        <strong>
                                                            {item.title}
                                                        </strong>
                                                        <span>
                                                            {item.category}
                                                            {item.brand &&
                                                                ` · ${item.brand}`}
                                                        </span>
                                                        <small>
                                                            {[
                                                                item.city,
                                                                item.state
                                                            ]
                                                                .filter(Boolean)
                                                                .join(", ") ||
                                                                "Location not added"}
                                                        </small>
                                                    </div>

                                                    <div className="listing-meta">
                                                        <strong>
                                                            {item.size || "—"}
                                                        </strong>
                                                        <span>
                                                            {item.condition || "—"}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className={`listing-status ${
                                                            item.status || ""
                                                        }`}
                                                    >
                                                        {item.status || "Unknown"}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            <section className="panel quick-panel">
                                <div className="panel-header">
                                    <div>
                                        <span>SHORTCUTS</span>
                                        <h2>Quick Actions</h2>
                                    </div>
                                </div>

                                <div className="quick-list">
                                    {quickActions.map(
                                        ([Icon, title, text, path]) => (
                                            <Link to={path} key={title}>
                                                <div className="quick-icon">
                                                    <Icon size={17} />
                                                </div>
                                                <div>
                                                    <strong>{title}</strong>
                                                    <span>{text}</span>
                                                </div>
                                                <ChevronRight size={15} />
                                            </Link>
                                        )
                                    )}
                                </div>
                            </section>
                        </div>

                        {!!categories.length && (
                            <section className="panel category-panel">
                                <div className="panel-header">
                                    <div>
                                        <span>MARKETPLACE</span>
                                        <h2>Categories</h2>
                                    </div>
                                </div>

                                <div className="category-grid">
                                    {categories.map(category => {
                                        const count = clothes.filter(
                                            item => item.category === category
                                        ).length;

                                        return (
                                            <div
                                                className="category-card"
                                                key={category}
                                            >
                                                <div className="category-icon">
                                                    <Shirt size={19} />
                                                </div>
                                                <div>
                                                    <strong>{category}</strong>
                                                    <span>
                                                        {count} listing
                                                        {count !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </section>
                </main>
            </div>

            <Footer />
        </>
    );
}

export default AdminDashboard;
