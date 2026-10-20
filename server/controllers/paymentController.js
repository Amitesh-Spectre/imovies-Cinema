const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Simulate payment gateway verification
// @route   POST /api/payments/process
// @access  Private
exports.processPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, cardDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    // Simulate gateway latency and verification
    const transactionId = 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Check basic simulated card validity if card method
    if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      if (cardDetails && cardDetails.cardNumber && cardDetails.cardNumber.endsWith('0000')) {
        return res.status(400).json({
          success: false,
          message: 'Payment declined by bank: Simulated card failure.',
        });
      }
    }

    res.status(200).json({
      success: true,
      transactionId,
      status: 'success',
      paymentMethod,
      amount,
      message: 'Payment authorized successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payments history for user
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};
