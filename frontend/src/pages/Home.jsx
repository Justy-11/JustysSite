import { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import api from "../api";
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

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
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile/");
        const data = response.data;
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
        });
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error.message);
        alert("Failed to load profile data. Please try again.");
      }
    };
    fetchProfile();
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

  return (
    <div className="dashboard-container">
      <div className="greeting-card">
        <h2>Good evening, {username || 'User'}</h2>
        <p>Welcome to CreatiMate...</p>
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
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number"
                  />
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
                  <input
                    type="text"
                    name="socialLinks"
                    value={formData.socialLinks}
                    onChange={handleChange}
                    placeholder="e.g., https://www.twitter.com/yourbrand,https://www.instagram.com/yourbrand,https://www.linkedin.com/company/yourbrand,https://www.facebook.com/yourbrand,https://www.youtube.com/@yourbrand"
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