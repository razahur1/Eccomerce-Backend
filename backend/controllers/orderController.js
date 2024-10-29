import orderModel from "../models/orderModel.js";
import addressModel from "../models/addressModel.js";
import paymentModel from "../models/paymentModel.js";

// POST - Create Order
export const createOrderController = async (req, res) => {
  try {
    const { orderItems, shippingInfo, paymentInfo, totalPrice } = req.body;

    // Check if orderItems are provided
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Order items are required",
      });
    }

    // Check if totalPrice is provided and valid
    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).send({
        success: false,
        message: "Total price must be a positive number",
      });
    }

    // Check if shipping address exists or is new
    let shippingAddressId = shippingInfo._id;
    if (!shippingAddressId) {
      const shippingAddress = new addressModel({
        ...shippingInfo,
        user: req.user._id,
      });
      const savedAddress = await shippingAddress.save();
      if (!savedAddress) {
        return res.status(500).send({
          success: false,
          message: "Error in saving shipping address",
        });
      }
      shippingAddressId = savedAddress._id;
    }

    // Check if payment exists or is new
    let paymentMethodId = paymentInfo._id;
    if (!paymentMethodId) {
      const payment = new paymentModel({ ...paymentInfo, user: req.user._id });
      const savedPayment = await payment.save();
      if (!savedPayment) {
        return res.status(500).send({
          success: false,
          message: "Error in saving payment information",
        });
      }
      paymentMethodId = savedPayment._id;
    }

    // Create the order
    const order = new orderModel({
      user: req.user._id,
      orderItems,
      shippingInfo: shippingAddressId,
      paymentInfo: paymentMethodId,
      totalPrice,
      orderStatus: "Pending",
      isPaid: false, // Can be adjusted based on your logic for payment types
    });

    const newOrder = await order.save();
    res.status(201).send({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in creating order",
      error: error.message,
    });
  }
};

// GET - Get All Orders (for Admin)
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("user orderItems.product shippingInfo paymentInfo");
    res.status(200).send({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching orders",
      error: error.message,
    });
  }
};

// GET - Get all orders of the logged-in user
export const getUserOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id })
      .populate("orderItems.product shippingInfo paymentInfo");

    if (!orders || orders.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No orders found for this user",
      });
    }

    res.status(200).send({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching user's orders",
      error: error.message,
    });
  }
};

// GET - Get Single Order by ID
export const getOrderByIdController = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("user orderItems.product shippingInfo paymentInfo");

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching order",
      error: error.message,
    });
  }
};

// PUT - Update Order Status (for Admin)
export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered") {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).send({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in updating order status",
      error: error.message,
    });
  }
};

// DELETE - Delete Order
export const deleteOrderController = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    await order.deleteOne();

    res.status(200).send({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in deleting order",
      error: error.message,
    });
  }
};
