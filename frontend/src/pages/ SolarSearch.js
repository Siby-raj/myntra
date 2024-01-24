import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProductList.css';

const SolarSearch = () => {
  const [data, setdata] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = data.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < Math.ceil(data.length / productsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getCategoryImage = (category) => {
    const categoryImages = {
      // default: 'default-image.jpeg',
      Clothing: 'images.jpeg',
      Electronics: 'Electronic.jpeg',
      Cosmetics: 'Cosmetic.jpeg',
      Books: 'Books.jpg',
      Furniture: 'Furniture.jpeg',
      Gifts_and_Decors: 'Gift.jpeg'
      // Add more categories and corresponding image URLs as needed
    };

    // Return the image URL based on the selected category
    return categoryImages[category] || categoryImages.default;
  };

  const { searchTerm } = useParams();
  const navigate = useNavigate(); // useNavigate hook for navigation

  useEffect(() => {
    async function fetchdata() {
      try {
        console.log("yes entrn");
        console.log("passing search term ", searchTerm);
        let response = await fetch(`http://localhost:5001/search?q=${encodeURIComponent(searchTerm)}`);
        response = await response.json();
        console.log(response);
        setdata(response);
      } catch (error) {
        console.error('Error performing Solr search:', error);
      }
    }

    fetchdata();
  }, [setdata, searchTerm]);

  // Redirect to home page if searchTerm is not present
  // useEffect(() => {
  //   if (!searchTerm) {
  //     navigate('/');
  //   }
  // }, [searchTerm, navigate]);

  return (
    <div>
      <div className='container'>
        <Link to={`/`}><button className='home-button'>Home</button></Link>

        <div className='products-grid'>
          {data.map((product) => (
            <div key={product.id} className='product-card'>
              {/* <img src={require(`/home/dell/Desktop/data/frontend/src/images/${getCategoryImage(product.Category)}`)} alt={product.Name} className='product-image' /> */}

              <h3 className='product-name'>{product.Name}</h3>
              <p className='product-brand'>{product.Brand}</p>
              <p className='product-price'>{product.DiscountPrice} USD</p>
              <p className='product-stock'>{product.StocksAvailable} in stock</p>
            </div>
          ))}
        </div>

        {/* Pagination buttons */}
        <div className='pagination-container'>
          <button onClick={prevPage} disabled={currentPage === 1} className='pagination-button prev'>
            Prev
          </button>
          {Array.from({ length: Math.ceil(data.length / productsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              disabled={currentPage === index + 1}
              className='pagination-button'
            >
              {index + 1}
            </button>
          ))}
          <button onClick={nextPage} disabled={currentPage === Math.ceil(data.length / productsPerPage)} className='pagination-button next'>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SolarSearch;
