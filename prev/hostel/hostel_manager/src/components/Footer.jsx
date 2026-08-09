import { Link } from "react-router-dom";
import "../assets/css/Footer.css";

function Footer() {
  return (
    <footer>
      <div className="logo">
       <Link to='/'><img src="/images/logo.svg" alt="HostelHQ Logo" /></Link>
      </div>
      <p className="footer-text">
        Connecting students with the perfect hostel experience. Find your ideal accommodation with verified listings and trusted reviews.
      </p>
      <div className="flex-content">
        <ul className="flex-content-item">
          <li className="c1-item">Quick Links</li>
          <li className="c2-item"><Link to="/hostels">Browse Hostels</Link></li>
          <li className="c2-item"><Link to="/student-resources">Student Resources</Link></li>
          <li className="c2-item"><Link to="/campus-guide">Campus Guide</Link></li>
          <li className="c2-item"><Link to="/safety-tips">Safety Tips</Link></li>
        </ul>
        <ul className="flex-content-item">
          <li className="c1-item">Support</li>
          <li className="c2-item"><Link to="/help-center">Help Center</Link></li>
          <li className="c2-item"><Link to="/contact-us">Contact Us</Link></li>
          <li className="c2-item"><Link to="/report-issue">Report Issue</Link></li>
          <li className="c2-item"><Link to="/feedback">Feedback</Link></li>
        </ul>
        <ul className="flex-content-item">
          <li className="c1-item">Legal</li>
          <li className="c2-item"><Link to="/privacy-policy">Privacy Policy</Link></li>
          <li className="c2-item"><Link to="/terms-of-service">Terms of Service</Link></li>
          <li className="c2-item"><Link to="/cookie-policy">Cookie Policy</Link></li>
          <li className="c2-item"><Link to="/disclaimer">Disclaimer</Link></li>
        </ul>
      </div>
      <p className="footer-sub_text">Your Home Away From Home</p>
    </footer>
  );
}

export default Footer;
