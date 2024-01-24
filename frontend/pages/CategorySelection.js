import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './cate.css';
// Import your search icon image

const CategorySelection = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchResults] = useState('');

  useEffect(() => {
    // Fetch categories from your server API
    // Example API endpoint: http://localhost:5000/api/categories
    fetch('http://localhost:5001/api/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/SolarSearch/${encodeURIComponent(searchTerm)}`);
  
  };

  return (
    <div>
      <nav className="navbar" role="navigation">
        <div className="logo">
          <h1>Ecomerse</h1>
        </div>
        <div className="navbar-items">
          <form className="search-form">
            <input
              type="search"
              placeholder="Search for products"
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchResults(e.target.value)}
            />
            <button type="submit" onClick={handleSearch} className="search-button">
              Search
            </button>
          </form>
          
          <button className="show-all-button">
            <Link to="/category/allProducts" className="show-all-link">
              Show All Products
            </Link>
          </button>
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category.id} className="category-item">
                <Link to={`/products/${category.Type}`} className="category-link">
                  {category.Type}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
     
    </div>
  );
};

export default CategorySelection;
