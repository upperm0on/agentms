import { ClipboardList, Calendar, CheckCircle, Building2, AlertTriangle } from 'lucide-react';
import './BookingInfo.css';
import { useHostelData } from '../../hooks/useHostelData';

function BookingInfo() {
  // Get hostel information from Redux
  const { hostel } = useHostelData();
  
  // Format checkout date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get booking date (current date when booking was made)
  const bookingDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!hostel) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Booking Information</h2>
        <div className="space-y-2">
          <p>No booking information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4"><ClipboardList size={20} /> Booking Information</h2>
      <div className="space-y-2">
        <p>
          <span className="font-medium"><Calendar size={16} /> Booking Date:</span> {bookingDate}
        </p>
        <div className="status-container">
          <span className="font-medium"><CheckCircle size={16} /> Status:</span>
          <span className="confirmed-status">
            <span className="status-badge">CONFIRMED</span>
            <span className="status-pulse"></span>
          </span>
        </div>
        <p>
          <span className="font-medium"><Building2 size={16} /> Hostel:</span> {hostel.name}
        </p>
      </div>
      
      {/* Checkout Warning Section */}
      <div className="checkout-warning">
        <div className="warning-header">
          <AlertTriangle size={20} className="warning-icon" />
          <span className="warning-title">Checkout Reminder</span>
        </div>
        <div className="warning-content">
          <p className="warning-text">
            You must check out by <strong>{formatDate(hostel.checkout)}</strong>
          </p>
          <p className="warning-subtext">
            Please ensure you vacate your room before this date to avoid additional charges.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BookingInfo;
