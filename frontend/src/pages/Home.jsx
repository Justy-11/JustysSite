import { useState, useEffect } from "react";
import "../styles/DashBoard.css";
import api from "../api";
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { FaCheckCircle } from "react-icons/fa";
import GreetingCardBg from "../assets/greeting card.png";

function Home() {
  const [username, setUsername] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    socialLinks: "",
    currency: "LKR",
  });

  // Status booleans
  const [hasPage, setHasPage] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [hasProductsOrCollections, setHasProductsOrCollections] = useState(false);

  useEffect(() => {
    const fetchProfileAndStatus = async () => {
      try {
        // Fetch profile
        const profileRes = await api.get("/api/profile/");
        const data = profileRes.data;
        setUsername(data.username || "");
        setFormData({
          username: data.username || "",
          email: data.email || "",
          phoneNumber: data.phone_number || "",
          street: data.street || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip_code || "",
          socialLinks: data.social_links || "",
          currency: data.currency || "LKR",
        });

        // Fetch page
        let pageRes;
        try {
          pageRes = await api.get("/api/page/");
        } catch (err) {
          pageRes = null;
        }
        if (pageRes && pageRes.data) {
          setHasPage(true);
          setIsPublished(!!pageRes.data.is_published);
        } else {
          setHasPage(false);
          setIsPublished(false);
        }

        // Fetch products and collections
        const [productsRes, collectionsRes] = await Promise.all([
          api.get("/api/products/"),
          api.get("/api/collections/")
        ]);
        const hasProducts = Array.isArray(productsRes.data) && productsRes.data.length > 0;
        const hasCollections = Array.isArray(collectionsRes.data) && collectionsRes.data.length > 0;
        setHasProductsOrCollections(hasProducts || hasCollections);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.response?.data || error.message);
        showErrorToast("Failed to load dashboard data. Please try again.");
      }
    };
    fetchProfileAndStatus();
  }, []);

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 2) {
      try {
        const response = await api.put("/api/profile/", {
          username: formData.username,
          phone_number: formData.phoneNumber,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip,
          social_links: formData.socialLinks,
          currency: formData.currency,
        });
        console.log("Profile updated:", response.data);
        setUsername(response.data.username || '');
        showSuccessToast("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error.response?.data || error.message);
        showErrorToast(error.response?.data?.detail || "Failed to update profile.");
      }
    } else {
      handleNext();
    }
  };

  // Colors
  const green = "#22c55e";
  const gray = "#a0a0a0";

  return (
    <div className="dashboard-container">
      <div className="cards-container new-cards-layout">
        <div className="greeting-card" style={{ backgroundImage: `url(${GreetingCardBg})` }}>
          <div className="greeting-card-inner greeting-card-bg-text">
            <div className="greeting-card-text">
              <h2>Good evening, {username || 'User'}</h2>
              <p>Welcome to CreatiMate...</p>
            </div>
          </div>
        </div>
        <div className="status-cards-row">
          <div className="status-card single-status-card">
            <FaCheckCircle className="status-icon" style={{ color: hasPage ? green : gray }} />
            <div className="status-label">Page Created</div>
          </div>
          <div className="status-card single-status-card">
            <FaCheckCircle className="status-icon" style={{ color: hasProductsOrCollections ? green : gray }} />
            <div className="status-label">Products Added</div>
          </div>
          <div className="status-card single-status-card">
            <FaCheckCircle className="status-icon" style={{ color: isPublished ? green : gray }} />
            <div className="status-label">Published</div>
          </div>
        </div>
      </div>

      <div className="wizard-form">
        <div className="wizard-steps">
          {[1, 2].map((s) => (
            <div key={s} className="step-container">
              <div className={`step-circle ${step >= s ? "active" : ""}`}>
                {s}
              </div>
              <span className="step-label">
                {s === 1 ? "Account Details" : "Address & Social Links"}
              </span>
              {s < 2 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-section">
              <h3>Enter Your Account Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Type your Username"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    placeholder="Type your email"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number (with country code, e.g., +94 70 1234567)"
                    // pattern="^[0-9\-() +]*$"
                    title="Please enter a valid phone number (numbers, spaces, +, -, (, ) only)"
                  />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <option value="LKR">LKR (Rs.)</option>
                    <option value="USD">$ (USD)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-section">
              <h3>Enter Your Address & Social Links</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Street</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Street"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="ZIP Code"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Social Links (comma-separated URLs)</label>
                  <textarea
                    name="socialLinks"
                    value={formData.socialLinks}
                    onChange={handleChange}
                    placeholder="e.g., https://www.twitter.com/yourbrand\nhttps://www.instagram.com/yourbrand\nhttps://www.linkedin.com/company/yourbrand"
                    rows={4}
                    style={{ resize: 'vertical', minHeight: 80 }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-buttons">
            {step > 1 && (
              <button type="button" onClick={handlePrev} className="prev-button">
                Previous
              </button>
            )}
            <button type="submit" className="next-button">
              {step === 2 ? "Submit" : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;