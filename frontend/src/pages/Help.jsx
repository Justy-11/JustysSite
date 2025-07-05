import React, { useState } from 'react';
import { FaPlus, FaBox, FaGlobe, FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import '../styles/Help.css';

const Help = () => {
  const [expandedSections, setExpandedSections] = useState({
    createPage: true,
    addProducts: false,
    publish: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="help-page-container">
      <div className="help-page-header">
        <h1><FaInfoCircle /> Help Center</h1>
        <p>Learn how to create and manage your product pages</p>
      </div>

      <div className="help-page-content">
        {/* Create/Edit Page Section */}
        <div className="help-page-section">
          <div 
            className="help-page-section-header"
            onClick={() => toggleSection('createPage')}
          >
            <div className="section-title">
              <FaPlus />
              <h2>Create/Edit Page</h2>
            </div>
            {expandedSections.createPage ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          
          {expandedSections.createPage && (
            <div className="help-page-section-content">
              <div className="step">
                <h3>Step 1: Access the Create Page</h3>
                <p>Click on "Create/Edit Page" in the sidebar menu to start building your product page.</p>
              </div>
              
              <div className="step">
                <h3>Step 2: Fill in Basic Information</h3>
                <ul>
                  <li><strong>Page Title:</strong> Enter a catchy title for your product page (e.g., "Premium Wireless Headphones")</li>
                  <li><strong>Description:</strong> Write a compelling description that explains what you're offering</li>
                  <li><strong>Banner Image:</strong> Upload an eye-catching banner image (recommended size: 1200x400px)</li>
                </ul>
              </div>
              
              <div className="step">
                <h3>Step 3: Add Your Content</h3>
                <ul>
                  <li>Use the rich text editor to add detailed content about your products</li>
                  <li>Include features, benefits, specifications, and any other relevant information</li>
                  <li>You can format text, add links, and include images within the content</li>
                </ul>
              </div>
              
              <div className="step">
                <h3>Step 4: Save Your Page</h3>
                <p>Click the "Save Page" button to store your page. You can edit it later by returning to this section.</p>
              </div>
            </div>
          )}
        </div>

        {/* Add Products Section */}
        <div className="help-page-section">
          <div 
            className="help-page-section-header"
            onClick={() => toggleSection('addProducts')}
          >
            <div className="section-title">
              <FaBox />
              <h2>Add Products</h2>
            </div>
            {expandedSections.addProducts ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          
          {expandedSections.addProducts && (
            <div className="help-page-section-content">
              <div className="step">
                <h3>Step 1: Navigate to Add Products</h3>
                <p>Click on "Add Products" in the sidebar menu to manage your product catalog.</p>
              </div>
              
              <div className="step">
                <h3>Step 2: Create Product Collections (Optional)</h3>
                <ul>
                  <li>Collections help organize related products together</li>
                  <li>Click "Add Collection" to create a new collection</li>
                  <li>Give your collection a descriptive name (e.g., "Summer Collection", "Electronics")</li>
                </ul>
              </div>
              
              <div className="step">
                <h3>Step 3: Add Individual Products</h3>
                <ul>
                  <li><strong>Product Name:</strong> Enter a clear, descriptive product name</li>
                  <li><strong>Description:</strong> Provide detailed information about the product</li>
                  <li><strong>Price:</strong> Set the product price (you can use 0 for free items)</li>
                  <li><strong>Product Image:</strong> Upload a high-quality product image</li>
                  <li><strong>Collection:</strong> Choose which collection this product belongs to (optional)</li>
                </ul>
              </div>
              
              <div className="step">
                <h3>Step 4: Organize Your Products</h3>
                <ul>
                  <li>Products can be added to collections or kept as standalone items</li>
                  <li>You can edit or delete products at any time</li>
                  <li>Products in collections will be grouped together on your published page</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Publish Section */}
        <div className="help-page-section">
          <div 
            className="help-page-section-header"
            onClick={() => toggleSection('publish')}
          >
            <div className="section-title">
              <FaGlobe />
              <h2>Publish Page</h2>
            </div>
            {expandedSections.publish ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          
          {expandedSections.publish && (
            <div className="help-page-section-content">
              <div className="step">
                <h3>Step 1: Preview Your Page</h3>
                <p>Click on "Publish Page" in the sidebar to see how your page will look to visitors.</p>
              </div>
              
              <div className="step">
                <h3>Step 2: Review Your Content</h3>
                <ul>
                  <li>Check that your page title, description, and banner image are correct</li>
                  <li>Review all your products and their details</li>
                  <li>Make sure your content is complete and professional</li>
                </ul>
              </div>
              
              <div className="step">
                <h3>Step 3: Publish Your Page</h3>
                <ul>
                  <li>Click the "Publish Page" button to make your page live</li>
                  <li>Once published, your page will be accessible to anyone with the link</li>
                  <li>You'll receive a shareable link that you can send to customers</li>
                </ul>
              </div>
              
              <div className="step">
                <h3>Step 4: Share Your Page</h3>
                <ul>
                  <li>Copy the generated link and share it on social media, email, or messaging apps</li>
                  <li>Your page will also appear on the public landing page for discovery</li>
                  <li>You can unpublish and republish your page at any time</li>
                </ul>
              </div>
              
              <div className="step">
                <h3>Step 5: Manage Your Published Page</h3>
                <ul>
                  <li>You can edit your page content and republish to update the live version</li>
                  <li>Add new products and republish to keep your page current</li>
                  <li>Monitor your page's performance and customer engagement</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="help-page-tips">
          <h2>💡 Pro Tips</h2>
          <div className="tips-grid">
            <div className="tip">
              <h4>High-Quality Images</h4>
              <p>Use clear, professional images for your banner and products to attract more customers.</p>
            </div>
            <div className="tip">
              <h4>Compelling Descriptions</h4>
              <p>Write detailed, benefit-focused descriptions that help customers understand your products.</p>
            </div>
            <div className="tip">
              <h4>Organize with Collections</h4>
              <p>Group related products in collections to make your page easier to navigate.</p>
            </div>
            <div className="tip">
              <h4>Regular Updates</h4>
              <p>Keep your page fresh by adding new products and updating content regularly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
