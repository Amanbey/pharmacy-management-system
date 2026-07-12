const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Drug = require('../models/Drug'); // We need the Drug model to update stock!

// POST: Create a new order (Pharmacist adds to queue)
router.post('/', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: "Failed to create order", error: error.message });
    }
});

// GET: Fetch all orders (For Pharmacist, Admin, and Cashier)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
});

// PUT: Process Payment and Deduct Inventory (Cashier only)
router.put('/:id/process', async (req, res) => {
    try {
        const { paymentMethod, cashierName, status } = req.body;
        
        // 1. Find the order
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'Pending') return res.status(400).json({ message: 'Order already processed' });

        // 2. CRUCIAL: If the status is 'Paid', deduct the items from the inventory
        if (status === 'Paid') {
            for (let item of order.items) {
                // Find the drug and subtract the quantity sold from its current stock
                await Drug.findByIdAndUpdate(item.drugId, { 
                    $inc: { stock: -item.quantity } 
                });
            }
        }

        // 3. Update order details
        order.status = status;
        order.paymentMethod = paymentMethod;
        order.cashierName = cashierName;
        
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);

    } catch (error) {
        console.error("Payment Processing Error:", error);
        res.status(500).json({ message: "Failed to process payment", error: error.message });
    }
});

module.exports = router;