import mongoose, { Schema, model, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  role: "user" | "admin";
  name: string;
  email: string;
  password: string;
  avatar?: {
    url?: string;
    public_id?: string;
  };
  isEmailVerified: boolean;
  phoneVerified: boolean;
  addressVerified: boolean;
  deletedAt?: Date | null;
  resetPasswordToken?: string;
  resetPasswordExpire?: number;
  createdAt?: Date;
  updatedAt?: Date;

  // ✅ Add method to interface
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true, select: false },
    avatar: {
      url: { type: String, trim: true },
      public_id: { type: String, trim: true },
    },
    isEmailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    addressVerified: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null, index: true },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Number },
  },
  { timestamps: true }
);

// ✅ Hash password before save
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Add method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Avoid model overwrite issues in Next.js hot reload
const UserModel: Model<IUser> = mongoose.models.User || model<IUser>("User", userSchema);

export default UserModel;
