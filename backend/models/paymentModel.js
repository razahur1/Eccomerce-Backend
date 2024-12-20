import mongoose from "mongoose";

const paymentModel = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    cardDetails: {
      cardType:{
        type: String,
      },
      cardNumber: {
        type: String,
      },
      cardHolderName: {
        type: String,
      },
      expiryDate: {
        type: String,
      },
      cvv: {
        type: String,
      },
    },
    easypaisaDetails: {
      accountNumber: {
        type: String,
      },
    },
    jazzcashDetails: {
      accountNumber: {
        type: String,
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("payments", paymentModel);
