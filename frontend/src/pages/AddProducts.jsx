import { useState, useEffect, useRef } from "react";
import "../styles/AddProducts.css";
import api from "../api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

function AddProducts() {
  // State for collection toggle and name
  const [createCollection, setCreateCollection] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  // State for bulk image upload
  const [bulkImages, setBulkImages] = useState([]);
  const [bulkImagePreviews, setBulkImagePreviews] = useState([]);
  const [bulkProductDetails, setBulkProductDetails] = useState([]);
  // State for bulk CSV upload
  const [csvFile, setCsvFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  // State for preview data
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  // State for modals
  const [modalType, setModalType] = useState(null); // 'edit-product', 'delete-product', 'edit-collection', 'delete-collection'
  const [modalData, setModalData] = useState(null);
  // Refs
  const bulkImageInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const zipInputRef = useRef(null);
  const previewRef = useRef(null);

  // Fetch products and collections on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, collectionsRes] = await Promise.all([
          api.get("/api/products/"),
          api.get("/api/collections/"),
        ]);
        setProducts(productsRes.data || []); // Ensure empty array if no data
        setCollections(collectionsRes.data || []); // Ensure empty array if no data
      } catch (error) {
        console.error("Error fetching data:", error);
        showErrorToast("Failed to load products and collections.");
      }
    };
    fetchData();
  }, []);

  // Handle bulk image upload
  const handleBulkImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setBulkImages(files);
    setBulkImagePreviews(previews);
    setBulkProductDetails(
      files.map((file) => ({
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: "",
        price: "",
        stock: "",
      }))
    );
  };

  // Handle bulk product details change
  const handleBulkProductChange = (index, field, value) => {
    const updatedDetails = [...bulkProductDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setBulkProductDetails(updatedDetails);
  };

  // Remove a bulk image
  const handleRemoveBulkImage = (index) => {
    const updatedImages = bulkImages.filter((_, i) => i !== index);
    const updatedPreviews = bulkImagePreviews.filter((_, i) => i !== index);
    const updatedDetails = bulkProductDetails.filter((_, i) => i !== index);
    setBulkImages(updatedImages);
    setBulkImagePreviews(updatedPreviews);
    setBulkProductDetails(updatedDetails);
    if (bulkImageInputRef.current && updatedImages.length === 0) {
      bulkImageInputRef.current.value = "";
    }
  };

  // Remove all bulk images
  const handleRemoveAllImages = () => {
    setBulkImages([]);
    setBulkImagePreviews([]);
    setBulkProductDetails([]);
    if (bulkImageInputRef.current) {
      bulkImageInputRef.current.value = "";
    }
  };

  // Handle adding bulk products
  const handleAddBulkProducts = async () => {
    if (createCollection && !collectionName) {
      showErrorToast("Please enter a collection name.");
      return;
    }
    if (bulkProductDetails.some((detail) => !detail.title || !detail.price)) {
      showErrorToast("Please fill in all required fields (Title and Price).");
      return;
    }
    const formData = new FormData();
    if (createCollection && collectionName) {
      formData.append("collection", collectionName);
    }
    bulkProductDetails.forEach((detail, index) => {
      formData.append(`products[${index}][title]`, detail.title);
      formData.append(`products[${index}][description]`, detail.description || "");
      formData.append(`products[${index}][price]`, detail.price);
      formData.append(`products[${index}][stock]`, detail.stock || "");
      if (bulkImages[index]) {
        formData.append(`products[${index}][image]`, bulkImages[index]);
      }
    });
    try {
      await api.post("/api/products/add/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccessToast("Products added successfully!");
      setBulkImages([]);
      setBulkImagePreviews([]);
      setBulkProductDetails([]);
      if (bulkImageInputRef.current) {
        bulkImageInputRef.current.value = "";
      }
      setCollectionName("");
      setCreateCollection(false);
      // Refresh products and collections
      const [productsRes, collectionsRes] = await Promise.all([
        api.get("/api/products/"),
        api.get("/api/collections/"),
      ]);
      setProducts(productsRes.data || []);
      setCollections(collectionsRes.data || []);
    } catch (error) {
      console.error("Error saving products:", error.response?.data);
      showErrorToast(error.response?.data?.error || "Failed to add products.");
    }
  };

  // Handle CSV file upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };

  // Handle ZIP file upload
  const handleZipUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setZipFile(file);
    }
  };

  // Handle CSV upload submission
  const handleCsvUploadSubmit = async () => {
    if (createCollection && !collectionName) {
      showErrorToast("Please enter a collection name.");
      return;
    }
    if (!csvFile || !zipFile) {
      showErrorToast("Please upload both a CSV and ZIP file.");
      return;
    }
    const formData = new FormData();
    formData.append("csv_file", csvFile);
    formData.append("zip_file", zipFile);
    if (createCollection && collectionName) {
      formData.append("collection", collectionName);
    }
    try {
      await api.post("/api/products/add-csv/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccessToast("Products added successfully from CSV!");
      setCsvFile(null);
      setZipFile(null);
      if (csvInputRef.current) {
        csvInputRef.current.value = "";
      }
      if (zipInputRef.current) {
        zipInputRef.current.value = "";
      }
      setCollectionName("");
      setCreateCollection(false);
      // Refresh products and collections
      const [productsRes, collectionsRes] = await Promise.all([
        api.get("/api/products/"),
        api.get("/api/collections/"),
      ]);
      setProducts(productsRes.data || []);
      setCollections(collectionsRes.data || []);
    } catch (error) {
      console.error("Error uploading CSV:", error.response?.data);
      showErrorToast(error.response?.data?.error || "Failed to upload CSV.");
    }
  };

  // Function to refresh data after updates
  const refreshData = async () => {
    try {
      const [productsRes, collectionsRes] = await Promise.all([
        api.get("/api/products/"),
        api.get("/api/collections/"),
      ]);
      const updatedProducts = productsRes.data || [];
      const updatedCollections = collectionsRes.data || [];
      setProducts(updatedProducts);
      setCollections(updatedCollections);

      // If a collection is selected, update its data
      if (selectedCollection) {
        const updatedSelectedCollection = updatedCollections.find(
          (col) => col.id === selectedCollection.id
        );
        if (updatedSelectedCollection) {
          setSelectedCollection(updatedSelectedCollection);
        } else {
          // If the selected collection no longer exists (e.g., deleted), go back
          setSelectedCollection(null);
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      showErrorToast("Failed to refresh products and collections.");
    }
  };

  // Handle edit product
  const handleEditProduct = async () => {
    if (!modalData.title || !modalData.price) {
      showErrorToast("Title and Price are required.");
      return;
    }
    const formData = new FormData();
    formData.append("title", modalData.title);
    formData.append("description", modalData.description || "");
    formData.append("price", modalData.price);
    formData.append("stock", modalData.stock || "");
    if (modalData.image instanceof File) {
      formData.append("image", modalData.image);
    }
    if (modalData.collection) {
      formData.append("collection", modalData.collection);
    } else {
      formData.append("collection", ""); // Ensure null collection is sent
    }
    try {
      await api.put(`/api/products/${modalData.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccessToast("Product updated successfully!");
      // Close modal immediately
      setModalType(null);
      setModalData(null);
      // Refresh data
      await refreshData();
    } catch (error) {
      console.error("Error updating product:", error.response?.data);
      showErrorToast(error.response?.data?.error || "Failed to update product.");
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    try {
      await api.delete(`/api/products/${modalData.id}/`);
      showSuccessToast("Product deleted successfully!");
      // Close modal immediately
      setModalType(null);
      setModalData(null);
      // Refresh data
      await refreshData();
    } catch (error) {
      console.error("Error deleting product:", error.response?.data);
      showErrorToast(error.response?.data?.error || "Failed to delete product.");
    }
  };

  // Handle edit collection
  const handleEditCollection = async () => {
    if (!modalData.name) {
      showErrorToast("Collection name is required.");
      return;
    }
    try {
      await api.put(`/api/collections/${modalData.id}/`, { name: modalData.name });
      showSuccessToast("Collection updated successfully!");
      // Close modal immediately
      setModalType(null);
      setModalData(null);
      // Refresh data
      await refreshData();
    } catch (error) {
      console.error("Error updating collection:", error.response?.data);
      showErrorToast(error.response?.data?.error || "Failed to update collection.");
    }
  };

  // Handle delete collection
  const handleDeleteCollection = async () => {
    try {
      await api.delete(`/api/collections/${modalData.id}/`);
      showSuccessToast("Collection deleted successfully!");
      // Close modal immediately
      setModalType(null);
      setModalData(null);
      setSelectedCollection(null);
      // Refresh data
      await refreshData();
    } catch (error) {
      console.error("Error deleting collection:", error.response?.data);
      showErrorToast(error.response?.data?.error || "Failed to delete collection.");
    }
  };

  // Download example CSV
  const downloadExampleCsv = () => {
    const csvContent = `Title,Description,Price,Stock,Image File Name
"Smartphone","A high-end smartphone with 128GB storage","699.99","50","smartphone.jpg"
"Laptop","A powerful laptop for gaming and work","1299.99","30","laptop.jpg"`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "example-product-upload.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="add-products-container">
      <h2>Add Products</h2>

      {/* Preview Card */}
      <div className="preview-card-container" ref={previewRef}>
        {selectedCollection ? (
          <>
            <button
              className="back-button"
              onClick={() => setSelectedCollection(null)}
            >
              Back to All Products
            </button>
            <h3>Collection: {selectedCollection.name}</h3>
            <div className="products-grid">
              {selectedCollection.products.map((product) => (
                <div key={product.id} className="preview-product-card">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="product-image"
                    />
                  )}
                  <h4>{product.title}</h4>
                  <p>{product.description}</p>
                  <p>Price: ${product.price}</p>
                  <p>Stock: {product.stock || "N/A"}</p>
                  <div className="action-buttons">
                    <button
                      onClick={() =>
                        setModalType("edit-product") ||
                        setModalData({
                          id: product.id,
                          title: product.title,
                          description: product.description,
                          price: product.price,
                          stock: product.stock,
                          image: null,
                          collection: product.collection,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setModalType("delete-product") ||
                        setModalData({ id: product.id, title: product.title })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {selectedCollection.products.length === 0 && (
                <p>No products in this collection.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <h3>Your Products</h3>
            <div className="products-grid">
              {products
                .filter((product) => !product.collection_name) // Only show products with no collection
                .map((product) => (
                  <div key={product.id} className="preview-product-card">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="product-image"
                      />
                    )}
                    <h4>{product.title}</h4>
                    <p>{product.description}</p>
                    <p>Price: ${product.price}</p>
                    <p>Stock: {product.stock || "N/A"}</p>
                    <p>Collection: {product.collection_name || "None"}</p>
                    <div className="action-buttons">
                      <button
                        onClick={() =>
                          setModalType("edit-product") ||
                          setModalData({
                            id: product.id,
                            title: product.title,
                            description: product.description,
                            price: product.price,
                            stock: product.stock,
                            image: null,
                            collection: product.collection,
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setModalType("delete-product") ||
                          setModalData({ id: product.id, title: product.title })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              {products.filter((product) => !product.collection_name).length === 0 && (
                <p>No standalone products added yet.</p>
              )}
            </div>
            <h3>Your Collections</h3>
            <div className="collections-grid">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="collection-card"
                  onClick={() => setSelectedCollection(collection)}
                >
                  <h4>{collection.name}</h4>
                  <p>{collection.products.length} product(s)</p>
                  <div className="action-buttons">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalType("edit-collection");
                        setModalData({ id: collection.id, name: collection.name });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalType("delete-collection");
                        setModalData({ id: collection.id, name: collection.name });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {collections.length === 0 && <p>No collections added yet.</p>}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {modalType && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalType === "edit-product" && (
              <>
                <h3>Edit Product</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditProduct();
                  }}
                >
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={modalData.title}
                      onChange={(e) =>
                        setModalData({ ...modalData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={modalData.description}
                      onChange={(e) =>
                        setModalData({ ...modalData, description: e.target.value })
                      }
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      value={modalData.price}
                      onChange={(e) =>
                        setModalData({ ...modalData, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      value={modalData.stock || ""}
                      onChange={(e) =>
                        setModalData({ ...modalData, stock: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setModalData({ ...modalData, image: e.target.files[0] })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Collection</label>
                    <select
                      value={modalData.collection || ""}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          collection: e.target.value || null,
                        })
                      }
                    >
                      <option value="">None</option>
                      {collections.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-buttons">
                    <button type="submit">Confirm Changes</button>
                    <button
                      type="button"
                      onClick={() => setModalType(null) || setModalData(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
            {modalType === "delete-product" && (
              <>
                <h3>Delete Product</h3>
                <p>Are you sure you want to delete "{modalData.title}"?</p>
                <div className="modal-buttons">
                  <button onClick={handleDeleteProduct}>Confirm Deletion</button>
                  <button
                    onClick={() => setModalType(null) || setModalData(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {modalType === "edit-collection" && (
              <>
                <h3>Edit Collection</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditCollection();
                  }}
                >
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={modalData.name}
                      onChange={(e) =>
                        setModalData({ ...modalData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="modal-buttons">
                    <button type="submit">Confirm Changes</button>
                    <button
                      type="button"
                      onClick={() => setModalType(null) || setModalData(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
            {modalType === "delete-collection" && (
              <>
                <h3>Delete Collection</h3>
                <p>
                  Are you sure you want to delete "{modalData.name}"? Products will
                  remain but lose this collection association.
                </p>
                <div className="modal-buttons">
                  <button onClick={handleDeleteCollection}>Confirm Deletion</button>
                  <button
                    onClick={() => setModalType(null) || setModalData(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Collection Toggle */}
      <div className="collection-toggle-section">
        <label className="toggle-label">
          Create a New Collection or Enter Existing Collection Name
          <input
            type="checkbox"
            checked={createCollection}
            onChange={(e) => setCreateCollection(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
        {createCollection && (
          <div className="form-group collection-name-input">
            <label>Collection Name</label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name"
            />
          </div>
        )}
      </div>

      {/* Option 1: Bulk Image Upload */}
      <div className="section">
        <h3>Option 1: Upload All Images</h3>
        <div className="form-group">
          <label>Upload Product Images</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="image/*"
              multiple
              ref={bulkImageInputRef}
              onChange={handleBulkImageUpload}
            />
            <span className="file-input-label">
              {bulkImages.length > 0
                ? `${bulkImages.length} file${bulkImages.length === 1 ? "" : "s"}`
                : "No file chosen"}
            </span>
          </div>
        </div>
        {bulkImagePreviews.length > 0 && (
          <>
            <div className="bulk-products-grid">
              {bulkImagePreviews.map((preview, index) => (
                <div key={index} className="upload-product-card">
                  <div className="image-preview-wrapper">
                    <img
                      src={preview}
                      alt={`Product ${index + 1}`}
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => handleRemoveBulkImage(index)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="product-details">
                    <input
                      type="text"
                      placeholder="Title *"
                      value={bulkProductDetails[index].title}
                      onChange={(e) =>
                        handleBulkProductChange(index, "title", e.target.value)
                      }
                    />
                    <textarea
                      placeholder="Description"
                      value={bulkProductDetails[index].description}
                      onChange={(e) =>
                        handleBulkProductChange(index, "description", e.target.value)
                      }
                      rows="3"
                    />
                    <input
                      type="number"
                      placeholder="Price *"
                      value={bulkProductDetails[index].price}
                      onChange={(e) =>
                        handleBulkProductChange(index, "price", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={bulkProductDetails[index].stock}
                      onChange={(e) =>
                        handleBulkProductChange(index, "stock", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="form-buttons">
              <button
                type="button"
                className="remove-all-button"
                onClick={handleRemoveAllImages}
              >
                Remove All
              </button>
              <button
                type="button"
                className="create-button"
                onClick={handleAddBulkProducts}
              >
                Add Products
              </button>
            </div>
          </>
        )}
      </div>

      {/* Option 2: Bulk Upload via CSV */}
      <div className="section">
        <h3>Option 2: Bulk Upload via CSV</h3>
        <div className="form-group">
          <label>Upload CSV File</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".csv"
              ref={csvInputRef}
              onChange={handleCsvUpload}
            />
            <span className="file-input-label">
              {csvFile ? csvFile.name : "No file chosen"}
            </span>
          </div>
          <div className="form-group">
            <label>Upload ZIP File (Product Images)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                accept=".zip"
                ref={zipInputRef}
                onChange={handleZipUpload}
              />
              <span className="file-input-label">
                {zipFile ? zipFile.name : "No file chosen"}
              </span>
            </div>
          </div>
          <p className="hint">
            Upload a .csv with: Title, Description, Price, Stock, and Image File
            Name. Include a ZIP file containing the images referenced in the CSV.
            Example format:
            <br />
            "Title","Description","Price","Stock","Image File Name"
            <br />
            "Smartphone","A high-end smartphone","699.99","50","smartphone.jpg"
          </p>
          <button
            type="button"
            className="download-example-button"
            onClick={downloadExampleCsv}
          >
            Download Example CSV
          </button>
        </div>
        {csvFile && zipFile && (
          <div className="form-buttons">
            <button
              type="button"
              className="create-button"
              onClick={handleCsvUploadSubmit}
            >
              Add Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddProducts;