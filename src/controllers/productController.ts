
import { Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Categories';

// 1. GET ALL PRODUCTS - Umuntu wese arabibona (Public)
export const getProducts = async (req: any, res: Response) => {
    try {
        const products = await Product.find().populate('category', 'name');
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: "Server error" });
    }
};

// 2. CREATE PRODUCT - Admin cyangwa Vendor
export const createProduct = async (req: any, res: Response) => {
    try {
        const { name, price, category, inStock } = req.body;

        // Genzura niba Category ID ari yo
        if (!category || !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ error: "Category ID ntabwo yanditse neza" });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ error: "Iyi Category ntibaho muri database" });
        }

        // Kurema igicuruzwa no kukitaho nyiracyo (vendorId)
        const newProduct = new Product({ 
            name, 
            price, 
            category, 
            inStock: inStock !== undefined ? inStock : true,
            vendorId: req.user // Iyi niyo ID y'umuntu ugi-creaye (Admin cyangwa Vendor)
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 3. UPDATE PRODUCT - Admin (yose) cyangwa Vendor (ibye gusa)
export const updateProduct = async (req: any, res: Response) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ error: "Iki gicuruzwa ntikiri muri Database" });

        // AMATEGEKO YA RBAC: 
        // Admin ahindura byose, ariko Vendor ahindura ibye gusa
        if (req.userRole === 'Vendor' && product.vendorId?.toString() !== req.user) {
            return res.status(403).json({ error: "Wemerewe guhindura ibyo waremye wenyine!" });
        }

        const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: "Guhindura byanze" });
    }
};

// 4. DELETE SINGLE PRODUCT - Admin (yose) cyangwa Vendor (ibye gusa)
export const deleteProduct = async (req: any, res: Response) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ error: "Ntabwo kibonetse" });

        // AMATEGEKO YA RBAC:
        // Niba ari Vendor, agomba kuba ari we wayiremye (Ownership check)
        if (req.userRole === 'Vendor' && product.vendorId?.toString() !== req.user) {
            return res.status(403).json({ error: "Ntushobora gusiba igicuruzwa utaremye!" });
        }

        await Product.findByIdAndDelete(id);
        res.json({ message: "Byasibwe neza" });
    } catch (error: any) {
        res.status(400).json({ error: "Gusiba byanze" });
    }
};

// 5. DELETE ALL PRODUCTS - Admin Gusa
export const deleteAllProducts = async (req: any, res: Response) => {
    try {
        // Hano nta kureba Ownership kuko Admin asiba byose
        await Product.deleteMany({});
        res.status(200).json({ message: "Ibicuruzwa byose byasibwe!" });
    } catch (error) {
        res.status(500).json({ error: "Gusiba byanze" });
    }
};