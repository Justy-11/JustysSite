import { useState, useEffect, useRef } from "react";
import "../styles/CreatePage.css";
import api from "../api";

function CreatePage() {
  const [isCreated, setIsCreated] = useState(false);
  const [formData, setFormData] = useState({
    profileImage: null,
    productName: "",
    tagline: "",
    bannerImage: null,
    about: "",
    contactLinks: { email: "", phone: "" },
    removeProfileImage: false,
    removeBannerImage: false,
  });
  const [previewProfileImage, setPreviewProfileImage] = useState(null);
  const [previewBannerImage, setPreviewBannerImage] = useState(null);
  const [profileImageError, setProfileImageError] = useState("");
  const [bannerImageError, setBannerImageError] = useState("");
  const [existingProfileImage, setExistingProfileImage] = useState(null);
  const [existingBannerImage, setExistingBannerImage] = useState(null);
  const profileImageInputRef = useRef(null);
  const bannerImageInputRef = useRef(null);
  const previewCardRef = useRef(null);
  const formRef = useRef(null);
  const DESCRIPTION_LIMIT = 500;
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get("/api/page/");
        const data = response.data;
        if (data && Object.keys(data).length > 0) {
          setFormData({
            profileImage: null,
            productName: data.product_name || "",
            tagline: data.tagline || "",
            bannerImage: null,
            about: data.about || "",
            contactLinks: {
              email: data.email || "",
              phone: data.phone || "",
            },
            removeProfileImage: false,
            removeBannerImage: false,
          });
          setPreviewProfileImage(data.profile_image || null);
          setPreviewBannerImage(data.banner_image || null);
          setExistingProfileImage(data.profile_image || null);
          setExistingBannerImage(data.banner_image || null);
          setCharCount(data.about ? data.about.length : 0);
          setIsCreated(true);
        } else {
          setFormData({
            profileImage: null,
            productName: "",
            tagline: "",
            bannerImage: null,
            about: "",
            contactLinks: { email: "", phone: "" },
            removeProfileImage: false,
            removeBannerImage: false,
          });
          setIsCreated(false);
        }
      } catch (error) {
        console.error("Error fetching page data:", error.response?.data || error.message);
        alert("Failed to load page data. Please try again.");
      }
    };
    fetchPageData();
  }, []);

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section === "contactLinks") {
      setFormData({
        ...formData,
        contactLinks: { ...formData.contactLinks, [name]: value },
      });
    } else if (name === "about") {
      if (value.length <= DESCRIPTION_LIMIT) {
        setFormData({ ...formData, [name]: value });
        setCharCount(value.length);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (field === "profileImage") {
        const maxSizeInMB = 2;
        if (fileSizeInMB > maxSizeInMB) {
          setProfileImageError(`File size exceeds ${maxSizeInMB}MB limit.`);
          return;
        }
        setProfileImageError("");
        const previewUrl = URL.createObjectURL(file);
        setPreviewProfileImage(previewUrl);
        setFormData({ ...formData, profileImage: file, removeProfileImage: false });
        setExistingProfileImage(null);
      } else if (field === "bannerImage") {
        const maxSizeInMB = 6;
        if (fileSizeInMB > maxSizeInMB) {
          setBannerImageError(`File size exceeds ${maxSizeInMB}MB limit.`);
          return;
        }
        setBannerImageError("");
        const previewUrl = URL.createObjectURL(file);
        setPreviewBannerImage(previewUrl);
        setFormData({ ...formData, bannerImage: file, removeBannerImage: false });
        setExistingBannerImage(null);
      }
    }
  };

  const handleRemoveImage = (field) => {
    if (field === "profileImage") {
      setPreviewProfileImage(null);
      setProfileImageError("");
      setFormData({ ...formData, profileImage: null, removeProfileImage: true });
      setExistingProfileImage(null);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
    } else if (field === "bannerImage") {
      setPreviewBannerImage(null);
      setBannerImageError("");
      setFormData({ ...formData, bannerImage: null, removeBannerImage: true });
      setExistingBannerImage(null);
      if (bannerImageInputRef.current) {
        bannerImageInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (profileImageError || bannerImageError) {
      alert("Please fix the errors before submitting.");
      return;
    }

    const formDataToSend = new FormData();
    if (formData.profileImage) {
      formDataToSend.append("profile_image", formData.profileImage);
    } else if (formData.removeProfileImage) {
      formDataToSend.append("profile_image", "");
    }
    if (formData.bannerImage) {
      formDataToSend.append("banner_image", formData.bannerImage);
    } else if (formData.removeBannerImage) {
      formDataToSend.append("banner_image", "");
    }
    formDataToSend.append("product_name", formData.productName);
    formDataToSend.append("tagline", formData.tagline);
    formDataToSend.append("about", formData.about);
    formDataToSend.append("email", formData.contactLinks.email);
    formDataToSend.append("phone", formData.contactLinks.phone);

    // Debug FormData contents
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`FormData: ${key} = ${value}`);
    }

    try {
      const response = await api.post("/api/page/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Page saved to backend:", response.data);
      setFormData({
        ...formData,
        removeProfileImage: false,
        removeBannerImage: false,
      });
      setExistingProfileImage(response.data.profile_image || null);
      setExistingBannerImage(response.data.banner_image || null);
      setIsCreated(true);
      setTimeout(() => {
        if (previewCardRef.current) {
          previewCardRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    } catch (error) {
      console.error("Error saving page:", error.response?.data || error.message);
      if (error.response?.data) {
        const errors = error.response.data;
        const errorMessages = Object.keys(errors).map((key) => {
          const message = Array.isArray(errors[key]) ? errors[key].join(", ") : errors[key];
          return `${key}: ${message}`;
        });
        alert(`Failed to save page: ${errorMessages.join("; ")}`);
      } else {
        alert("Failed to save page. Please try again.");
      }
    }
  };

  const handleEdit = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="create-page-container">
      {isCreated && (
        <div className="preview-card-container" ref={previewCardRef}>
          {previewBannerImage ? (
            <div className="banner-section">
              <img src={previewBannerImage} alt="Banner" className="banner-image" />
            </div>
          ) : (
            <div className="banner-placeholder">No banner image selected</div>
          )}
          <div className="profile-section">
            {previewProfileImage ? (
              <img src={previewProfileImage} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-placeholder">No profile image selected</div>
            )}
          </div>
          <div className="about-section">
            <h2>{formData.productName || "Your Product Name"}</h2>
            <p className="tagline">{formData.tagline || "Your Tagline"}</p>
            <p>{formData.about || "Describe your product or service here."}</p>
          </div>
          <div className="contact-section">
            <ul>
              {formData.contactLinks.email && (
                <li>
                  Email: <a href={`mailto:${formData.contactLinks.email}`}>{formData.contactLinks.email}</a>
                </li>
              )}
              {formData.contactLinks.phone && (
                <li>
                  Phone: <a href={`tel:${formData.contactLinks.phone}`}>{formData.contactLinks.phone}</a>
                </li>
              )}
            </ul>
          </div>
          <button className="edit-button" onClick={handleEdit}>
            Edit
          </button>
        </div>
      )}
      <div className="create-form" ref={formRef}>
        <h2>{isCreated ? "Edit Your Page" : "Create Your Page"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Banner Image</label>
              <input
                type="file"
                accept="image/*"
                ref={bannerImageInputRef}
                onChange={(e) => handleFileChange(e, "bannerImage")}
              />
              {existingBannerImage && !formData.bannerImage && (
                <p className="hint">
                  Existing image: <a href={existingBannerImage} target="_blank" rel="noopener noreferrer">View</a>
                </p>
              )}
              <p className="hint">
                For the best results on all devices, use an image that’s at least 2048 x 1152 pixels and 6MB or less.
              </p>
              {bannerImageError && <p className="error">{bannerImageError}</p>}
            </div>
            <div className="form-group">
              <label>Profile Image</label>
              <input
                type="file"
                accept="image/*"
                ref={profileImageInputRef}
                onChange={(e) => handleFileChange(e, "profileImage")}
              />
              {existingProfileImage && !formData.profileImage && (
                <p className="hint">
                  Existing image: <a href={existingProfileImage} target="_blank" rel="noopener noreferrer">View</a>
                </p>
              )}
              <p className="hint">
                For best results, use an image that’s at least 200 x 200 pixels and 2MB or less.
              </p>
              {profileImageError && <p className="error">{profileImageError}</p>}
            </div>
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
          <div className="image-preview-area">
            <div className="image-preview-container">
              <h4>Banner Image Preview</h4>
              {previewBannerImage ? (
                <div className="image-preview-wrapper">
                  <img src={previewBannerImage} alt="Banner Preview" className="image-preview" />
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleRemoveImage("bannerImage")}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="image-placeholder">No banner image selected</div>
              )}
            </div>
            <div className="image-preview-container">
              <h4>Profile Image Preview</h4>
              {previewProfileImage ? (
                <div className="image-preview-wrapper">
                  <img src={previewProfileImage} alt="Profile Preview" className="image-preview" />
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleRemoveImage("profileImage")}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="image-placeholder">No profile image selected</div>
              )}
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="create-button">{isCreated ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePage;