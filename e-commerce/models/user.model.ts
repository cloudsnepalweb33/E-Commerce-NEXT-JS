import mongoose, { Document, Model } from "mongoose";
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
  createdAt?: Date;
  updatedAt?: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    avatar: {
      url: { type: String, trim: true },
      public_id: { type: String, trim: true },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    addressVerified: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema, "users");

export default UserModel;
