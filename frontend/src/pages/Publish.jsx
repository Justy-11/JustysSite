import { useState, useEffect } from "react";
import "../styles/Publish.css";
import api from "../api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

function Publish() {
  // State for page data
  const [page, setPage] = useState(null);
  // State for products and collections
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Fetch page, products, and collections on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pageRes, productsRes, collectionsRes] = await Promise.all([
          api.get("/api/page/"),
          api.get("/api/products/"),
          api.get("/api/collections/"),
        ]);
        setPage(pageRes.data);
        setProducts(productsRes.data || []);
        setCollections(collectionsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        showErrorToast("Failed to load page data.");
      }
    };
    fetchData();
  }, []);

  // Handle publish/unpublish
  const handlePublish = async () => {
    try {
      const response = await api.post("/api/page/publish/");
      showSuccessToast(response.data.message);
      setPage(response.data.data); // Update page state with new published status
    } catch (error) {
      console.error("Error publishing page:", error.response?.data);
      showErrorToast(error.response?.data?.error || "Failed to publish page.");
    }
  };

  if (!page) {
    return <div className="publish-container">Loading...</div>;
  }

  return (
    <div className="publish-container">
      {/* Publish Button */}
      <div className="publish-button-container">
        <button className="publish-button" onClick={handlePublish}>
          {page.published ? "Unpublish" : "Publish"}
        </button>
      </div>

      {/* Page Preview */}
      <div className="publish-page-preview">
        {/* Banner */}
        {page.banner && (
          <div className="publish-banner-container">
            <img src={page.banner} alt="Store Banner" className="publish-banner-image" />
          </div>
        )}

        {/* Profile Section */}
        <div className="publish-profile-section">
          {page.profile_image && (
            <img
              src={page.profile_image}
              alt="Profile"
              className="publish-profile-image"
            />
          )}
          <div className="publish-profile-details">
            <h1>{page.store_name}</h1>
            <p className="publish-short-description">{page.short_description}</p>
          </div>
        </div>

        {/* Long Description */}
        {page.long_description && (
          <div className="publish-description-section">
            <h3>About Us</h3>
            <p>{page.long_description}</p>
          </div>
        )}

        {/* Contact Links */}
        {(page.social_media_linkedin ||
          page.social_media_instagram ||
          page.social_media_facebook ||
          page.email ||
          page.phone) && (
          <div className="publish-contact-section">
            <h3>Contact Us</h3>
            <div className="publish-contact-links">
              {page.social_media_linkedin && (
                <a href={page.social_media_linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              )}
              {page.social_media_instagram && (
                <a href={page.social_media_instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              )}
              {page.social_media_facebook && (
                <a href={page.social_media_facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              )}
              {page.email && (
                <a href={`mailto:${page.email}`}>{page.email}</a>
              )}
              {page.phone && (
                <a href={`tel:${page.phone}`}>{page.phone}</a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Products and Collections Preview */}
      <div className="publish-preview-card-container">
        {selectedCollection ? (
          <>
            <button
              className="publish-back-button"
              onClick={() => setSelectedCollection(null)}
            >
              Back to All Products
            </button>
            <h3>Collection: {selectedCollection.name}</h3>
            <div className="publish-products-grid">
              {selectedCollection.products.map((product) => (
                <div key={product.id} className="publish-preview-product-card">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="publish-product-image"
                    />
                  )}
                  <h4>{product.title}</h4>
                  <p>{product.description}</p>
                  <p>Price: ${product.price}</p>
                  <p>Stock: {product.stock || "N/A"}</p>
                </div>
              ))}
              {selectedCollection.products.length === 0 && (
                <p>No products in this collection.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <h3>Products</h3>
            <div className="publish-products-grid">
              {products
                .filter((product) => !product.collection_name) // Only show standalone products
                .map((product) => (
                  <div key={product.id} className="publish-preview-product-card">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="publish-product-image"
                      />
                    )}
                    <h4>{product.title}</h4>
                    <p>{product.description}</p>
                    <p>Price: ${product.price}</p>
                    <p>Stock: {product.stock || "N/A"}</p>
                  </div>
                ))}
              {products.filter((product) => !product.collection_name).length === 0 && (
                <p>No standalone products added yet.</p>
              )}
            </div>
            <h3>Collections</h3>
            <div className="publish-collections-grid">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="publish-collection-card"
                  onClick={() => setSelectedCollection(collection)}
                >
                  <h4>{collection.name}</h4>
                  <p>{collection.products.length} product(s)</p>
                </div>
              ))}
              {collections.length === 0 && <p>No collections added yet.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Publish;