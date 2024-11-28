import mongoose, { Schema, HydratedDocument } from "mongoose";
import bcrypt from 'bcrypt';

export interface IUser {
  name: string;
  password: string;
  email: string;
  role: string;
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

UserSchema.pre('save', async function (this: HydratedDocument<IUser>, next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export default mongoose.model<IUser>('User', UserSchema);
