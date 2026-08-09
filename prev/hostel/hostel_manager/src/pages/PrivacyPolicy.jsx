import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../assets/css/Legal.css";

function PrivacyPolicy() {
  return (
    <>
      <NavBar />
      <div className="legal-container">
        <div className="legal-hero">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="legal-card">
        <h2>Overview</h2>
        <p>HostelHQ ("we", "us", "our") connects students with hostel listings. This Privacy Policy explains what information we collect, how we use it, and your rights.</p>

        <h2>Information We Collect</h2>
        <ul className="legal-list">
          <li>Account data: name, email, password (hashed), verification status.</li>
          <li>Usage data: device info, IP address, pages viewed, timestamps.</li>
          <li>Transaction data: booking references and payment confirmations (processed by third‑party providers).</li>
          <li>Content you provide: reviews, messages, preferences.</li>
        </ul>

        <h2>How We Use Information</h2>
        <ul className="legal-list">
          <li>Provide and maintain the service (authentication, search, bookings).</li>
          <li>Improve reliability, performance, and user experience.</li>
          <li>Communicate about account, verification, and service updates.</li>
          <li>Prevent fraud, abuse, and enforce our Terms.</li>
          <li>Comply with legal obligations.</li>
        </ul>

        <h2>Legal Bases (EEA/UK)</h2>
        <ul className="legal-list">
          <li>Contract: to provide requested services.</li>
          <li>Legitimate interests: to secure, operate, and improve our platform.</li>
          <li>Consent: for certain cookies/marketing where required.</li>
          <li>Legal obligation: record‑keeping and compliance.</li>
        </ul>

        <h2>Sharing and Disclosure</h2>
        <ul className="legal-list">
          <li>Service providers: hosting, analytics, payment processing, email delivery.</li>
          <li>Hostel partners: limited data necessary to manage a booking.</li>
          <li>Legal: to respond to lawful requests or protect rights and safety.</li>
          <li>Business transfers: in case of merger, acquisition, or asset sale.</li>
        </ul>

        <h2>Data Retention</h2>
        <p>We retain personal data only for as long as needed to deliver services, resolve disputes, and meet legal obligations. Retention periods vary by data type and context.</p>

        <h2>Security</h2>
        <p>We use administrative, technical, and organizational measures to protect data (e.g., encryption in transit, access controls). No method is 100% secure.</p>

        <h2>Your Rights</h2>
        <ul className="legal-list">
          <li>Access, correction, deletion, and portability of your data.</li>
          <li>Object to or restrict certain processing.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>Lodge a complaint with your local data protection authority.</li>
        </ul>

        <h2>International Transfers</h2>
        <p>Your data may be processed in countries with different laws. Where required, we use safeguards like Standard Contractual Clauses.</p>

        <h2>Children</h2>
        <p>Our services are not intended for children under 16. We do not knowingly collect data from children. If you believe a child provided data, contact us to remove it.</p>

        <h2>Contact Us</h2>
        <p>For privacy questions or requests, contact: privacy@hosttels.com</p>

        <h2>Changes to this Policy</h2>
        <p>We may update this Policy. Material changes will be communicated via the app or email where appropriate.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PrivacyPolicy;


