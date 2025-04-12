import Product from "../models/Product.js";
import Order from "../models/Order.js";
import stripe from "stripe";
import User from "../models/User.js";


// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!userId || !items.length === 0) {
      return res.json({
        success: false,
        message: "Missing details",
      });
    }

    // Calculate total amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      amount += product.offerPrice * item.quantity;
    }

    // Add tax charge (2%)
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "COD",
    });
    res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// PLACE ORDER STRIPE : /api/order/stripe

export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const {origin} = req.headers;

    if (!address || !items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid data",
      });
    }
    let productData = [];

    // Calculate total amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      amount += product.offerPrice * item.quantity;
    }

    // Add tax charge (2%)
    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "Online",
    });
    // stripe gateway initialization
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    
    // Create line items for the Stripe

    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
      },
      quantity: item.quantity,
    }));

    // create a session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      }
      });

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


// stripe webhook to verify payment action : /sttripe

export const stripeWebhook = async (req, res) => {
  // strripe gateway initialization
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
      return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId, userId } = session.data[0].metadata;

      // Mark payment as successful
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paymentIntentId,
      });
      // clear cart after successful payment
      await User.findByIdAndUpdate(userId, {
        cartItems: {}
      });
      break;
    }
    case "payment_intent.payment_failed":{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId} = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  res.json({ received: true });
}

// Get orders by user id : /api/order/user

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.query; // Changed from req.body to req.query
    
    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required"
      });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    }).populate("items.product address").sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get all orders (for seller / admin) : /api/order/seller

export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find({
        $or: [{ paymentType: "COD" }, { isPaid: true }],
      }).populate("items.product address").sort({ createdAt: -1 });
      res.json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.json({
        success: false,
        message: error.message,
      });
    }
  };
