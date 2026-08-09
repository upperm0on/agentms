import '../../assets/css/landingpage/LandingTest.css';
import SearchForm from './SearchForm';

function LandingTest() {
    return (
        <div className="hero_section">
            <div className="hero_content">
                <h1 className="hero_title">
                    Find Your Perfect <span>Student Hostel</span> in Minutes
                </h1>
                <p className="hero_subtitle">
                    Connect with verified hostel managers, compare prices, and book your ideal accommodation near your campus. 
                    No more endless searching or unreliable listings.
                </p>
                <div className="hero_stats">
                    <div className="stat_item">
                        <span className="stat_number">500+</span>
                        <span className="stat_label">Hostels Listed</span>
                    </div>
                    <div className="stat_item">
                        <span className="stat_number">10K+</span>
                        <span className="stat_label">Students Served</span>
                    </div>
                    <div className="stat_item">
                        <span className="stat_number">50+</span>
                        <span className="stat_label">Campus Locations</span>
                    </div>
                </div>
            </div>
            <div className="hero_search_container">
                <SearchForm />
            </div>
        </div>
    );
}

export default LandingTest;