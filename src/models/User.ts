/**
 * @swagger
 * components:
 * schemas:
 * User:
 * type: object
 * required: [username, email, password]
 * properties:
 * username:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * role:
 * type: string
 */
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date; 
    updatedAt: Date;
    role: 'Admin' | 'Vendor' | 'Customer';
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Admin', 'Vendor', 'Customer'], 
        default: 'Customer' 
    }
}, { timestamps: true });

// Uburyo bugezwe: Ntabwo tugikoresha 'next()' kuko 'async' ihita ibyikemurira
UserSchema.pre<IUser>('save', async function () {
    // Ibi bituma iyo password itahindutse, idasubira gu-hash-wa
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error: any) {
        throw new Error(error);
    }
});

export default mongoose.model<IUser>('User', UserSchema);