import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../assets/css/Legal.css";

function TermsOfService() {
  return (
    <>
      <NavBar />
      <div className="legal-container">
        <div className="legal-hero">
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="legal-card">
        <h2>Agreement to Terms</h2>
        <p>By accessing or using HostelHQ, you agree to be bound by these Terms. If you do not agree, do not use the service.</p>

        <h2>Accounts</h2>
        <ul className="legal-list">
          <li>You must provide accurate information and keep your account secure.</li>
          <li>You are responsible for activities under your account.</li>
          <li>We may suspend or terminate accounts that violate these Terms.</li>
        </ul>

        <h2>Use of the Service</h2>
        <ul className="legal-list">
          <li>Do not misuse the platform, interfere with its operation, or attempt unauthorized access.</li>
          <li>Do not post unlawful, misleading, or infringing content.</li>
          <li>We may modify or discontinue features at any time.</li>
        </ul>

        <h2>Listings and Bookings</h2>
        <ul className="legal-list">
          <li>We aggregate hostel listings. Availability, amenities, and prices are provided by partners and may change.</li>
          <li>Booking terms (cancellations, deposits) are defined by the hostel partner.</li>
          <li>We are not a property manager or broker; we facilitate discovery and booking.</li>
        </ul>

        <h2>Payments</h2>
        <p>Payments are processed by third‑party providers. You authorize charges related to your bookings. Additional identity verification may be required to prevent fraud.</p>

        <h2>Intellectual Property</h2>
        <p>All content and software are the property of HostelHQ or its licensors and protected by applicable laws. You receive a limited, non‑transferable license to use the service.</p>

        <h2>Disclaimer of Warranties</h2>
        <p>Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee accuracy, availability, or fitness for a particular purpose.</p>

        <h2>Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, HostelHQ will not be liable for indirect, incidental, consequential, or punitive damages, or any loss of data, profits, or goodwill.</p>

        <h2>Indemnification</h2>
        <p>You agree to defend, indemnify, and hold harmless HostelHQ and its affiliates from claims arising out of your use of the service or violation of these Terms.</p>

        <h2>Governing Law</h2>
        <p>These Terms are governed by the laws of the applicable jurisdiction where HostelHQ operates, without regard to conflict‑of‑law principles.</p>

        <h2>Changes to Terms</h2>
        <p>We may update these Terms. Continued use after changes means you accept the updated Terms.</p>

        <h2>Contact</h2>
        <p>For questions about these Terms, contact: legal@hosttels.com</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default TermsOfService;


