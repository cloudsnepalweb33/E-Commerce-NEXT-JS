const userSchema = new mongoose.Schema<IUser>(
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

    // ✅ Add reset password fields
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);
