import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { BiLogoInstagram, BiLogoFacebook, BiLogoTiktok, BiLogoGithub, 
  BiLogoTwitter, BiLogoWhatsapp, BiLogoYoutube, BiLogoLinkedin, 
  BiLogoTelegram, BiLogoReddit, BiLogoPinterest } from 'react-icons/bi';
import DOMPurify from 'dompurify';
import NavBar from "../components/NavBar";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "../styles/PublicProductPage.css";
import { SocialIcon } from 'react-social-icons/component';
import 'react-social-icons/wa.me';
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
import Skeleton from '@mui/material/Skeleton';

function PublicProductPage() {
  const { pageId } = useParams();
  const [pageData, setPageData] = useState(null);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [profileData, setProfileData] = useState({ currency: "LKR" });
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const PAGE_SIZE = 20;
  const [productPage, setProductPage] = useState(1);
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionDetailPage, setCollectionDetailPage] = useState(1);
  const collectionDetailPageSize = PAGE_SIZE;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pageRes, productsRes, collectionsRes, profileRes] = await Promise.all([
          api.get(`/api/page/public/${pageId}/`),
          api.get(`/api/products/public/${pageId}/`),
          api.get(`/api/collections/public/${pageId}/`),
          api.get(`/api/profile/public/${pageId}/`),
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
        setError("Page not found or not published");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pageId]);

  const navLinks = [
    { href: "/landingpage", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

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
    if (textOnly.length <= 50) return textOnly;
    return textOnly.slice(0, 50) + '...';
  };

  const getCollectionImages = (products) => {
    const imageUrls = products.map((product) => product.image_url).filter((img) => img);
    const placeholderCount = Math.max(0, 6 - imageUrls.length);
    return [
      ...imageUrls.slice(0, 6),
      ...Array(placeholderCount).fill(null),
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

  // Get all product IDs that are in collections
  const productIdsInCollections = new Set();
  collections.forEach(col => {
    (col.products || []).forEach(prod => productIdsInCollections.add(prod.id));
  });
  // Only show products not in any collection
  const standaloneProducts = products.filter(p => !productIdsInCollections.has(p.id));

  const paginatedStandaloneProducts = standaloneProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
  const paginatedCollections = collections.slice((collectionPage - 1) * PAGE_SIZE, collectionPage * PAGE_SIZE);
  const totalProductPages = Math.ceil(standaloneProducts.length / PAGE_SIZE);
  const totalCollectionPages = Math.ceil(collections.length / PAGE_SIZE);

  const paginatedCollectionProducts = selectedCollection ? (selectedCollection.products || []).slice((collectionDetailPage - 1) * collectionDetailPageSize, collectionDetailPage * collectionDetailPageSize) : [];
  const totalCollectionDetailPages = selectedCollection ? Math.ceil((selectedCollection.products || []).length / collectionDetailPageSize) : 1;

  if (loading) {
    return (
      <div className="public-page-container">
        <div className="public-page-content">
          <div className="public-top-section">
            <div className="public-banner-section">
              <Skeleton variant="rectangular" width={400} height={180} />
            </div>
            <div className="public-profile-section">
              <Skeleton variant="circular" width={120} height={120} />
            </div>
            <div className="public-about-details-container">
              <Skeleton variant="text" width={200} />
              <Skeleton variant="text" width={150} />
              <Skeleton variant="rectangular" width={350} height={60} />
            </div>
          </div>
          <hr className="public-divider" />
          <div className="public-products-section">
            <Skeleton variant="text" width={150} />
            <div className="public-products-grid">
              {[...Array(4)].map((_, i) => (
                <div className="public-product-card" key={i}>
                  <Skeleton variant="rectangular" width={120} height={120} />
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="text" width={80} />
                </div>
              ))}
            </div>
          </div>
          <div className="public-collections-section">
            <Skeleton variant="text" width={150} />
            <div className="public-collections-grid">
              {[...Array(2)].map((_, i) => (
                <div className="public-collection-card" key={i}>
                  <Skeleton variant="rectangular" width={120} height={120} />
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="text" width={80} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="public-page-container">
        <div className="error-message">
          <h2>Page Not Found</h2>
          <p>{error || "This page doesn't exist or hasn't been published yet."}</p>
          <a href="/landingpage" className="back-to-home">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar links={navLinks} />
      <div className="public-page-container">
        <div className="public-page-content">
          <div className="public-top-section">
            <div className="public-banner-section" style={{ backgroundImage: pageData.banner_image_url ? `url(${pageData.banner_image_url})` : 'none' }}>
              {!pageData.banner_image_url && <div className="banner-placeholder">No banner image set</div>}
            </div>
            <div className="public-profile-section">
              {pageData.profile_image_url ? (
                <img src={pageData.profile_image_url} alt="Profile" className="public-profile-image" />
              ) : (
                <div className="profile-placeholder">No profile image set</div>
              )}
            </div>
            <div className="public-about-details-container">
              <h3>{pageData.product_name || "Product Name"}</h3>
              <p className="public-tagline">{pageData.tagline || "Product Tagline"}</p>
              <div className="public-about-section">
                <p>{pageData.about || "Product description will appear here."}</p>
              </div>
              <div className="public-contact-section">
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
                  <div className="social-links-public">
                    {socialLinks.filter(link => typeof link === "string" && link.trim()).map((link, index) => (
                      <SocialIcon
                        key={index}
                        url={link}
                        style={{ height: 32, width: 32, marginRight: 0 }}
                        fallback="github"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-public"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <hr className="public-divider" />
          
          {selectedProduct ? (
            <div className="public-product-detail-view">
              <button className="public-back-button" onClick={handleBack}>
                ← Back
              </button>
              <div className="public-product-detail">
                <div className="public-product-image-container">
                  {selectedProduct.image_url && (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.title}
                      className="public-product-image-large"
                    />
                  )}
                </div>
                <div className="public-product-info">
                  <h4>{selectedProduct.title}</h4>
                  {selectedProduct.description && (
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedProduct.description) }} />
                  )}
                  {selectedProduct.price && (
                    <p>
                      Price: {profileData.currency === 'LKR' ? 'Rs. ' : '$'}
                      {selectedProduct.price}
                    </p>
                  )}
                  {selectedProduct.stock && <p>Stock: {selectedProduct.stock}</p>}
                </div>
              </div>
            </div>
          ) : selectedCollection ? (
            <div className="public-collection-view">
              <button className="public-back-button" onClick={() => { setSelectedCollection(null); setCollectionDetailPage(1); }}>
                ← Back
              </button>
              <h4>Collection: {selectedCollection.name}</h4>
              <div className="public-products-grid">
                {paginatedCollectionProducts.map((product) => (
                  <div key={product.id} className="public-product-card" onClick={() => handleProductClick(product)}>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="public-product-image"
                      />
                    )}
                    <h5 title={product.title}>{product.title}</h5>
                    {product.description && (
                      <p>{getShortDescription(product.description)}</p>
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
              <div className="public-products-section">
                <h4>Products</h4>
                                  <div className="public-products-grid">
                    {paginatedStandaloneProducts.length > 0 ? (
                      paginatedStandaloneProducts.map((product) => (
                        <div key={product.id} className="public-product-card" onClick={() => handleProductClick(product)}>
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="public-product-image"
                            />
                          )}
                          <h5 title={product.title}>{product.title}</h5>
                          {product.description && (
                            <p>{getShortDescription(product.description)}</p>
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
              
              <div className="public-collections-section">
                <h4>Collections</h4>
                <div className="public-collections-grid">
                  {paginatedCollections.map((collection) => (
                    <div
                      key={collection.id}
                      className="public-collection-card"
                      onClick={() => handleCollectionClick(collection)}
                    >
                      <div className="public-collection-image-grid">
                        {getCollectionImages(collection.products).map((image, index) =>
                          image ? (
                            <img
                              key={index}
                              src={image}
                              alt={`${collection.name} image ${index + 1}`}
                              className="public-collection-image"
                            />
                          ) : (
                            <div key={index} className="public-collection-placeholder"></div>
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
        </div>
      </div>
    </>
  );
}

export default PublicProductPage; 