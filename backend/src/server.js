

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// enviroment variables
dotenv.config();

// connects to MongoDB Atlas
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json()); // parse JSON from body


app.get('/', (req, res) => {
  res.send('API is running...');
});

// routes for book.js
const bookRoutes = require('./routes/bookRoutes');
app.use('/api/books', bookRoutes);

// routes for purchase.js
const purchaseRoutes = require('./routes/purchaseRoutes');
app.use('/api/purchases', purchaseRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
