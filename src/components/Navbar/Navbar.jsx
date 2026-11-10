import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import axios from "axios";
import { auth } from "../../firebase";
import "./Navbar.css";

const API = "http://localhost:5000";

const links = [
    ["/", "Home"],
    ["/browse", "Browse"],
    ["/add-clothing", "Add Clothing"],
    ["/swap-requests", "Swap Requests"]
];

function Navbar() {
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [swapCount, setSwapCount] = useState(0);
    const [chatCount, setChatCount] = useState(0);

    const [user, setUser] = useState(() =>
        JSON.parse(localStorage.getItem("user") || "null")
    );

    const closeMenu = () => {
        setMenuOpen(false);
    };

    // USER UPDATE
    useEffect(() => {
        const updateUser = () => {
            setUser(
                JSON.parse(localStorage.getItem("user") || "null")
            );
        };

        window.addEventListener("googleLogin", updateUser);
        window.addEventListener("profileUpdated", updateUser);

        return () => {
            window.removeEventListener("googleLogin", updateUser);
            window.removeEventListener("profileUpdated", updateUser);
        };
    }, []);

    // SWAP REQUEST COUNT
    useEffect(() => {
        if (!user?.id) {
            setSwapCount(0);
            return;
        }

        const getSwapCount = async () => {
            try {
                const { data } = await axios.get(
                    `${API}/api/swapping/received/${user.id}`
                );

                setSwapCount(
                    Array.isArray(data) ? data.length : 0
                );

            } catch (error) {
                console.log(
                    "Swap count error:",
                    error.response?.data || error
                );

                setSwapCount(0);
            }
        };

        getSwapCount();

        window.addEventListener(
            "swapUpdated",
            getSwapCount
        );

        return () => {
            window.removeEventListener(
                "swapUpdated",
                getSwapCount
            );
        };
    }, [user]);

    // CHAT UNREAD COUNT
    useEffect(() => {
        if (!user?.id) {
            setChatCount(0);
            return;
        }

        const getChatCount = async () => {
            try {
                const { data } = await axios.get(
                    `${API}/api/messages/unread/${user.id}`
                );

                setChatCount(
                    Number(data?.count) || 0
                );

            } catch (error) {
                console.log(
                    "Chat count error:",
                    error.response?.data || error
                );

                setChatCount(0);
            }
        };

        getChatCount();

        const interval = setInterval(
            getChatCount,
            3000
        );

        return () => {
            clearInterval(interval);
        };
    }, [user]);

    // LOGOUT
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error(
                "Firebase logout error:",
                error
            );
        }

        localStorage.removeItem("user");
        localStorage.removeItem("googleUser");

        setUser(null);
        setSwapCount(0);
        setChatCount(0);
        setProfileOpen(false);
        closeMenu();

        window.location.href = "/";
    };

    // PROFILE IMAGE
    const ProfileImage = ({ large = false }) => {
        const image = user?.profileImage;

        if (image) {
            return (
                <img
                    src={image}
                    alt="Profile"
                    className={
                        large
                            ? "profile-large-img"
                            : "navbar-profile-img"
                    }
                    referrerPolicy="no-referrer"
                />
            );
        }

        return (
            <div className="profile-placeholder">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
        );
    };

    return (
        <nav className="navbar">

            {/* LOGO */}
            <Link
                to="/"
                className="navbar-name"
                onClick={closeMenu}
            >
                WEAR<span>EXCHANGE</span>
            </Link>

            {/* DESKTOP LINKS */}
            <div className="navbar-links">

                {links.map(([path, name]) => (
                    <Link
                        key={path}
                        to={path}
                        onClick={closeMenu}
                    >
                        {name}

                        {name === "Swap Requests" &&
                            swapCount > 0 && (
                                <span className="swap-badge">
                                    {swapCount > 99
                                        ? "99+"
                                        : swapCount}
                                </span>
                            )}
                    </Link>
                ))}

            </div>

            {/* DESKTOP ACTIONS */}
            <div className="navbar-actions">

                {/* CHAT NOTIFICATION */}
                {user && (
                    <button
                        className="navbar-chat-btn"
                        onClick={() => {
    navigate("/notification-messages");
}}
                        title="Messages"
                        aria-label="Messages"
                    >
                        💬

                        {chatCount > 0 && (
                            <span className="chat-badge">
                                {chatCount > 99
                                    ? "99+"
                                    : chatCount}
                            </span>
                        )}
                    </button>
                )}

                {/* LOGIN / PROFILE */}
                {!user ? (
                    <>
                        <Link
                            to="/login"
                            className="login-btn"
                        >
                            Login
                        </Link>

                        <Link
                            to="/signup"
                            className="signup-btn"
                        >
                            Sign Up
                        </Link>
                    </>
                ) : (
                    <div className="navbar-profile">

                        <button
                            className="profile-btn"
                            onClick={() =>
                                setProfileOpen(
                                    prev => !prev
                                )
                            }
                        >
                            <ProfileImage />
                        </button>

                        {profileOpen && (
                            <div className="profile-dropdown">

                                <div className="profile-info">

                                    <ProfileImage large />

                                    <div>
                                        <strong>
                                            {user.name}
                                        </strong>

                                        <small>
                                            {user.email}
                                        </small>
                                    </div>

                                </div>

                                <Link
                                    to="/admin"
                                    onClick={() =>
                                        setProfileOpen(false)
                                    }
                                >
                                    Admin Dashboard
                                </Link>

                                <button
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>

                            </div>
                        )}

                    </div>
                )}

            </div>

            {/* MOBILE BUTTON */}
            <button
                className="menu-btn"
                onClick={() =>
                    setMenuOpen(prev => !prev)
                }
                aria-label="Toggle navigation menu"
            >
                <span />
                <span />
                <span />
            </button>

            {/* MOBILE MENU */}
            <div
                className={`mobile-menu ${
                    menuOpen ? "open" : ""
                }`}
            >

                {links.map(([path, name]) => (
                    <Link
                        key={path}
                        to={path}
                        onClick={closeMenu}
                    >
                        {name}

                        {name === "Swap Requests" &&
                            swapCount > 0 && (
                                <span className="swap-badge mobile-badge">
                                    {swapCount > 99
                                        ? "99+"
                                        : swapCount}
                                </span>
                            )}
                    </Link>
                ))}

                {/* MOBILE CHAT */}
                {user && (
                    <Link
                        to="/notification-messages"
                        className="mobile-chat-link"
                        onClick={closeMenu}
                    >
                        💬 Messages

                        {chatCount > 0 && (
                            <span className="mobile-chat-badge">
                                {chatCount > 99
                                    ? "99+"
                                    : chatCount}
                            </span>
                        )}
                    </Link>
                )}

                {/* MOBILE ACTIONS */}
                <div className="mobile-actions">

                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                className="mobile-login"
                                onClick={closeMenu}
                            >
                                Login
                            </Link>

                            <Link
                                to="/signup"
                                className="mobile-signup"
                                onClick={closeMenu}
                            >
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <div className="mobile-profile">

                            <ProfileImage />

                            <span>
                                {user.name}
                            </span>

                            <Link
                                to="/admin"
                                onClick={closeMenu}
                            >
                                Admin Dashboard
                            </Link>

                            <button
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                        </div>
                    )}

                </div>

            </div>

        </nav>
    );
}

export default Navbar;