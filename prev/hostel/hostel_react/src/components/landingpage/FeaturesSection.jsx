import { Search, Shield, MapPin, MessageCircle, CreditCard, Star } from 'lucide-react';
import '../../assets/css/landingpage/FeaturesSection.css';

function FeaturesSection() {
    return (
        <div className="features_section">
            <div className="features_container">
                <div className="features_header">
                    <h2 className="features_title">Why Choose Our Hostel Booking Platform?</h2>
                    <p className="features_subtitle">
                        We make finding and booking student accommodation simple, secure, and stress-free
                    </p>
                </div>
                
                <div className="features_grid">
                    <div className="feature_card">
                        <div className="feature_icon">
                            <Search size={24} />
                        </div>
                        <h3 className="feature_title">Smart Search</h3>
                        <p className="feature_description">
                            Find hostels near your campus with our intelligent search that filters by location, 
                            price range, and amenities.
                        </p>
                    </div>
                    
                    <div className="feature_card">
                        <div className="feature_icon">
                            <Shield size={24} />
                        </div>
                        <h3 className="feature_title">Verified Listings</h3>
                        <p className="feature_description">
                            All hostels are verified by our team. No fake listings, no scams - 
                            just genuine accommodation options.
                        </p>
                    </div>
                    
                    <div className="feature_card">
                        <div className="feature_icon">
                            <MapPin size={24} />
                        </div>
                        <h3 className="feature_title">Campus Proximity</h3>
                        <p className="feature_description">
                            Find hostels within walking distance of your university. 
                            Save time and money on daily commutes.
                        </p>
                    </div>
                    
                    <div className="feature_card">
                        <div className="feature_icon">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="feature_title">Direct Contact</h3>
                        <p className="feature_description">
                            Connect directly with hostel managers. Ask questions, 
                            negotiate prices, and get instant responses.
                        </p>
                    </div>
                    
                    <div className="feature_card">
                        <div className="feature_icon">
                            <CreditCard size={24} />
                        </div>
                        <h3 className="feature_title">Secure Booking</h3>
                        <p className="feature_description">
                            Safe and secure payment processing. Your money is protected 
                            until you confirm your stay.
                        </p>
                    </div>
                    
                    <div className="feature_card">
                        <div className="feature_icon">
                            <Star size={24} />
                        </div>
                        <h3 className="feature_title">Student Reviews</h3>
                        <p className="feature_description">
                            Read honest reviews from fellow students who have stayed 
                            at these hostels before making your decision.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeaturesSection;
