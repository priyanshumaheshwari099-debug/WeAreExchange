
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const backendUser = data?.user;
      const userId = backendUser?.id || backendUser?._id;

      if (!userId) {
        toast.error("User ID missing from server response");
        console.error("Login response:", data);
        return;
      }

      const savedUser = { ...backendUser, id: userId };

      localStorage.setItem("user", JSON.stringify(savedUser));
      localStorage.removeItem("googleUser");

      window.dispatchEvent(new Event("profileUpdated"));
      toast.success("Login successful!");
      setFormData({ email: "", password: "" });

      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Login Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const credential = await firebaseUser.getIdToken();

      const { data } = await axios.post(
        "http://localhost:5000/api/auth/google",
        { credential }
      );

      console.log("GOOGLE BACKEND RESPONSE:", data);

      const backendUser = data?.user;
      const userId = backendUser?.id || backendUser?._id;

      if (!userId) {
        console.error("MongoDB user ID missing:", data);
        toast.error("Backend user ID missing. Check Google auth API.");
        return;
      }

      const savedUser = {
        ...backendUser,
        id: userId,
        profileImage: backendUser.profileImage || firebaseUser.photoURL || ""
      };

      localStorage.setItem("user", JSON.stringify(savedUser));
      localStorage.setItem("googleUser", JSON.stringify(savedUser));

      window.dispatchEvent(new Event("googleLogin"));
      window.dispatchEvent(new Event("profileUpdated"));

      toast.success("Google login successful!");
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Google Login Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />

      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="login-user-icon">♙</div>
            <h2>Welcome Back</h2>
            <p>Login to continue using WearExchange.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div className="login-form-group">
              <label>Password</label>
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="login-divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <button
            type="button"
            className="login-social-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <span className="login-google-icon">G</span>
            {loading ? "Please wait..." : "Continue with Google"}
          </button>

          <p className="login-signup-link">
            Don't have an account? <Link to="/signup">Create Account</Link>
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Login;
