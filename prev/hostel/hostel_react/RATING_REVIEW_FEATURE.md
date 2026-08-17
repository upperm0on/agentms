# Rating and Review Feature

This document describes the newly implemented rating and review feature for the consumer dashboard.

## Overview

The rating and review feature allows consumers to:
- Rate their hostel experience with a 1-5 star rating
- Write detailed reviews about their stay
- View reviews from other consumers
- Submit reviews through the consumer dashboard

## Backend Implementation

### API Endpoints

Two new API endpoints have been added to the backend:

1. **POST /hq/api/reviews/create/** - Create a new review
   - Requires authentication token
   - Body: `{"rating": 1-5, "review": "text"}`
   - Returns: Review data with success/error status

2. **GET /hq/api/reviews/{hostel_id}/** - Get reviews for a hostel
   - Returns: List of reviews with user info, ratings, and timestamps

### Database Models

The feature uses existing models:
- `Reviews` model in `reviews/models.py`
- Rating models in `ratings/models.py` (one_star, two_star, etc.)
- `Consumer` model to link users to hostels

### Backend Files Modified

- `/home/barimah/projects/hostel/hq/api_views.py` - Added review API endpoints
- `/home/barimah/projects/hostel/hq/urls.py` - Added URL patterns for review endpoints

## Frontend Implementation

### Components

**RatingReview.jsx** - Main component for rating and review functionality
- Interactive star rating system
- Review text input
- Display of existing reviews
- Form submission with validation

### Features

1. **Star Rating System**
   - Interactive 5-star rating
   - Visual feedback for selected rating
   - Required field validation

2. **Review Form**
   - Textarea for detailed review
   - Submit button with loading state
   - Success/error message display

3. **Reviews Display**
   - Toggle to show/hide existing reviews
   - Review count display
   - Chronological listing of reviews
   - User email and date information

### Styling

**RatingReview.css** - Comprehensive styling including:
- Responsive design for mobile and desktop
- Modern card-based layout
- Interactive star rating styles
- Form styling with focus states
- Message styling for success/error states

### Integration

The component is integrated into the consumer dashboard:
- Added to `YesHostel.jsx` component
- Only displays when user has a hostel booking
- Uses hostel ID from localStorage data

### Frontend Files Created/Modified

- `/home/barimah/projects/hostel_react/src/components/dashboard/RatingReview.jsx` - Main component
- `/home/barimah/projects/hostel_react/src/components/dashboard/RatingReview.css` - Styling
- `/home/barimah/projects/hostel_react/src/components/dashboard/YesHostel.jsx` - Integration
- `/home/barimah/projects/hostel_react/src/config/api.js` - API endpoint configuration

## Usage

### For Consumers

1. Navigate to the consumer dashboard
2. Scroll down to see the "Rate and Review Your Hostel" section
3. Click on stars to select a rating (1-5 stars)
4. Write your review in the text area
5. Click "Submit Review" to save your review
6. Click "View Reviews" to see reviews from other consumers

### For Developers

The component automatically:
- Fetches existing reviews on load
- Validates form input
- Handles API errors gracefully
- Updates the UI after successful submission

## API Configuration

The review endpoints are configured in the API config:
```javascript
REVIEWS_CREATE: '/hq/api/reviews/create/',
REVIEWS_GET: '/hq/api/reviews/',
```

## Error Handling

The component handles various error scenarios:
- Network errors
- Authentication failures
- Validation errors
- Server errors

All errors are displayed to the user with appropriate messaging.

## Responsive Design

The component is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

The layout adapts to different screen sizes with appropriate styling adjustments.

## Future Enhancements

Potential improvements for the future:
- Edit/delete reviews functionality
- Review moderation features
- Average rating display
- Review filtering and sorting
- Rich text formatting for reviews
