import { useState, useRef } from "react";
import "../styles/CreatePage.css";

function CreatePage() {
  // State to toggle preview visibility
  const [isCreated, setIsCreated] = useState(false);

  // State for the form data
  const [formData, setFormData] = useState({
    profileImage: null,
    productName: "",
    tagline: "",
    bannerImage: null,
    about: "",
    contactLinks: { email: "", phone: "" },
    socialLinks: [], // Array to store social links
  });

  // State for image previews and errors
  const [previewProfileImage, setPreviewProfileImage] = useState(null);
  const [previewBannerImage, setPreviewBannerImage] = useState(null);
  const [profileImageError, setProfileImageError] = useState("");
  const [bannerImageError, setBannerImageError] = useState("");

  // Refs for file inputs and scroll targets
  const profileImageInputRef = useRef(null);
  const bannerImageInputRef = useRef(null);
  const previewCardRef = useRef(null); // Ref for preview card
  const formRef = useRef(null); // Ref for form

  // Character limit for the description
  const DESCRIPTION_LIMIT = 500;
  const [charCount, setCharCount] = useState(0);

  // Handle form input changes
  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [name]: value },
      });
    } else if (name === "about") {
      // Handle description with character limit
      if (value.length <= DESCRIPTION_LIMIT) {
        setFormData({ ...formData, [name]: value });
        setCharCount(value.length);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle file input changes for images with validation
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      const fileSizeInMB = file.size / (1024 * 1024); // Convert bytes to MB

      if (field === "profileImage") {
        const maxSizeInMB = 2; // 2MB limit for profile image
        if (fileSizeInMB > maxSizeInMB) {
          setProfileImageError(`File size exceeds ${maxSizeInMB}MB limit.`);
          return;
        }
        setProfileImageError("");
        const previewUrl = URL.createObjectURL(file);
        setPreviewProfileImage(previewUrl);
        setFormData({ ...formData, profileImage: file });
      } else if (field === "bannerImage") {
        const maxSizeInMB = 6; // 6MB limit for banner image
        if (fileSizeInMB > maxSizeInMB) {
          setBannerImageError(`File size exceeds ${maxSizeInMB}MB limit.`);
          return;
        }
        setBannerImageError("");
        const previewUrl = URL.createObjectURL(file);
        setPreviewBannerImage(previewUrl);
        setFormData({ ...formData, bannerImage: file });
      }
    }
  };

  // Handle image removal
  const handleRemoveImage = (field) => {
    if (field === "profileImage") {
      setPreviewProfileImage(null);
      setProfileImageError("");
      setFormData({ ...formData, profileImage: null });
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = ""; // Reset file input
      }
    } else if (field === "bannerImage") {
      setPreviewBannerImage(null);
      setBannerImageError("");
      setFormData({ ...formData, bannerImage: null });
      if (bannerImageInputRef.current) {
        bannerImageInputRef.current.value = ""; // Reset file input
      }
    }
  };

  // Handle social link changes
  const handleSocialLinkChange = (index, field, value) => {
    const updatedSocialLinks = [...formData.socialLinks];
    updatedSocialLinks[index] = { ...updatedSocialLinks[index], [field]: value };
    setFormData({ ...formData, socialLinks: updatedSocialLinks });
  };

  // Add a new social link entry
  const addSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { platform: "Twitter", url: "" }],
    });
  };

  // Remove a social link entry
  const removeSocialLink = (index) => {
    const updatedSocialLinks = formData.socialLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, socialLinks: updatedSocialLinks });
  };

  // Handle form submission to show preview and scroll to it
  const handleSubmit = (e) => {
    e.preventDefault();
    if (profileImageError || bannerImageError) {
      alert("Please fix the errors before submitting.");
      return;
    }
    setIsCreated(true); // Show preview card
    console.log("Page data:", formData);
    // Simulate saving to database (no backend implementation)
    // Scroll to preview card after a slight delay to ensure rendering
    setTimeout(() => {
      if (previewCardRef.current) {
        previewCardRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  };

  // Handle edit button click to scroll to form
  const handleEdit = () => {
    // Do not set isCreated to false, keep preview visible
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Social media platform options
  const socialMediaOptions = [
    { value: "Twitter", label: "Twitter" },
    { value: "Instagram", label: "Instagram" },
    { value: "LinkedIn", label: "LinkedIn" },
    { value: "Facebook", label: "Facebook" },
  ];

  return (
    <div className="create-page-container">
      {/* Preview Card (shown when isCreated is true) */}
      {isCreated && (
        <div className="preview-card-container" ref={previewCardRef}>
          {/* Banner Image */}
          {previewBannerImage && (
            <div className="banner-section">
              <img
                src={previewBannerImage}
                alt="Banner"
                className="banner-image"
              />
            </div>
          )}

          {/* Profile Image, Name, and Tagline */}
          <div className="profile-section">
            {previewProfileImage && (
              <img
                src={previewProfileImage}
                alt="Profile"
                className="profile-image"
              />
            )}
            <h2>{formData.productName || "Your Product Name"}</h2>
            <p className="tagline">{formData.tagline || "Your Tagline"}</p>
          </div>

          {/* About Section */}
          <div className="about-section">
            <h3>About</h3>
            <p>{formData.about || "Describe your product or service here."}</p>
          </div>

          {/* Contact/Social Links Section */}
          <div className="contact-section">
            <h3>Contact Information</h3>
            <ul>
              {formData.contactLinks.email && (
                <li>
                  Email:{" "}
                  <a href={`mailto:${formData.contactLinks.email}`}>
                    {formData.contactLinks.email}
                  </a>
                </li>
              )}
              {formData.contactLinks.phone && (
                <li>
                  Phone:{" "}
                  <a href={`tel:${formData.contactLinks.phone}`}>
                    {formData.contactLinks.phone}
                  </a>
                </li>
              )}
              {formData.socialLinks.map((link, index) => (
                link.url && (
                  <li key={index}>
                    {link.platform}:{" "}
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.url}
                    </a>
                  </li>
                )
              ))}
            </ul>
          </div>

          {/* Edit Button */}
          <button className="edit-button" onClick={handleEdit}>
            Edit
          </button>
        </div>
      )}

      {/* Form (always shown, auto-filled with formData) */}
      <div className="create-form" ref={formRef}>
        <h2>{isCreated ? "Edit Your Page" : "Create Your Page"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Banner Image */}
            <div className="form-group">
              <label>Banner Image</label>
              <input
                type="file"
                accept="image/*"
                ref={bannerImageInputRef}
                onChange={(e) => handleFileChange(e, "bannerImage")}
              />
              <p className="hint">
                For the best results on all devices, use an image that’s at least
                2048 x 1152 pixels and 6MB or less.
              </p>
              {bannerImageError && <p className="error">{bannerImageError}</p>}
            </div>

            {/* Profile Image */}
            <div className="form-group">
              <label>Profile Image</label>
              <input
                type="file"
                accept="image/*"
                ref={profileImageInputRef}
                onChange={(e) => handleFileChange(e, "profileImage")}
              />
              <p className="hint">
                For best results, use an image that’s at least 200 x 200 pixels
                and 2MB or less.
              </p>
              {profileImageError && <p className="error">{profileImageError}</p>}
            </div>

            {/* Product/Service Name */}
            <div className="form-group">
              <label>Product/Service Name</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
              />
            </div>

            {/* Tagline */}
            <div className="form-group">
              <label>Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Enter a catchy tagline"
              />
            </div>

            {/* About the Product */}
            <div className="form-group full-width">
              <label>About the Product</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Describe your product or service"
                rows="4"
              />
              <p className="char-count">
                {charCount}/{DESCRIPTION_LIMIT} characters
              </p>
            </div>

            {/* Contact Info / Links */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.contactLinks.email}
                onChange={(e) => handleChange(e, "contactLinks")}
                placeholder="Contact email"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.contactLinks.phone}
                onChange={(e) => handleChange(e, "contactLinks")}
                placeholder="Contact phone number"
              />
            </div>
          </div>

          {/* Social Links Repeater */}
          <div className="social-links-section">
            <h4>Social Links</h4>
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="social-link-entry">
                <select
                  value={link.platform}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "platform", e.target.value)
                  }
                  className="social-link-select"
                >
                  {socialMediaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "url", e.target.value)
                  }
                  placeholder="Enter URL"
                  className="social-link-input"
                />
                <button
                  type="button"
                  className="delete-social-link-button"
                  onClick={() => removeSocialLink(index)}
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-social-link-button"
              onClick={addSocialLink}
            >
              Add New Link
            </button>
          </div>

          {/* Image Preview Area */}
          <div className="image-preview-area">
            <div className="image-preview-container">
              <h4>Banner Image Preview</h4>
              {previewBannerImage ? (
                <div className="image-preview-wrapper">
                  <img
                    src={previewBannerImage}
                    alt="Banner Preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleRemoveImage("bannerImage")}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="image-placeholder">
                  No banner image selected
                </div>
              )}
            </div>
            <div className="image-preview-container">
              <h4>Profile Image Preview</h4>
              {previewProfileImage ? (
                <div className="image-preview-wrapper">
                  <img
                    src={previewProfileImage}
                    alt="Profile Preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleRemoveImage("profileImage")}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="image-placeholder">
                  No profile image selected
                </div>
              )}
            </div>
          </div>

          {/* Create/Update Button */}
          <div className="form-buttons">
            <button type="submit" className="create-button">
              {isCreated ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePage;