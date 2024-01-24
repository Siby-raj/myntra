import React, { useState, useEffect } from 'react';
import { useParams, useNavigate ,Link} from 'react-router-dom';
import './AllProducts.css';
import './ProductList.css';
import ClothingImage from '/home/dell/Desktop/data/frontend/src/images/images.jpeg'

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // const [image,setImage]=useState([]);
  const [productsPerPage] = useState(10); // Number of products to display per page
  const { categoryName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch products based on the category type from your server API with pagination
    fetch(`http://localhost:5001/api/products/${categoryName}`)
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) =>
        console.error(`Error fetching products for ${categoryName}:`, error)
      );
     
  }, [categoryName, currentPage, productsPerPage]);

  useEffect(() => {
    // Update the URL whenever the currentPage changes
    navigate(`/products/${categoryName}?page=${currentPage}`);
  }, [navigate, categoryName, currentPage]);

  // Calculate current products based on pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

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
    if (currentPage < Math.ceil(products.length / productsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const getCategoryImage=()=>{
    const categoryImages = {
      default: 'default-image.jpeg',
      Clothing: 'images.jpeg',
      Electronics: 'Electronic.jpeg',
      Cosmetics:'Cosmetic.jpeg',
      Books:'Books.jpg',
      Furniture:'Furniture.jpeg',
      Gifts_and_Decors:'Gift.jpeg'
      // Add more categories and corresponding image URLs as needed
    };

    // Return the image URL based on the selected category
    return categoryImages[categoryName];
  }
  return (
    <div>
    <h1 className='page-title'>Product List for Category {categoryName}</h1>
    <div className='container'>
      <Link to={`/`}><button className='home-button'>Home</button></Link>
  
      <div className='products-grid'>
        {currentProducts.map((product) => (
          <div key={product.id} className='product-card'>
                <img src={require(`/home/dell/Desktop/data/frontend/src/images/${getCategoryImage()}`)} alt={product.Name} className='product-image' />
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
        {Array.from({ length: Math.ceil(products.length / productsPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            disabled={currentPage === index + 1}
            className='pagination-button'
          >
            {index + 1}
          </button>
        ))}
        <button onClick={nextPage} disabled={currentPage === Math.ceil(products.length / productsPerPage)} className='pagination-button next'>
          Next
        </button>
      </div>
    </div>
  </div>
  
  );
};

export default ProductList;
