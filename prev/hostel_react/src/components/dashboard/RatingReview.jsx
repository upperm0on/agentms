import React, { useState, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import './RatingReview.css';

const RatingReview = ({ hostelId }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [message, setMessage] = useState('');
  const [showReviews, setShowReviews] = useState(false);

  const token = localStorage.getItem('token');
  
  // Debug logging

  // Fetch existing reviews
  const fetchReviews = async () => {
    setIsLoadingReviews(true);
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
        setReviews([]);
      }
    } catch (error) {
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Submit review
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || !review.trim()) {
      setMessage('Please provide both a rating and review text.');
      return;
    }

    if (!token) {
      setMessage('Please log in to submit a review.');
      return;
    }

    if (!hostelId) {
      setMessage('Hostel information not found. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.REVIEWS_CREATE),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            rating: rating,
            review: review.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage('Review submitted successfully!');
        setRating(0);
        setReview('');
        // Refresh reviews list
        await fetchReviews();
      } else {
        setMessage(data.message || data.error || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred while submitting your review. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load reviews on component mount
  useEffect(() => {
    if (hostelId) {
      fetchReviews();
    }
  }, [hostelId]);

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
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

  return (
    <div className="rating-review-container">
      <div className="rating-review-header">
        <h3>Rate and Review Your Hostel</h3>
        <button 
          className="toggle-reviews-btn"
          onClick={() => setShowReviews(!showReviews)}
        >
          {showReviews ? 'Hide Reviews' : `View Reviews (${reviews.length})`}
        </button>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-section">
          <label>Your Rating:</label>
          <div className="rating-input">
            {renderStars(rating, true, setRating)}
            <span className="rating-text">
              {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
            </span>
          </div>
        </div>

        <div className="review-section">
          <label htmlFor="review">Your Review:</label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this hostel..."
            rows="4"
            required
          />
        </div>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || !rating || !review.trim()}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Reviews List */}
      {showReviews && (
        <div className="reviews-list">
          <h4>Recent Reviews</h4>
          {isLoadingReviews ? (
            <p className="no-reviews">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="reviews-container">
              {reviews.map((reviewItem) => (
                <div key={reviewItem.id} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      {renderStars(reviewItem.rating)}
                    </div>
                    <div className="review-meta">
                      <span className="reviewer-email">
                        {reviewItem.user_email}
                      </span>
                      <span className="review-date">
                        {formatDate(reviewItem.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="review-content">
                    {reviewItem.review}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingReview;
