import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-main">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        Wear<span>Exchange</span>
                    </Link>

                    <p>
                        Give your clothes a second life.
                        Discover, exchange and wear something new.
                    </p>

                    <div className="footer-socials">
                        <a href="#instagram">Instagram</a>
                        <a href="#facebook">Facebook</a>
                        <a href="#linkedin">LinkedIn</a>
                    </div>
                </div>

                <div className="footer-links">
                    <div>
                        <h4>EXPLORE</h4>
                        <Link to="/">Home</Link>
                        <Link to="/browse">Browse Clothes</Link>
                        <Link to="/add-clothing">List Clothing</Link>
                        <Link to="/swap-requests">Swap Requests</Link>
                    </div>

                    <div>
                        <h4>ACCOUNT</h4>
                        <Link to="/profile">My Profile</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Create Account</Link>
                    </div>

                    <div>
                        <h4>WEAREXCHANGE</h4>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#sustainability">Sustainability</a>
                        <a href="#contact">Contact Us</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 WearExchange. All rights reserved.</p>

                <div>
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms">Terms & Conditions</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;