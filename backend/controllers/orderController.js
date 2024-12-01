import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { sendMail } from "../helpers/mailHelper.js";

// POST - Create Order
export const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      mobileNumber,
      paymentMethod,
      paymentInfo,
      subTotal,
      tax,
      shippingCost,
      totalAmount,
    } = req.body;

    // Fetch the user's cart
    const cart = await cartModel
      .findOne({ user: req.user._id })
      .populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).send({ message: "Cart is empty" });
    }

    // Transform cart items to order items format
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      size: item.size,
      price: item.product.salePrice || item.product.price,
      quantity: item.quantity,
    }));

    if (
      !shippingInfo ||
      !shippingInfo.firstName ||
      !shippingInfo.lastName ||
      !shippingInfo.addressLine1 ||
      !shippingInfo.city ||
      !shippingInfo.postalCode ||
      !shippingInfo.country ||
      !mobileNumber
    ) {
      return res
        .status(400)
        .send({ message: "Shipping information is incomplete." });
    }

    if (!paymentMethod || !["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).send({ message: "Invalid payment method." });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Bulk fetch product data for stock validation
    const productDataPromises = orderItems.map((item) => {
      if (!item.size.customSize) {
        return productModel.findOne(
          { _id: item.product, "sizes.size": item.size.label },
          { "sizes.$": 1 }
        );
      }
      return Promise.resolve(null); // Skip custom sizes
    });

    const productData = await Promise.all(productDataPromises);

    // Validate stock for non-custom sizes
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const product = productData[i];

      if (!item.size.customSize) {
        if (!product || !product.sizes[0]) {
          return res.status(400).send({
            message: `Size ${item.size.label} for product ${item.name} is not available.`,
          });
        }

        const stock = product.sizes[0].stock;
        if (stock < item.quantity) {
          return res.status(400).send({
            message: `Not enough stock for size ${item.size.label} of product ${item.name}. Available stock: ${stock}.`,
          });
        }
      }
    }

    // Create the order
    const newOrder = new orderModel({
      user: user._id,
      orderItems,
      shippingInfo,
      mobileNumber,
      paymentMethod,
      paymentInfo,
      subTotal,
      tax,
      shippingCost,
      totalAmount,
      orderStatus: "Pending",
    });

    await newOrder.save();

    // Clear the cart after the order is created
    await cartModel.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Bulk update stock for non-custom sizes
    const stockUpdatePromises = orderItems
      .filter((item) => !item.size.customSize)
      .map((item) => {
        return productModel.updateOne(
          { _id: item.product, "sizes.size": item.size.label },
          { $inc: { "sizes.$.stock": -item.quantity } }
        );
      });

    await Promise.all(stockUpdatePromises);

    // Send email to user
    const userEmail = user.email;
    const userEmailSubject = "Your Order Has Been Confirmed!";
    const userEmailHtml = `<p>Dear ${user.firstName},</p>
                            <p>Thank you for your order. Your order ID is <strong>${newOrder.code}</strong>.</p>
                            <p>We are processing your order and will notify you when it's shipped.</p>`;
    await sendMail(userEmail, userEmailSubject, userEmailHtml);

    // Send email to manager
    const managerEmail = process.env.MANAGER_EMAIL;
    const managerEmailSubject = "New Order Created";
    const managerEmailHtml = `<p>Dear Manager,</p>
                               <p>A new order has been created. Order ID: <strong>${newOrder.code}</strong>.</p>
                               <p>Order Details:</p>
                               <ul>
                                 <li>User: ${user.firstName}</li>
                                 <li>Total: Rs.${totalAmount}</li>
                               </ul>`;
    await sendMail(managerEmail, managerEmailSubject, managerEmailHtml);

    res.status(200).send({
      success: true,
      message: "Order created successfully.",
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

// GET - Get All Orders (for Admin) with Search and Pagination
export const getAllOrdersController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Construct search query
    const searchQuery = {
      ...(search && {
        $or: [
          { "orderItems.product.name": { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
          { "user.name": { $regex: search, $options: "i" } }, // Optional: search by user name
        ],
      }),
    };

    // Fetch orders with pagination, sorting, and search
    const orders = await orderModel
      .find(searchQuery)
      .populate("user orderItems.product shippingInfo paymentInfo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count the total number of orders that match the search query
    const totalOrders = await orderModel.countDocuments(searchQuery);

    res.status(200).send({
      success: true,
      message: "Orders fetched successfully",
      totalOrders,
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / limit),
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

// GET - Get All Pending Orders (Admin)
export const getPendingOrdersController = async (req, res) => {
  try {
    const pendingOrders = await orderModel.find({ orderStatus: "Pending" });

    res.status(200).send({
      success: true,
      message: "Pending Orders fetched successfully",
      pendingOrders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching pending orders",
      error: error.message,
    });
  }
};

// GET - Get all orders of the logged-in user
export const getUserOrdersController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Construct search query
    const searchQuery = {
      user: req.user._id,
      ...(search && {
        $or: [
          { "orderItems.product.name": { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ],
      }),
    };

    const orders = await orderModel
      .find(searchQuery)
      .populate("orderItems.product shippingInfo paymentInfo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalOrders = await orderModel.countDocuments(searchQuery);

    res.status(200).send({
      success: true,
      message: "Orders fetched successfully",
      totalOrders,
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
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

    // Check if the logged-in user is authorized to view this order
    if (req.user._id !== order.user.toString() && req.user.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Not authorized to view this order",
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

    // Validate status
    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).send({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // Update order status
    order.orderStatus = orderStatus;

    // If the status is 'Delivered', set the deliveredAt date
    if (orderStatus === "Delivered" && !order.deliveredAt) {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Send email to user about the status update
    const userEmail = order.user.email;
    const userEmailSubject = `Your Order Status Has Been Updated: ${orderStatus}`;
    const userEmailHtml = `<p>Dear ${order.user.firstName},</p>
                             <p>Your order ID <strong>${order.code}</strong> status has been updated to <strong>${orderStatus}</strong>.</p>
                             <p>We will notify you when the order is fully delivered.</p>`;
    await sendMail(userEmail, userEmailSubject, userEmailHtml);

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

    // Ensure that the logged-in user is authorized to delete this order
    if (req.user._id !== order.user.toString() && req.user.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Not authorized to delete this order",
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
