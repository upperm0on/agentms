import '../../assets/css/landingpage/CTASection.css';
import { Link } from 'react-router-dom';

function CTASection() {
    return (
        <div className="cta_section">
            <div className="cta_container">
                <div className="cta_content">
                    <h2 className="cta_title">Ready to Find Your Perfect Hostel?</h2>
                    <p className="cta_subtitle">
                        Join thousands of students who have already found their ideal accommodation. 
                        Start your search today and secure your spot for the next semester.
                    </p>
                    <div className="cta_buttons">
                        <Link to="/hostels" className="cta_button primary">
                            Browse Hostels
                        </Link>
                        <Link to="/signup" className="cta_button secondary">
                            Sign Up Free
                        </Link>
                    </div>
                    <div className="cta_features">
                        <div className="cta_feature">
                            <span className="cta_feature_icon">✓</span>
                            <span className="cta_feature_text">Free to use</span>
                        </div>
                        <div className="cta_feature">
                            <span className="cta_feature_icon">✓</span>
                            <span className="cta_feature_text">No hidden fees</span>
                        </div>
                        <div className="cta_feature">
                            <span className="cta_feature_icon">✓</span>
                            <span className="cta_feature_text">Verified listings</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CTASection;
