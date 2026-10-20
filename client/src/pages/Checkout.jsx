import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { confirmBooking } from '../redux/slices/bookingSlice';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { currentShow, selectedSeats = [], pricing } = useSelector(
    (state) => state.booking
  );

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form fields
  const [cardData, setCardData] = useState({
    cardNumber: '4532 8920 1234 5678',
    cardName: user?.name || 'Alex Johnson',
    expiry: '12/28',
    cvv: '888',
  });

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === 'IMOVIES20') {
      const discountAmount = Math.round(pricing.totalAmount * 0.2);
      setDiscount(discountAmount);
      toast.success('Promo IMOVIES20 applied! 20% discount added.');
    } else {
      toast.error('Invalid promo code. Try IMOVIES20');
    }
  };

  const finalAmount = Math.max(0, pricing.totalAmount - discount);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!currentShow || selectedSeats.length === 0) {
      toast.error('No seats selected.');
      navigate('/');
      return;
    }

    setIsProcessing(true);

    try {
      const seatNumbers = selectedSeats.map((s) => s.seatNumber);

      const result = await dispatch(
        confirmBooking({
          showId: currentShow._id,
          seatNumbers,
          paymentMethod,
        })
      ).unwrap();

      if (result.success && result.booking) {
        toast.success('Payment successful! Your tickets are confirmed.');
        navigate(`/booking-success/${result.booking._id}`, {
          state: { booking: result.booking },
        });
      }
    } catch (err) {
      toast.error(err || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentShow || selectedSeats.length === 0) {
    return (
      <div className="container py-5 text-center text-white">
        <h4>No active booking session found</h4>
        <button onClick={() => navigate('/movies')} className="btn btn-cinema mt-3">
          Explore Movies
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm btn-link text-muted hover-white p-0 mb-4 d-flex align-items-center gap-1 text-decoration-none"
      >
        <ArrowLeft size={16} /> Back to seat selection
      </button>

      <div className="row g-4">
        {/* Left: Payment Method Form */}
        <div className="col-lg-7">
          <div className="glass-panel p-4 mb-4">
            <h4 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <Lock size={20} className="text-danger" />
              Secure Payment Gateway
            </h4>

            {/* Payment Method Tabs */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('Credit Card')}
                className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${
                  paymentMethod === 'Credit Card'
                    ? 'btn-danger'
                    : 'btn-dark text-muted border-secondary'
                }`}
              >
                <CreditCard size={16} /> Credit / Debit Card
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI / QR')}
                className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${
                  paymentMethod === 'UPI / QR'
                    ? 'btn-danger'
                    : 'btn-dark text-muted border-secondary'
                }`}
              >
                <QrCode size={16} /> UPI & Instant QR
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Net Banking')}
                className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${
                  paymentMethod === 'Net Banking'
                    ? 'btn-danger'
                    : 'btn-dark text-muted border-secondary'
                }`}
              >
                <Building size={16} /> Net Banking
              </button>
            </div>

            {/* Credit Card Form */}
            {paymentMethod === 'Credit Card' && (
              <form onSubmit={handlePaymentSubmit}>
                <div className="mb-3">
                  <label className="text-muted small mb-1">Card Number</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white py-2 shadow-none"
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="text-muted small mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white py-2 shadow-none"
                    value={cardData.cardName}
                    onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="text-muted small mb-1">Expiry Date</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white py-2 shadow-none"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-muted small mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength="4"
                      className="form-control bg-dark border-secondary text-white py-2 shadow-none"
                      placeholder="•••"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn btn-cinema w-100 py-3 fw-bold fs-6"
                >
                  {isProcessing ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                      Authorizing Payment...
                    </div>
                  ) : (
                    `Authorize & Pay $${finalAmount}`
                  )}
                </button>
              </form>
            )}

            {/* UPI QR Method */}
            {paymentMethod === 'UPI / QR' && (
              <div className="text-center py-4">
                <div
                  className="d-inline-block p-3 rounded-3 bg-white mb-3"
                  style={{ width: '160px', height: '160px' }}
                >
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=imovies@upi"
                    alt="UPI QR Code"
                    className="img-fluid"
                  />
                </div>
                <p className="text-white-50 small mb-4">
                  Scan this QR code with Google Pay, PhonePe, or any UPI app.
                </p>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                  className="btn btn-cinema w-100 py-3 fw-bold fs-6"
                >
                  {isProcessing ? 'Verifying UPI Authorization...' : `Confirm UPI Payment of $${finalAmount}`}
                </button>
              </div>
            )}

            {/* Net Banking Method */}
            {paymentMethod === 'Net Banking' && (
              <div className="py-3">
                <div className="mb-4">
                  <label className="text-muted small mb-2 d-block">Select Your Bank</label>
                  <select className="form-select bg-dark border-secondary text-white py-2 shadow-none">
                    <option>HDFC Bank</option>
                    <option>State Bank of India</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Chase / Bank of America</option>
                  </select>
                </div>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                  className="btn btn-cinema w-100 py-3 fw-bold fs-6"
                >
                  {isProcessing ? 'Connecting to Net Banking...' : `Pay $${finalAmount} via Net Banking`}
                </button>
              </div>
            )}
          </div>

          <div className="d-flex align-items-center gap-3 text-muted small p-3 rounded bg-black bg-opacity-25">
            <ShieldCheck size={20} className="text-success flex-shrink-0" />
            <span>
              256-Bit SSL End-to-End Encryption. Your transaction details are tokenized and protected against fraud.
            </span>
          </div>
        </div>

        {/* Right: Order Summary & Promo Card */}
        <div className="col-lg-5">
          <div className="glass-panel p-4 mb-4">
            <h5 className="text-white fw-bold mb-3">Order Summary</h5>

            <div className="d-flex gap-3 mb-3">
              <img
                src={currentShow.movie?.poster}
                alt={currentShow.movie?.title}
                width="70"
                height="95"
                className="rounded object-fit-cover flex-shrink-0"
              />
              <div>
                <h6 className="text-white fw-bold mb-1">{currentShow.movie?.title}</h6>
                <div className="text-muted small mb-1">{currentShow.theatre?.name}</div>
                <div className="text-white-50 small">
                  {currentShow.showDate} • {currentShow.showTime} ({currentShow.format})
                </div>
              </div>
            </div>

            {/* Allocated Seats */}
            <div className="p-3 rounded bg-black bg-opacity-25 mb-3">
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Seats ({selectedSeats.length}):</span>
                <span className="text-info fw-bold">
                  {selectedSeats.map((s) => s.seatNumber).join(', ')}
                </span>
              </div>
              <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>
                Auditorium: {currentShow.screenName}
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="d-flex gap-2 mb-3">
              <div className="position-relative flex-grow-1">
                <Tag size={15} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control form-control-sm bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                  placeholder="Promo Code (e.g. IMOVIES20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-sm btn-cinema-outline">
                Apply
              </button>
            </form>

            {/* Price Calculations */}
            <div className="py-2 border-top border-secondary border-opacity-25 d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between text-muted">
                <span>Subtotal</span>
                <span className="text-white">${pricing.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>Convenience Fee</span>
                <span className="text-white">${pricing.convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>Tax (5%)</span>
                <span className="text-white">${pricing.tax}</span>
              </div>
              {discount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Discount (IMOVIES20)</span>
                  <span>-${discount}</span>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25 mt-2">
              <span className="text-white fw-bold fs-6">Payable Amount</span>
              <span className="text-danger fw-bold fs-4">${finalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
