const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const path = require('path'); 
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();
connectDB();
const app = express();
app.use(express.urlencoded({ extended: true }));

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

//upload 
app.use('/api/upload', uploadRoutes);
const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads')));




// Server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


