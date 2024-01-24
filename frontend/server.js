const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors'); 
const mysql=require('mysql2')
const app = express();
const port = 5000; 

app.use(bodyParser.json());
app.use(cors());
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'Ecomerse',
});
const solrBaseUrl = 'http://localhost:8983/solr/ecommerce';
let brands;
let productnames;
let notFetched = true;

if(notFetched){
    const query = 'SELECT DISTINCT Brand FROM products';
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            brands = results;
          
            notFetched = false;
        }
     });
    const query1 = 'SELECT DISTINCT Name FROM products'; 
    connection.query(query1, (error, results, fields) => {
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            productnames = results;
            notFetched = false;
        }
     });
    }



// app.get('/search/:searchTerm', async (req, res) => {
//   const searchterm = req.params.searchTerm;
//   const solrBaseUrl = 'http://localhost:8983/solr/ecommerce/select';

//   // Construct a basic Solr query to search across all fields
//   const solrQuery = `q=${encodeURIComponent(`Name:${searchterm} OR Brand:${searchterm}`)}&rows=20`;

//   const solrUrl = `${solrBaseUrl}?${solrQuery}`;

//   try {
//     let response = await fetch(solrUrl);

//     if (response.ok) {
//       let jsonResponse = await response.json();
//       jsonResponse = jsonResponse.response.docs;
//       console.log(jsonResponse);
//       res.json(jsonResponse);
//     } else {
//       console.error(`Error: ${response.status} - ${response.statusText}`);
//       res.status(response.status).send('Error fetching data from Solr');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });
let pricelessThanKeywords = ["below", "less","under"]
let priceGreaterThanKeywords = ["above", "greater",]

app.get('/search', async (req, res) => {
  let query = req.query.q;
  console.log(query);

  let isBelow = pricelessThanKeywords.some(keyword => query.toLowerCase().includes(keyword));
  let isAbove = priceGreaterThanKeywords.some(keyword => query.toLowerCase().includes(keyword));

  console.log("isBelow:", isBelow);
  console.log("isAbove:", isAbove);

  // Split the query into individual words
  let queryWords = query.split(" ");

  let brandValues = [];
  let productValues = [];
  let priceValues = [];

  // Iterate through each word in the query
  for (let word of queryWords) {
      // Check if the word is a brand
      if (brands.some(brandObj => brandObj && brandObj.Brand && brandObj.Brand.toLowerCase().includes(word.toLowerCase()))) {
          brandValues.push(word);
      }
      // Check if the word is a product name
      else if (productnames.some(prdObj => prdObj && prdObj.Name && prdObj.Name.toLowerCase().includes(word.toLowerCase()))) {
          productValues.push(word);
      }
      // Check if the word is a numeric value (for price)
      else if (!isNaN(word)) {
          priceValues.push(parseFloat(word));
      }
  }

  console.log("brands", brandValues);
  console.log("products", productValues);
  console.log("prices", priceValues);

  try {
      let solrUrl = `${solrBaseUrl}/select?`;

      // Brand query
      if (brandValues.length > 0) {
          let brandQuery = brandValues.map(brandValue => `fq=Brand:*${encodeURIComponent(brandValue)}*`).join("&");
          solrUrl += `${brandQuery}&`;
      }

      // Products query
      if (productValues.length > 0) {
          let productQuery = productValues.map(productValue => `fq=Name:*${encodeURIComponent(productValue)}*`).join("&");
          solrUrl += `${productQuery}&`;
      }

      // Price query
      if (priceValues.length > 0) {
          let priceQuery = isBelow
              ? `fq=DiscountPrice:[* TO ${priceValues[0]}]&`
              : isAbove
                  ? `fq=DiscountPrice:[${priceValues[0]} TO *]&`
                  : "";
          solrUrl += priceQuery;
      }

      // Default query
      if (brandValues.length > 0 || productValues.length > 0 || priceValues.length > 0) {
          solrUrl += `q=*:*`;
      }

      solrUrl += `&indent=true&wt=json`;

      console.log(solrUrl);

      // Data fetching
     const response = await fetch(solrUrl);

        if (response.ok) {
            let jsonResponse = await response.json();
            jsonResponse = jsonResponse.response.docs;

            // Filter out duplicates based on UniqueId
            const uniqueResults = jsonResponse.filter((result, index, self) =>
                index === self.findIndex((r) => r.UniqueId === result.UniqueId)
            );

            console.log(uniqueResults);
            res.json(uniqueResults);
        } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            res.status(response.status).send('Error fetching data from Solr');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});


connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.get("/",(req,res)=>{
  res.json("ecomerse web");
})
// Example API endpoint to fetch data
// Import necessary packages and set up your express app

// Example API endpoint to fetch all categories
app.get('/api/categories', (req, res) => {
  connection.query('SELECT * FROM new_table', (error, results) => {
    if (error) return res.status(500).json({ error: 'Internal Server Error' });
    return res.json(results);
  });
});

// Example API endpoint to fetch all products with pagination
app.get('/api/category/allProducts', (req, res) => {
  
  connection.query('SELECT * FROM products ORDER BY RAND()', (error, results) => {
    if (error) return res.status(500).json({ error: 'Internal Server Error' });
    return res.json(results);
  });
});
app.get('/api/allProducts/:category', (req, res) => {
  const { category } = req.params;
  const query = `
  SELECT * 
  FROM products 
  WHERE Category = "${category}" 
`;
  connection.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: 'Internal Server Error' });
    return res.json(results);
  });
});

app.get('/api/products/:category', async (req, res) => {
  const { category } = req.params;
  const page = req.query.page ? parseInt(req.query.page) :1; 
  const itemsPerPage = req.query.itemsPerPage ? parseInt(req.query.itemsPerPage) : 10; // Set the items per page (default to 10)

  const offset = (page - 1) * itemsPerPage; // Calculate the offset for pagination

  // console.log(`Category: ${category}, Page: ${page}, Items Per Page: ${itemsPerPage}`);

  const query = `
    SELECT * 
    FROM products 
    WHERE Category = "${category}" 
  `;

  // console.log(query);

  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log("Error fetching..");
      res.status(500).json({ error: "Internal Server error" });
    } else {
      res.json(results);
    }
  });
});

// Add other necessary routes and middleware

// Start your server





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

