import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js"
import stripe from "stripe";

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!address || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }
    let amount = 0;

    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(400)
          .json({ success: false, message: "Product not found" });
      }
      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02);
    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });
    return res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;
    const { userId } = req;
    const { origin } = req.headers;

    if (!address || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not set");
    }

    let productData = [];
    let amount = 0;

    for (let item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });

      amount += product.offerPrice * item.quantity;
    }

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.floor(item.price * 100), // converting to cents
      },
      quantity: item.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loading?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.error("Stripe Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
export const stripeWebhooks=async (req,res)=>{
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig=req.headers['stripe-signature'];
  let event;
  try {
    event=stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,

    )
  } catch (error) {
    res.send(400).send(`webhook Error: ${error.message}`)
    
  }
  switch (event.type) {
    case "payment_intent.succeeded":{
      const paymentIntent=event.data.object;
      const paymentIntentId=paymentIntent.id;
      const session=await stripeInstance.checkout.sessions.list({
        payment_intent:paymentIntentId,
      });
      const {orderId,userId}=session.data[0].metadata;
      await Order.findByIdAndUpdate(orderId,{isPaid:true});
      await User.findByIdAndUpdate(userId,{cartItems:{}})
      break;
    }
    case "payment_intent.payment_failed":{
      const paymentIntent=event.data.object;
      const paymentIntentId=paymentIntent.id;
      const session=await stripeInstance.checkout.sessions.list({
        payment_intent:paymentIntentId,
      });
      const {orderId,userId}=session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
      
     
  
    default:
      console.error(`unhandled event type ${event.type}`)
      break;
  }
  res.json({received:true});
}


export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req;
    console.log(userId);

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
