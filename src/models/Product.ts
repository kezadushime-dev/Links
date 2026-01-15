import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  category: mongoose.Types.ObjectId;
}

const ProductSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, "Izina ry'igicuruzwa rirakenewe"] 
  },
  price: { 
    type: Number, 
    required: [true, "Igiciro kirakenewe"] 
  },
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', // Ibi bituma duhura na Category Model
    required: [true, "Category ID irakenewe"] 
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },
  vendorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
}
  
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);