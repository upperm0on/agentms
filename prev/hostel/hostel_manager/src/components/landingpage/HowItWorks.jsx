import '../../assets/css/landingpage/HowItWorks.css';

function HowItWorks() {
    return (
        <div className="how_it_works_section">
            <div className="how_it_works_container">
                <div className="how_it_works_header">
                    <h2 className="how_it_works_title">How It Works</h2>
                    <p className="how_it_works_subtitle">
                        Get your perfect hostel in just 4 simple steps
                    </p>
                </div>
                
                <div className="steps_container">
                    <div className="step_item">
                        <div className="step_number">1</div>
                        <div className="step_content">
                            <h3 className="step_title">Search & Filter</h3>
                            <p className="step_description">
                                Enter your campus location and use our smart filters to find hostels 
                                that match your budget and preferences.
                            </p>
                        </div>
                    </div>
                    
                    <div className="step_item">
                        <div className="step_number">2</div>
                        <div className="step_content">
                            <h3 className="step_title">Compare Options</h3>
                            <p className="step_description">
                                View detailed information, photos, amenities, and student reviews 
                                to compare different hostel options.
                            </p>
                        </div>
                    </div>
                    
                    <div className="step_item">
                        <div className="step_number">3</div>
                        <div className="step_content">
                            <h3 className="step_title">Contact Manager</h3>
                            <p className="step_description">
                                Connect directly with hostel managers to ask questions, 
                                negotiate prices, and confirm availability.
                            </p>
                        </div>
                    </div>
                    
                    <div className="step_item">
                        <div className="step_number">4</div>
                        <div className="step_content">
                            <h3 className="step_title">Secure Booking</h3>
                            <p className="step_description">
                                Complete your booking with secure payment processing. 
                                Get confirmation and move-in details instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HowItWorks;
