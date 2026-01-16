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
import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    role: 'Admin' | 'Vendor' | 'Customer';
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map