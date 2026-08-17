import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function Feedback() {
  return (
    <>
      <NavBar />
      <div className="document_container" style={{ paddingTop: 90, paddingBottom: 40, maxWidth: 1000, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
        <h1 style={{ marginBottom: 12 }}>Feedback</h1>
        <p>Share your thoughts to help us improve HostelHQ.</p>
      </div>
      <Footer />
    </>
  );
}

export default Feedback;


