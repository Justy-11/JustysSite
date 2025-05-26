import React, { useState } from "react";
import "../styles/DashBoard.css";

const Home = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    linkedin: "",
    twitter: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
    } else {
      console.log("Form Data Submitted:", formData);
      // handle final submission (API call etc.)
    }
  };

  return (
    <div className="dashboard-container">
      <div className="greeting-card">
        <h2>Good evening, <strong>Justy</strong></h2>
        <p>Welcome to <strong>CreatiMate</strong> — Let’s get your profile ready!</p>
      </div>

      <form className="wizard-form" onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: "20px" }}>Step {step} of 3</h3>

        {step === 1 && (
          <>
            <label>Username</label>
            <input className="wizard-input" name="username" value={formData.username} onChange={handleChange} required />
            <label>Email</label>
            <input className="wizard-input" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <label>Phone Number</label>
            <input className="wizard-input" name="phone" value={formData.phone} onChange={handleChange} required />
          </>
        )}

        {step === 2 && (
          <>
            <label>Address</label>
            <input className="wizard-input" name="address" value={formData.address} onChange={handleChange} required />
            <label>City</label>
            <input className="wizard-input" name="city" value={formData.city} onChange={handleChange} required />
          </>
        )}

        {step === 3 && (
          <>
            <label>LinkedIn</label>
            <input className="wizard-input" name="linkedin" value={formData.linkedin} onChange={handleChange} />
            <label>Twitter</label>
            <input className="wizard-input" name="twitter" value={formData.twitter} onChange={handleChange} />
          </>
        )}

        <div className="wizard-buttons">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="wizard-button">
              Back
            </button>
          )}
          <button type="submit" className="wizard-button">
            {step < 3 ? "Next" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Home;
