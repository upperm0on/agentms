import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, User } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import './ReviewsModal.css';

const ReviewsModal = ({ isOpen, onClose, hostelId, hostelName }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch reviews when modal opens
  useEffect(() => {
    if (isOpen && hostelId) {
      fetchReviews();
    }
  }, [isOpen, hostelId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        buildApiUrl(`${API_ENDPOINTS.REVIEWS_GET}${hostelId}/`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
      } else {
        setError('Failed to load reviews. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while loading reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div className="reviews-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reviews-modal-header">
          <h2>
            <Star size={24} />
            Reviews for {hostelName}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="reviews-modal-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchReviews} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="no-reviews-state">
              <Star size={48} className="no-reviews-icon" />
              <h3>No Reviews Yet</h3>
              <p>Be the first to review this hostel!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <User size={16} />
                      <span className="reviewer-email">{review.user_email}</span>
                    </div>
                    <div className="review-meta">
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                      <div className="review-date">
                        <Calendar size={14} />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="review-content">
                    {review.review}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
