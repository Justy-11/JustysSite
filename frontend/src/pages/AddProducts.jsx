import { useState, useRef } from "react";
import "../styles/AddProducts.css";

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

  // Ref for file inputs
  const bulkImageInputRef = useRef(null);
  const csvInputRef = useRef(null);

  // Handle bulk image upload and pre-fill title with image name
  const handleBulkImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setBulkImages(files);
    setBulkImagePreviews(previews);
    setBulkProductDetails(
      files.map((file) => ({
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
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

  // Handle adding bulk products to the database
  const handleAddBulkProducts = async () => {
    if (createCollection && !collectionName) {
      alert("Please enter a collection name.");
      return;
    }

    if (bulkProductDetails.some((detail) => !detail.title || !detail.price)) {
      alert("Please fill in all required fields (Title and Price) for each product.");
      return;
    }

    const products = bulkProductDetails.map((detail, index) => ({
      image: bulkImages[index],
      title: detail.title,
      description: detail.description,
      price: parseFloat(detail.price),
      stock: detail.stock ? parseInt(detail.stock) : null,
      collection: createCollection ? collectionName : null,
    }));

    try {
      console.log("Saving products to database:", products);
      setBulkImages([]);
      setBulkImagePreviews([]);
      setBulkProductDetails([]);
      if (bulkImageInputRef.current) {
        bulkImageInputRef.current.value = "";
      }
      setCollectionName("");
      setCreateCollection(false);
    } catch (error) {
      console.error("Error saving products:", error);
      alert("Failed to save products. Please try again.");
    }
  };

  // Handle CSV file upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      console.log("CSV File Uploaded:", file);
    }
  };

  // Handle bulk CSV upload to database
  const handleCsvUploadSubmit = async () => {
    if (createCollection && !collectionName) {
      alert("Please enter a collection name.");
      return;
    }

    if (!csvFile) {
      alert("Please upload a CSV file.");
      return;
    }

    try {
      console.log("Saving CSV products to database:", {
        csvFile,
        collection: createCollection ? collectionName : null,
      });
      setCsvFile(null);
      if (csvInputRef.current) {
        csvInputRef.current.value = "";
      }
      setCollectionName("");
      setCreateCollection(false);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert("Failed to upload CSV. Please try again.");
    }
  };

  // Download example CSV file
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

      {/* Collection Toggle */}
      <div className="collection-toggle-section">
        <label className="toggle-label">
          Create a Collection for These Products
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
                <div key={index} className="product-card">
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
          <p className="hint">
            Upload a .csv with: Title, Description, Price, Stock, and Image File Name (images should be in a ZIP file). Example format:
            <br />
            "Title","Description","Price","Stock","Image File Name"<br />
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
        {csvFile && (
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