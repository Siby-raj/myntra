// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CategorySelection from './pages/CategorySelection';
import ProductList from './pages/ProductList';
import AllProducts from './pages/AllProducts';
import SolarSearch from './pages/ SolarSearch';

function App() {
  return (
    <Router>
      <CategorySelection />
      
      <div className="App">
        <Routes>
          <Route path="/category/allProducts" element={<AllProducts />} />
          <Route path="/SolarSearch/:searchTerm" element={<SolarSearch/>}/>
          {/* Add a route for search results */}
          {/* <Route path="/products/:categoryName" element={<ProductList />} /> */}
        </Routes>
      </div>

      {/* Conditionally render ProductList based on the route */}
      <div className="floating-products">
        <Routes>
          <Route
            path="/products/:categoryName"
            element={<ProductList />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
