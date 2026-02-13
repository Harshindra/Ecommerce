const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

dotenv.config();
connectDB();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes

// user
app.use('/api/users', userRoutes);
// product
app.use('/api/products', productRoutes); 




// Server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


