import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    items: {
        productId: mongoose.Types.ObjectId;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}

const OrderSchema: Schema = new Schema(
    {
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
                quantity: {
                    type: Number,
                    required: [true, "Quantity is required"],
                    min: [1, "Quantity must be at least 1"]
                },
                price: {
                    type: Number,
                    required: [true, "Price is required"],
                    min: [0, "Price must be a positive number"]
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
                message: 'Invalid status'
            },
            default: 'pending',
            lowercase: true
        }
    },
    { 
        timestamps: true,
        indexes: [{ userId: 1, createdAt: -1 }]
    }
);

export default mongoose.model<IOrder>('Order', OrderSchema);