import { useState, useEffect } from "react";
import "../styles/Publish.css";
import api from "../api";
import { BiLogoInstagram, BiLogoFacebook, BiLogoTiktok, BiLogoGithub, 
  BiLogoTwitter, BiLogoWhatsapp, BiLogoYoutube, BiLogoLinkedin, 
  BiLogoTelegram, BiLogoReddit, BiLogoPinterest } from 'react-icons/bi';
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

function Publish() {
  const [pageData, setPageData] = useState(null);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [shareableLink, setShareableLink] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [profileData, setProfileData] = useState({ currency: "LKR" });
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pageRes, productsRes, collectionsRes, profileRes] = await Promise.all([
          api.get("/api/page/"),
          api.get("/api/products/"),
          api.get("/api/collections/"),
          api.get("/api/profile/"),
        ]);
        const profileData = profileRes.data;
        setPageData(pageRes.data || null);
        setProducts(productsRes.data || []);
        setCollections(collectionsRes.data || []);
        setProfileData(profileRes.data || { currency: "LKR" });
        const links = profileData.social_links 
          ? typeof profileData.social_links === "string" 
            ? profileData.social_links.split(",").map(link => link.trim())
            : Array.isArray(profileData.social_links) 
              ? profileData.social_links.map(link => link.url)
              : []
          : [];
        setSocialLinks(links);
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
        showErrorToast("Failed to load page data. Please try again.");
      }
    };
    fetchData();
  }, []);

  const handlePublish = async () => {
    try {
      const response = await api.post("/api/page/publish/", {});
      setShareableLink(response.data.shareable_link || `${window.location.origin}/public/${pageData?.id}`);
      setIsPublished(true);
      showSuccessToast("Page published successfully!");
    } catch (error) {
      console.error("Error publishing page:", error.response?.data || error.message);
      showErrorToast(error.response?.data?.detail || "Failed to publish page.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    showSuccessToast("Link copied to clipboard!");
  };

  // const renderSocialLinks = () => {
  //   if (!pageData?.profile?.social_links) return null;
  //   const urls = pageData.profile.social_links.split(",").filter((url) => url.trim());
  //   return (
  //     <div className="publish-social-links">
  //       {urls.map((url, index) => (
  //         <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="publish-social-link">
  //           {new URL(url).hostname}
  //         </a>
  //       ))}
  //     </div>
  //   );
  // };

  const handleCollectionClick = (collection) => {
    setSelectedCollection(collection);
  };

  const handleBack = () => {
    setSelectedCollection(null);
    setSelectedProduct(null);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const getShortDescription = (description) => {
    if (!description) return "";
    const words = description.split(" ").slice(0, 3);
    return words.join(" ") + (words.length < description.split(" ").length ? "..." : "");
  };

  const getCollectionImages = (products) => {
    const imageUrls = products.map((product) => product.image).filter((img) => img);
    const placeholderCount = 6 - imageUrls.length;
    return [
      ...imageUrls.slice(0, 6), // Take top 6 images
      ...Array(placeholderCount).fill(null), // Fill remaining with null for placeholders
    ];
  };

  const getSocialIcon = (url) => {
    if (url.includes("instagram.com")) return <BiLogoInstagram />;
    if (url.includes("facebook.com")) return <BiLogoFacebook />;
    if (url.includes("tiktok.com")) return <BiLogoTiktok />;
    if (url.includes("github.com")) return <BiLogoGithub />;
    if (url.includes("twitter.com")) return <BiLogoTwitter />;
    if (url.includes("wa.me")) return <BiLogoWhatsapp />;
    if (url.includes("youtube.com")) return <BiLogoYoutube />;
    if (url.includes("linkedin.com")) return <BiLogoLinkedin />;
    if (url.includes("t.me")) return <BiLogoTelegram />;
    if (url.includes("reddit.com")) return <BiLogoReddit />;
    if (url.includes("pinterest.com")) return <BiLogoPinterest />;
    return null;
  };

  return (
    <div className="publish-container">
      <div className="publish-header">
        <h2>Preview & Publish Your Page</h2>
        <button className="publish-button" onClick={handlePublish} disabled={isPublished}>
          {isPublished ? "Published" : "Publish"}
        </button>
      </div>

      {isPublished && shareableLink && (
        <div className="publish-shareable-link">
          <p>Your shareable link:</p>
          <div className="publish-link-container">
            <input type="text" value={shareableLink} readOnly className="publish-link-input" />
            <button className="publish-copy-button" onClick={copyToClipboard}>
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="publish-preview-container">
        {pageData ? (
          <>
            <div className="publish-top-section">
              <div className="publish-banner-section" style={{ backgroundImage: pageData.banner_image ? `url(${pageData.banner_image})` : 'none' }}>
                {!pageData.banner_image && <div className="banner-placeholder">No banner image set</div>}
              </div>
              <div className="publish-profile-section">
                {pageData.profile_image ? (
                  <img src={pageData.profile_image} alt="Profile" className="publish-profile-image" />
                ) : (
                  <div className="profile-placeholder">No profile image set</div>
                )}
              </div>
              <div className="publish-about-details-container">
                <h3>{pageData.product_name || "Your Product Name"}</h3>
                <p className="publish-tagline">{pageData.tagline || "Your Tagline"}</p>
                {/* {renderSocialLinks()} */}
                <div className="publish-about-section">
                  <p>{pageData.about || "Describe your product or service here."}</p>
                </div>
                <div className="publish-contact-section">
                  <ul>
                    {pageData.email && (
                      <li>
                        Email: <a href={`mailto:${pageData.email}`}>{pageData.email}</a>
                      </li>
                    )}
                    {pageData.phone && (
                      <li>
                        Phone: <a href={`tel:${pageData.phone}`}>{pageData.phone}</a>
                      </li>
                    )}
                  </ul>
                  {socialLinks.length > 0 && (
                  <div className="social-links-preview-publish">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-publish"
                      >
                        {getSocialIcon(link)}
                      </a>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>
            <hr className="publish-divider" />
            {selectedProduct ? (
              <div className="publish-product-detail-view">
                <button className="publish-back-button" onClick={handleBack}>
                  ← Back
                </button>
                <div className="publish-product-detail">
                  <div className="publish-product-image-container">
                    {selectedProduct.image && (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.title}
                        className="publish-product-image-large"
                      />
                    )}
                  </div>
                  <div className="publish-product-info">
                    <h4>{selectedProduct.title}</h4>
                    {selectedProduct.description && <p>{selectedProduct.description}</p>}
                    {selectedProduct.price && <p>Price: ${selectedProduct.price}</p>}
                    {selectedProduct.stock && <p>Stock: {selectedProduct.stock}</p>}
                  </div>
                </div>
              </div>
            ) : selectedCollection ? (
              <div className="publish-collection-view">
                <button className="publish-back-button" onClick={handleBack}>
                  ← Back
                </button>
                <h4>Collection: {selectedCollection.name}</h4>
                <div className="publish-products-grid">
                  {selectedCollection.products.length > 0 ? (
                    selectedCollection.products.map((product) => (
                      <div key={product.id} className="publish-product-card" onClick={() => handleProductClick(product)}>
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="publish-product-image"
                          />
                        )}
                        <h5>{product.title}</h5>
                        {product.description && <p>{getShortDescription(product.description)}</p>}
                        {product.price && (
                          <p>
                            {profileData.currency === 'LKR' ? 'Rs. ' : '$'}
                            {product.price}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No products in this collection.</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="publish-products-section">
                  <h4>Your Products</h4>
                  <div className="publish-products-grid">
                    {products
                      .filter((product) => !product.collection_name)
                      .map((product) => (
                        <div key={product.id} className="publish-product-card" onClick={() => handleProductClick(product)}>
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="publish-product-image"
                            />
                          )}
                          <h5>{product.title}</h5>
                          {product.description && <p>{getShortDescription(product.description)}</p>}
                          {product.price && (
                            <p>
                              {profileData.currency === 'LKR' ? 'Rs. ' : '$'}
                              {product.price}
                            </p>
                          )}
                        </div>
                      ))}
                    {products.filter((product) => !product.collection_name).length === 0 && (
                      <p>No standalone products added yet.</p>
                    )}
                  </div>
                </div>
                <div className="publish-collections-section">
                  <h4>Your Collections</h4>
                  <div className="publish-collections-grid">
                    {collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="publish-collection-card"
                        onClick={() => handleCollectionClick(collection)}
                      >
                        <div className="publish-collection-image-grid">
                          {getCollectionImages(collection.products).map((image, index) =>
                            image ? (
                              <img
                                key={index}
                                src={image}
                                alt={`${collection.name} image ${index + 1}`}
                                className="publish-collection-image"
                              />
                            ) : (
                              <div key={index} className="publish-collection-placeholder"></div>
                            )
                          )}
                        </div>
                        <h5>{collection.name}</h5>
                        <p>{collection.products.length} product(s)</p>
                      </div>
                    ))}
                    {collections.length === 0 && <p>No collections added yet.</p>}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <p>No page data available. Please create a page first.</p>
        )}
      </div>
    </div>
  );
}

export default Publish;