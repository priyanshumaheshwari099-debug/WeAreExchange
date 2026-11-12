import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { State, City } from "country-state-city";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import "./Signup.css";
import Footer from "../../components/Footer/Footer"

const API = "https://wearexchange-backend.onrender.com/api/auth";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", state: "", city: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const states = useMemo(() => State.getStatesOfCountry("IN"), []);
  const cities = useMemo(
    () => formData.state ? City.getCitiesOfState("IN", formData.state) : [],
    [formData.state]
  );

  const handleChange = ({ target: { name, value } }) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  const handleStateChange = ({ target: { value } }) =>
    setFormData(prev => ({ ...prev, state: value, city: "" }));

  const handleGoogleLogin = async () => {
  try {
    setLoading(true);

    const result = await signInWithPopup(auth, googleProvider);

    const credential = await result.user.getIdToken();

    const { data } = await axios.post(`${API}/google`, {
      credential,
      profileImage: result.user.photoURL || ""
    });

    localStorage.setItem("user", JSON.stringify(data.user));

    window.dispatchEvent(new Event("googleLogin"));

    if (data.existingUser) {
      toast.success("Welcome back!");
      navigate("/");
      return;
    }

    toast.success("Google account created successfully!");
    navigate("/");

  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    toast.error(
      error.response?.data?.message || "Google authentication failed"
    );
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, phone, password, state, city } = formData;

    if (!name || !email || !phone || !password || !state || !city)
      return toast.error("Please fill all fields");

    if (!/^[6-9]\d{9}$/.test(phone))
      return toast.error("Enter a valid 10-digit mobile number");

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password))
      return toast.error("Password needs 8+ characters, uppercase, lowercase and number");

    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/signup`, formData);

      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />

      <div className="signup-page">
        <section className="signup-left">
          <div className="signup-left-content">
            <h1>Give Clothes<br /><span>A Second Life.</span></h1>
            <p>Join WearExchange and discover a smarter way to swap clothes with people around you.</p>

            <div className="signup-features">
              <div className="signup-feature"><span>♻</span><div><h4>Eco Friendly</h4><p>Reduce clothing waste.</p></div></div>
              <div className="signup-feature"><span>♧</span><div><h4>Easy Swapping</h4><p>Exchange clothes easily.</p></div></div>
              <div className="signup-feature"><span>♡</span><div><h4>Build Community</h4><p>Connect with people.</p></div></div>
            </div>
          </div>
        </section>

        <section className="signup-right">
          <div className="signup-card">
            <div className="signup-card-header">
              <div className="signup-user-icon">♙</div>
              <h2>Create Account</h2>
              <p>Create your WearExchange account.</p>
            </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength="10" placeholder="Enter 10-digit mobile number" />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>State</label>
                <select value={formData.state} onChange={handleStateChange}>
                  <option value="">Select your state</option>
                  {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>City</label>
                <select name="city" value={formData.city} onChange={handleChange} disabled={!formData.state}>
                  <option value="">{formData.state ? "Select your city" : "First select state"}</option>
                  {cities.map(c => <option key={c.name}>{c.name}</option>)}
                </select>
              </div>

              <button className="create-account-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="signup-divider"><span /><p>or</p><span /></div>

            <button className="social-btn" onClick={handleGoogleLogin} disabled={loading}>
              <span className="google-icon">G</span> Continue with Google
            </button>

            <p className="already-account">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </section>
      </div>
      <Footer/>
    </>
  );
}

export default Signup;