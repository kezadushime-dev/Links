import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { swaggerSpec } from './swagger.config';

// Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productsRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || '';

// Stop server if no URI
if (!MONGO_URI) {
    console.error("❌ MONGO_URI not defined in .env!");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📖 Swagger docs at http://localhost:${PORT}/api-docs`);
});
