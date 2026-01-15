import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
    productId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId; // Twongeyeho uyu murongo
    quantity: number;
    addedAt: Date;
}

const CartSchema: Schema = new Schema({
    productId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', // Bihura na User Model yo muri Task 0
        required: true 
    },
    quantity: { type: Number, default: 1 },
    addedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICart>('Cart', CartSchema);