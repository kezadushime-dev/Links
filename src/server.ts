import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { swaggerSpec } from './swagger.config';


import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productsRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';


dotenv.config();

const app = express();


app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const MONGO_URI = process.env.MONGO_URI || '';


if (!MONGO_URI) {
    console.error("❌ MONGO_URI not defined in .env!");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📖 Swagger docs at http://localhost:${PORT}/api-docs`);
});
