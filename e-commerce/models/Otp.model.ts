import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      //       lowercase: true,
      //   trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    //  verified: {
    //   type: Boolean,
    //   default: false,
    // },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPModel = mongoose.models.OTP || mongoose.model("OTP", otpSchema, "otps");

export default OTPModel;
