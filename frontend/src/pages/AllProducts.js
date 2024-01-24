import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './AllProducts.css';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [priceRange, setPriceRange] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  useEffect(() => {
    // Fetch data from the Node.js backend
    fetch('http://localhost:5001/api/category/allProducts')
    .then(response=>response.json())
      .then(data => setProducts(data))
      .catch(error => console.error(error));
  }, []);

  // const categories = Array.from(new Set(products.map((product) => product.Category)));

  const handleBrandChange = (event) => {
    setSelectedBrand(event.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setSelectedCategory(selectedCategory);
    setCurrentPage(1);

    // Fetch data based on the selected category
    if (selectedCategory) {
      fetch(`http://localhost:5001/api/category/allProducts/${selectedCategory}`)
        .then((response) => response.json())
        .then((data) => {
          setProducts(data);
          setFilteredProducts(data);
        })
        .catch((error) => console.error('Error fetching products by category:', error));
        updateURL(selectedCategory,1 )
    } else {
      // If no category is selected, fetch all products
      fetch('http://localhost:5001/api/category/allProducts')
        .then((response) => response.json())
        .then((data) => {
          setProducts(data);
          setFilteredProducts(data);
        })
        .catch((error) => console.error('Error fetching all products:', error));
    }
  };

  const handlePriceRangeChange = (event) => {
    setPriceRange(event.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const filtered = products.filter((product) => {
      const categoryFilter = selectedCategory ? product.Category === selectedCategory : true;

      return categoryFilter;
    });

    setFilteredProducts(filtered);
  }, [selectedCategory, products]);

  const handlePrevPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    updateURL(selectedCategory, newPage);
  };

  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, Math.ceil(filteredProducts.length / productsPerPage));
    updateURL(selectedCategory, newPage);
  };

  const updateURL = (cate, page) => {
    const newURL = `/category/allproducts?${cate}page=${page}`;
    window.history.pushState({}, '', newURL);
    setCurrentPage(page);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalNumberOfPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div>
      <h1>All Products</h1>
      <div className='container'>
        <div className='filterContainer'>
          <Link to={`/`}><button className='home-button'>Home</button></Link>
          <label htmlFor="categoryFilter">
            Filter by Category:
          </label>
          <select id="categoryFilter" onChange={handleCategoryChange} value={selectedCategory} >
            <option value="" >All Categories</option>
            <option value="Clothing">Clothing</option>
            <option value="Electronics">Electronics</option>
            <option value="Cosmetics">Cosmetics</option>
            <option value="Books">Books</option>
            <option value="Furniture">Furniture</option>
            <option value="Gifts_and_Decors">Gifts_and_Decors</option>
            
          </select>
          <label htmlFor="priceRange">
            Price Range:
          </label>
          <select id="priceRange" onChange={handlePriceRangeChange} value={priceRange}>
            <option value="">All Prices</option>
            <option value="low">Low (Less than $20)</option>
            <option value="medium">Medium ($20 - $50)</option>
            <option value="high">High (More than $50)</option>
          </select>
          <label htmlFor="brand">
            Filter by Brand:
          </label>
          <select id="brand" onChange={handleBrandChange} value={selectedBrand}>
            <option value="">All Brands</option>
            {Array.from(new Set(products.map((product) => product.Brand))).map((brand, index) => (
              <option key={index} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
        <Table className='fl-table' striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Brand</th>
              <th>MRP</th>
              <th>Discount_Price</th>
              <th>Category</th>
              <th>Stock Available</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.UniqueId}</td>
                <td>{product.Name}</td>
                <td>{product.Brand}</td>
                <td>{product.MRP}USD</td>
                <td>{product.DiscountPrice}USD</td>
                <td>{product.Category}</td>
                <td>{product.StocksAvailable}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className='pagination'>
          <Button variant="outline-primary" onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </Button>{' '}
          <span className='pageNumber'>{currentPage}</span>
          <Button
            variant="outline-primary"
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
          >
            Next
          </Button>
        </div>
        <span>Page {currentPage} of {totalNumberOfPages}</span>
      </div>
    </div>
  );
};

export default AllProducts;
