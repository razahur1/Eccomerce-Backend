const paymentDetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    paymentType: {
      type: String,
      enum: ["Cash", "Card", "Easypaisa", "JazzCash"],
      required: true,
    },
    cardDetails: {
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
  },
  {
    timestamps: true,
  }
);

const PaymentDetails = mongoose.model("PaymentDetails", paymentDetailsSchema);

module.exports = PaymentDetails;
