import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function SafetyTips() {
  return (
    <>
      <NavBar />
      <div className="document_container" style={{ paddingTop: 90, paddingBottom: 40, maxWidth: 1000, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
        <h1 style={{ marginBottom: 12 }}>Safety Tips</h1>
        <p>Best practices for safe living and booking with confidence.</p>
      </div>
      <Footer />
    </>
  );
}

export default SafetyTips;


