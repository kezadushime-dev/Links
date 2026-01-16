"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_config_1 = require("./swagger.config");
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productsRoutes_1 = __importDefault(require("./routes/productsRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// Swagger UI
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec));
// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || '';
// Stop server if no URI
if (!MONGO_URI) {
    console.error("❌ MONGO_URI not defined in .env!");
    process.exit(1);
}
// Connect to MongoDB
mongoose_1.default.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productsRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/cart', cartRoutes_1.default);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📖 Swagger docs at http://localhost:${PORT}/api-docs`);
});
//# sourceMappingURL=server.js.map