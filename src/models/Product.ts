import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  category: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  inStock: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, "Izina ry'igicuruzwa rirakenewe"],
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    price: { 
      type: Number, 
      required: [true, "Igiciro kirakenewe"],
      min: [0, "Price must be a positive number"]
    },
    category: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category',
      required: [true, "Category ID irakenewe"]
    },
    vendorId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, "Vendor ID irakenewe"]
    },
    inStock: { 
      type: Boolean, 
      default: true 
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);