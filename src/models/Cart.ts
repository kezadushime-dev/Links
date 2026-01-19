import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const CartSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "User ID is required"],
            index: true
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, "Product ID is required"]
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
            default: 1
        }
    },
    { timestamps: true }
);

export default mongoose.model<ICart>('Cart', CartSchema);