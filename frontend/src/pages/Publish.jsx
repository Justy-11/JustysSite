import { useState, useEffect } from "react";
import "../styles/Publish.css";
import api from "../api";
import { BiLogoInstagram, BiLogoFacebook, BiLogoTiktok, BiLogoGithub, 
  BiLogoTwitter, BiLogoWhatsapp, BiLogoYoutube, BiLogoLinkedin, 
  BiLogoTelegram, BiLogoReddit, BiLogoPinterest } from 'react-icons/bi';
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import DOMPurify from 'dompurify';
import { SocialIcon } from 'react-social-icons/component';
import 'react-social-icons/github';
import 'react-social-icons/x';
import 'react-social-icons/instagram';
import 'react-social-icons/facebook';
import 'react-social-icons/linkedin';
import 'react-social-icons/youtube';
import 'react-social-icons/tiktok';
import 'react-social-icons/whatsapp';
import 'react-social-icons/telegram';
import 'react-social-icons/reddit';
import 'react-social-icons/pinterest';

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
  const MAX_PRODUCTS_PER_COLLECTION = 1000;
  const MAX_STANDALONE_PRODUCTS = 1000;
  const PAGE_SIZE = 20;
  const [productPage, setProductPage] = useState(1);
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionDetailPage, setCollectionDetailPage] = useState(1);
  const collectionDetailPageSize = PAGE_SIZE;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pageRes, productsRes, collectionsRes, profileRes] = await Promise.all([
          api.get("/api/page/"),
          api.get("/api/products/"),
          api.get("/api/collections/"),
          api.get("/api/profile/"),
        ]);
        const pageData = pageRes.data || {};
        setPageData(pageData);
        setIsPublished(!!pageData.is_published);
        if (pageData.is_published && pageData.id) {
          setShareableLink(`${window.location.origin}/landingpage/${pageData.id}`);
        } else {
          setShareableLink("");
        }
        const profileData = profileRes.data;
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
      if (pageData?.id) {
        setShareableLink(`${window.location.origin}/landingpage/${pageData.id}`);
      }
      setIsPublished(true);
      showSuccessToast("Page published successfully!");
    } catch (error) {
      console.error("Error publishing page:", error.response?.data || error.message);
      showErrorToast(error.response?.data?.detail || "Failed to publish page.");
    }
  };

  const handleUnpublish = async () => {
    try {
      await api.post("/api/page/unpublish/", {});
      setIsPublished(false);
      setShareableLink("");
      showSuccessToast("Page unpublished successfully!");
    } catch (error) {
      showErrorToast("Failed to unpublish page.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    showSuccessToast("Link copied to clipboard!");
  };

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
    const textOnly = description.replace(/<[^>]+>/g, '');
    if (textOnly.length <= 50) return description;
    let truncated = description.slice(0, 50);
    const lastTagIndex = truncated.lastIndexOf('<');
    if (lastTagIndex > truncated.lastIndexOf('>')) {
      truncated = truncated.slice(0, lastTagIndex);
    }
    return truncated + '...';
  };

  const getCollectionImages = (products) => {
    const imageUrls = products.map((product) => product.image).filter((img) => img);
    const placeholderCount = Math.max(0, 6 - imageUrls.length);
    return [
      ...imageUrls.slice(0, 6),
      ...Array(placeholderCount).fill(null),
    ];
  };

  const productIdsInCollections = new Set();
  collections.forEach(col => {
    (col.products || []).forEach(prod => productIdsInCollections.add(prod.id));
  });
  const standaloneProducts = products.filter(p => !productIdsInCollections.has(p.id)).slice(0, MAX_STANDALONE_PRODUCTS);
  const paginatedStandaloneProducts = standaloneProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
  const paginatedCollections = collections.slice((collectionPage - 1) * PAGE_SIZE, collectionPage * PAGE_SIZE);
  const totalProductPages = Math.ceil(standaloneProducts.length / PAGE_SIZE);
  const totalCollectionPages = Math.ceil(collections.length / PAGE_SIZE);

  const paginatedCollectionProducts = selectedCollection ? (selectedCollection.products || []).slice((collectionDetailPage - 1) * collectionDetailPageSize, collectionDetailPage * collectionDetailPageSize) : [];
  const totalCollectionDetailPages = selectedCollection ? Math.ceil((selectedCollection.products || []).length / collectionDetailPageSize) : 1;

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
        <div style={{ display: "flex", gap: 8 }}>
          <button className="publish-button" onClick={handlePublish}>
            Publish
          </button>
          {isPublished && (
            <button className="publish-button" style={{ background: "#ff4444" }} onClick={handleUnpublish}>
              Unpublish
            </button>
          )}
        </div>
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
                    {socialLinks.filter(link => typeof link === "string" && link.trim()).map((link, index) => (
                      <SocialIcon
                        key={index}
                        url={link}
                        style={{ height: 32, width: 32, marginRight: 0 }}
                        fallback="github"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-publish"
                      />
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
                    {selectedProduct.description && (
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedProduct.description) }} />
                    )}
                    {selectedProduct.price && <p>Price: ${selectedProduct.price}</p>}
                    {selectedProduct.stock && <p>Stock: {selectedProduct.stock}</p>}
                  </div>
                </div>
              </div>
            ) : selectedCollection ? (
              <div className="publish-collection-view">
                <button className="publish-back-button" onClick={() => { setSelectedCollection(null); setCollectionDetailPage(1); }}>
                  ← Back
                </button>
                <h4>Collection: {selectedCollection.name}</h4>
                <div className="publish-products-grid">
                  {paginatedCollectionProducts.map((product) => (
                    <div key={product.id} className="publish-product-card" onClick={() => handleProductClick(product)}>
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="publish-product-image"
                        />
                      )}
                      <h5 title={product.title}>{product.title}</h5>
                      {product.description && (
                        <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getShortDescription(product.description)) }} />
                      )}
                      {product.price && (
                        <p>
                          {profileData.currency === 'LKR' ? 'Rs. ' : '$'}
                          {product.price}
                        </p>
                      )}
                    </div>
                  ))}
                  {paginatedCollectionProducts.length === 0 && <p>No products in this collection.</p>}
                </div>
                {totalCollectionDetailPages > 1 && (
                  <div className="pagination-controls">
                    <button onClick={() => setCollectionDetailPage(p => Math.max(1, p - 1))} disabled={collectionDetailPage === 1}>Prev</button>
                    <span>Page {collectionDetailPage} of {totalCollectionDetailPages}</span>
                    <button onClick={() => setCollectionDetailPage(p => Math.min(totalCollectionDetailPages, p + 1))} disabled={collectionDetailPage === totalCollectionDetailPages}>Next</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="publish-products-section">
                  <h4>Your Products</h4>
                  <div className="publish-products-grid">
                    {paginatedStandaloneProducts.length > 0 ? (
                      paginatedStandaloneProducts.map((product) => (
                        <div key={product.id} className="publish-product-card" onClick={() => handleProductClick(product)}>
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="publish-product-image"
                            />
                          )}
                          <h5 title={product.title}>{product.title}</h5>
                          {product.description && (
                            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getShortDescription(product.description)) }} />
                          )}
                          {product.price && (
                            <p>
                              {profileData.currency === 'LKR' ? 'Rs. ' : '$'}
                              {product.price}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No standalone products available.</p>
                    )}
                  </div>
                  {totalProductPages > 1 && (
                    <div className="pagination-controls">
                      <button onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={productPage === 1}>Prev</button>
                      <span>Page {productPage} of {totalProductPages}</span>
                      <button onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))} disabled={productPage === totalProductPages}>Next</button>
                    </div>
                  )}
                </div>
                <div className="publish-collections-section">
                  <h4>Your Collections</h4>
                  <div className="publish-collections-grid">
                    {paginatedCollections.map((collection) => (
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
                    {paginatedCollections.length === 0 && <p>No collections available.</p>}
                  </div>
                  {totalCollectionPages > 1 && (
                    <div className="pagination-controls">
                      <button onClick={() => setCollectionPage(p => Math.max(1, p - 1))} disabled={collectionPage === 1}>Prev</button>
                      <span>Page {collectionPage} of {totalCollectionPages}</span>
                      <button onClick={() => setCollectionPage(p => Math.min(totalCollectionPages, p + 1))} disabled={collectionPage === totalCollectionPages}>Next</button>
                    </div>
                  )}
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