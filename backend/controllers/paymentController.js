import paymentModel from '../models/paymentModel.js';
import { validateCardDetails } from '../helpers/cardValidatorHelper.js';  // Import the helper

// POST - Add a payment method
export const addPaymentController = async (req, res) => {
  try {
    const { cardDetails, easypaisaDetails, jazzcashDetails, isDefault } = req.body;
    const userId = req.user._id;

    // Check if at least one payment detail is provided
    if (!cardDetails && !easypaisaDetails && !jazzcashDetails) {
      return res.status(400).send({ error: "Please provide a payment method." });
    }

    // Validate card details if provided
    if (cardDetails && cardDetails.cardNumber) {
      const validation = validateCardDetails(cardDetails);

      // If the card details are invalid, return the validation errors
      if (!validation.isValid) {
        return res.status(400).send({ error: validation.errors.join(", ") });
      }

      // Check if the same card number already exists for this user
      const existingCard = await paymentModel.findOne({
        user: userId,
        "cardDetails.cardNumber": cardDetails.cardNumber,
      });
      if (existingCard) {
        return res.status(400).send({ error: "Card with the same number already exists." });
      }

      // Add card type to card details before saving
      cardDetails.cardType = validation.cardType;
    }

    // Check if the same Easypaisa account number already exists
    if (easypaisaDetails && easypaisaDetails.accountNumber) {
      const existingEasypaisa = await paymentModel.findOne({
        user: userId,
        "easypaisaDetails.accountNumber": easypaisaDetails.accountNumber,
      });

      if (existingEasypaisa) {
        return res.status(400).send({ error: "Easypaisa account with the same number already exists." });
      }
    }

    // Check if the same JazzCash account number already exists
    if (jazzcashDetails && jazzcashDetails.accountNumber) {
      const existingJazzCash = await paymentModel.findOne({
        user: userId,
        "jazzcashDetails.accountNumber": jazzcashDetails.accountNumber,
      });

      if (existingJazzCash) {
        return res.status(400).send({ error: "JazzCash account with the same number already exists." });
      }
    }

    // If the user wants to set this payment method as default, update all others to non-default
    if (isDefault) {
      await paymentModel.updateMany(
        { user: userId },
        { isDefault: false }
      );
    }

    // Create new payment
    const newPayment = new paymentModel({
      user: userId,
      cardDetails,
      easypaisaDetails,
      jazzcashDetails,
      isDefault,
    });

    await newPayment.save();
    res.status(201).send({
      success: true,
      message: "Payment method added successfully.",
      newPayment,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error adding payment method", error });
  }
};

// GET - Get all payment methods for the logged-in user
export const getPaymentsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await paymentModel.find({ user: userId });
    if (!payments) {
      return res.status(404).send({
        success: false,
        message: "Payment Details not found",
      });
    }
    res.status(200).send({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching payment methods",
      error,
    });
  }
};

// GET - Get default Payment for user
export const getDefaultPaymentController = async (req, res) => {
  try {
    const payment = await paymentModel.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!payment) {
      return res.status(404).send({
        success: false,
        message: "Default payment details not found",
      });
    }
    res.status(200).send({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching default payment",
      error,
    });
  }
};

// GET - Get a specific payment method by ID
export const getPaymentByIdController = async (req, res) => {
  try {
    const payment = await paymentModel.findById(req.params.id);

    if (!payment)
      return res.status(404).send({
        success: false,
        message: "Payment method not found.",
      });

    res.status(200).send({ success: true, payment });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "Error fetching payment method",
      error,
    });
  }
};

// PUT - Update an existing payment by ID
export const updatePaymentController = async (req, res) => {
  try {
    const { cardDetails, easypaisaDetails, jazzcashDetails, isDefault } =
      req.body;

    const payment = await paymentModel.findById(req.params.id);

    if (!payment) {
      return res.status(404).send({
        success: false,
        message: "Payment method not found",
      });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "You do not have permission to update this payment method",
      });
    }

    if (isDefault) {
      await paymentModel.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    payment.cardDetails = cardDetails || payment.cardDetails;
    payment.easypaisaDetails = easypaisaDetails || payment.easypaisaDetails;
    payment.jazzcashDetails = jazzcashDetails || payment.jazzcashDetails;
    payment.isDefault = isDefault || payment.isDefault;

    const updatedPayment = await payment.save();

    res.status(200).send({
      success: true,
      message: "Payment method updated successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in updating payment method",
      error,
    });
  }
};

// DELETE - Delete a payment method by ID
export const deletePaymentController = async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Find the payment by ID
    const payment = await paymentModel.findById(paymentId);

    if (!payment) {
      return res.status(404).send({
        success: false,
        message: "Payment method not found",
      });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "You do not have permission to delete this payment method",
      });
    }

    // If the payment method is default, ensure there is another default payment method
    if (payment.isDefault) {
      await paymentModel.findOneAndUpdate(
        { user: req.user._id, _id: { $ne: paymentId } },
        { isDefault: true },
        { new: true }
      );
    }

    await payment.deleteOne();

    res.status(200).send({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in deleting payment method",
      error,
    });
  }
};
