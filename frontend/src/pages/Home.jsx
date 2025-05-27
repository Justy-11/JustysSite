import { useState } from "react";
import "../styles/Dashboard.css";

function Home() {
  // Mock username from backend
  const username = "Justy";

  // State for the wizard form
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    address: { street: "", city: "", state: "", zip: "" },
    socialLinks: { twitter: "", instagram: "", linkedin: "" },
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 3) {
      console.log("Form submitted:", formData);
      // Submit form data to backend here
    } else {
      handleNext();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Greeting Card */}
      <div className="greeting-card">
        <h2>Good evening, {username}</h2>
        <p>Welcome to CreatiMate...</p>
      </div>

      {/* Horizontal Wizard Form */}
      <div className="wizard-form">
        <div className="wizard-steps">
          {[1, 2, 3].map((s) => (
            <div key={s} className="step-container">
              <div
                className={`step-circle ${step >= s ? "active" : ""}`}
              >
                {s}
              </div>
              <span className="step-label">
                {s === 1 ? "Account Details" : s === 2 ? "Address" : "Social Links"}
              </span>
              {s < 3 && <div className="step-connector" />}
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
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
              <h3>Enter Your Address</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Street</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.address.street}
                    onChange={(e) => handleChange(e, "address")}
                    placeholder="Street"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.address.city}
                    onChange={(e) => handleChange(e, "address")}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.address.state}
                    onChange={(e) => handleChange(e, "address")}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.address.zip}
                    onChange={(e) => handleChange(e, "address")}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-section">
              <h3>Enter Your Social Links</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Twitter</label>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleChange(e, "socialLinks")}
                    placeholder="Twitter URL"
                  />
                </div>
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => handleChange(e, "socialLinks")}
                    placeholder="Instagram URL"
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => handleChange(e, "socialLinks")}
                    placeholder="LinkedIn URL"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-buttons">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="prev-button"
              >
                Previous
              </button>
            )}
            <button type="submit" className="next-button">
              {step === 3 ? "Submit" : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;