import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function ContactUs() {
  return (
    <>
      <NavBar />
      <div className="document_container" style={{ paddingTop: 90, paddingBottom: 40, maxWidth: 1000, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
        <h1 style={{ marginBottom: 12 }}>Contact Us</h1>
        <p>We'd love to hear from you. Reach out with any questions or feedback.</p>
      </div>
      <Footer />
    </>
  );
}

export default ContactUs;


