import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    orderNumber: string;
    userId: mongoose.Types.ObjectId;
    items: {
        productId: mongoose.Types.ObjectId;
        productName: string;
        quantity: number;
        price: number;
        subtotal: number;
    }[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress?: string;
    paymentMethod?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const OrderSchema: Schema = new Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            required: [true, "Order number is required"],
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "User ID is required"],
            index: true
        },
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: [true, "Product ID is required"]
                },
                productName: {
                    type: String,
                    required: [true, "Product name is required"]
                },
                quantity: {
                    type: Number,
                    required: [true, "Quantity is required"],
                    min: [1, "Quantity must be at least 1"]
                },
                price: {
                    type: Number,
                    required: [true, "Price is required"],
                    min: [0, "Price must be a positive number"]
                },
                subtotal: {
                    type: Number,
                    required: true
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: [true, "Total amount is required"],
            min: [0, "Total amount must be a positive number"]
        },
        status: {
            type: String,
            enum: {
                values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
                message: 'Invalid status. Must be one of: pending, confirmed, shipped, delivered, cancelled'
            },
            default: 'pending',
            lowercase: true,
            index: true
        },
        shippingAddress: {
            type: String,
            default: null
        },
        paymentMethod: {
            type: String,
            default: null
        },
        notes: {
            type: String,
            default: null
        }
    },
    { 
        timestamps: true,
        indexes: [
            { userId: 1, createdAt: -1 },
            { orderNumber: 1 },
            { status: 1 }
        ]
    }
);

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
    if (!this.isNew) {
        return next();
    }

    try {
        if (!this.orderNumber) {
            // Generate unique order number: ORD-20260119-ABC123
            const date = new Date();
            const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            this.orderNumber = `ORD-${dateStr}-${random}`;

            // Ensure uniqueness
            let isUnique = false;
            let counter = 0;
            while (!isUnique && counter < 10) {
                const existing = await mongoose.model('Order').findOne({ orderNumber: this.orderNumber });
                if (!existing) {
                    isUnique = true;
                } else {
                    const newRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
                    this.orderNumber = `ORD-${dateStr}-${newRandom}`;
                    counter++;
                }
            }
        }
        next();
    } catch (error: any) {
        next(error);
    }
});

export default mongoose.model<IOrder>('Order', OrderSchema);