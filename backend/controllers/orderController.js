import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ordersPath = path.join(__dirname, '../data/orders.json');

const getOrders = () => JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
const saveOrders = (orders) => fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2), 'utf-8');

export const getAllOrders = (req, res) => {
  try {
    const orders = getOrders();
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = (req, res) => {
  try {
    const orders = getOrders();
    const orderId = req.params.id.toUpperCase();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: `Order ${orderId} not found.` });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = (req, res) => {
  try {
    const orders = getOrders();
    const orderId = req.params.id.toUpperCase();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: `Order ${orderId} not found.` });
    }

    const order = orders[orderIndex];

    if (!order.cancellation.canCancel) {
      return res.status(400).json({
        success: false,
        message: order.cancellation.reasonCannotCancel || 'This order cannot be cancelled.'
      });
    }

    // Process cancellation
    order.status = 'Cancelled';
    order.deliveryStatus = 'Cancelled by Customer';
    order.cancellation.canCancel = false;
    order.cancellation.cancelledAt = new Date().toISOString();
    order.timeline.unshift({
      status: 'Cancelled',
      description: 'Order cancelled by customer. Refund initiated to original payment source.',
      timestamp: new Date().toLocaleString(),
      completed: true
    });

    order.payment.paymentStatus = 'Refund Initiated';

    orders[orderIndex] = order;
    saveOrders(orders);

    res.json({
      success: true,
      message: `Order ${orderId} has been successfully cancelled. A full refund of $${order.payment.total.toFixed(2)} will be credited back within 3-5 business days.`,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestReturn = (req, res) => {
  try {
    const orders = getOrders();
    const orderId = req.params.id.toUpperCase();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: `Order ${orderId} not found.` });
    }

    const order = orders[orderIndex];

    if (!order.return || !order.return.eligible) {
      return res.status(400).json({
        success: false,
        message: order.return?.reasonNotEligible || 'This order is not eligible for return.'
      });
    }

    const { reason, comment } = req.body;
    const returnId = `RET-${Math.floor(1000 + Math.random() * 9000)}`;

    order.status = 'Return Initiated';
    order.deliveryStatus = 'Return Pickup Scheduled';
    order.return = {
      ...order.return,
      eligible: false,
      returnStatus: 'Pickup Scheduled',
      returnId,
      returnReason: reason || 'Customer requested return',
      comment: comment || '',
      pickupDate: 'Within 48 hours',
      refundStatus: `Pending pickup ($${order.payment.total.toFixed(2)})`
    };

    order.timeline.unshift({
      status: 'Return Scheduled',
      description: `Return pickup arranged for Reason: ${reason || 'Customer request'}`,
      timestamp: new Date().toLocaleString(),
      completed: true
    });

    orders[orderIndex] = order;
    saveOrders(orders);

    res.json({
      success: true,
      message: `Return request submitted successfully! Your return ID is ${returnId}. Our courier partner will collect the product within 48 hours.`,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRefundDetails = (req, res) => {
  try {
    const orders = getOrders();
    const refundedOrders = orders.filter(
      o => o.status === 'Refunded' || o.payment?.paymentStatus === 'Refunded' || o.payment?.paymentStatus === 'Refund Initiated'
    );

    res.json({
      success: true,
      count: refundedOrders.length,
      refunds: refundedOrders.map(o => ({
        orderId: o.id,
        items: o.items,
        amount: o.payment.total,
        method: o.payment.method,
        refundStatus: o.return?.refundStatus || o.payment.paymentStatus,
        refundReference: o.return?.refundReference || 'ARN-' + Math.floor(1000000000 + Math.random() * 9000000000),
        refundDate: o.return?.refundDate || 'Pending Settlement'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
