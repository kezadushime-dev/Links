"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_config_1 = require("./swagger.config");
const dotenv_1 = __importDefault(require("dotenv"));
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productsRoutes_1 = __importDefault(require("./routes/productsRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Swagger UI
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec));
// --- UPDATED: LOCAL MONGODB CONNECTION ---
// Change 'my_local_db' to whatever you want your database to be named
const localMongo = "mongodb://127.0.0.1:27017/ecommerce_db";
mongoose_1.default.connect(localMongo)
    .then(() => console.log('✅ Connected to Local MongoDB'))
    .catch(err => console.error('❌ Local MongoDB Connection Error:', err.message));
// -----------------------------------------
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productsRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/cart', cartRoutes_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📖 Swagger: http://localhost:${PORT}/api-docs`);
});
//# sourceMappingURL=server.js.map