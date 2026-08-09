import { Calendar, Clock, AlertCircle, DollarSign, Building2, Circle, MapPin } from 'lucide-react';
import '../../assets/css/dashboard/YourReservation.css';
import { useReservationData } from '../../hooks/useReservationData';

function YourReservation() {
  const { reservation: reservationData } = useReservationData();
  
  if (!reservationData || !reservationData.hostel) {
    return null;
  }


  // Calculate days remaining
  const expiryDate = new Date(reservationData.expiry_date);
  const today = new Date();
  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const isExpiringSoon = daysRemaining <= 2;
  const isExpired = daysRemaining <= 0;

  return (
    <div className="your-reservation-card">
      <div className="reservation-card-header">
        <div className="reservation-title-section">
          <h2 className="reservation-main-title">
            <Calendar size={24} /> Your Reservation
          </h2>
          <p className="reservation-subtitle">Room reserved with deposit payment</p>
        </div>
        <div className="reservation-status">
          <div className={`status-indicator ${isExpired ? 'expired' : isExpiringSoon ? 'expiring' : 'active'}`}>
            <Circle size={8} className="status-dot" />
            <span className="status-text">
              {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Reserved'}
            </span>
          </div>
        </div>
      </div>

      {isExpired && (
        <div className="expiry-warning">
          <AlertCircle size={16} />
          <span>Your reservation has expired. Please contact the hostel manager.</span>
        </div>
      )}

      {isExpiringSoon && !isExpired && (
        <div className="expiry-warning expiring">
          <Clock size={16} />
          <span>Your reservation expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Complete your payment soon!</span>
        </div>
      )}

      <div className="reservation-info">
        <div className="reservation-details">
          <div className="detail-item">
            <strong><Building2 size={16} /> Hostel:</strong> 
            <span>{reservationData.hostel.name}</span>
          </div>
          <div className="detail-item">
            <strong><MapPin size={16} /> Campus:</strong> 
            <span>{reservationData.hostel.campus?.campus || reservationData.hostel.campus || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <strong><Calendar size={16} /> Reservation Date:</strong> 
            <span>{new Date(reservationData.reservee_date).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <strong><Clock size={16} /> Expires:</strong> 
            <span>{new Date(reservationData.expiry_date).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <strong><DollarSign size={16} /> Deposit Paid:</strong> 
            <span>GH₵{reservationData.deposit_amount || 0}</span>
          </div>
          <div className="detail-item">
            <strong><DollarSign size={16} /> Remaining:</strong> 
            <span>GH₵{(reservationData.amount || 0) - (reservationData.deposit_amount || 0)}</span>
          </div>
          <div className="detail-item">
            <strong>Status:</strong> 
            <span className={`status-badge ${reservationData.status}`}>{reservationData.status}</span>
          </div>
        </div>


      </div>
    </div>
  );
}

export default YourReservation;
