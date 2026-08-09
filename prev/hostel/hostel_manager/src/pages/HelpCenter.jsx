import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function HelpCenter() {
  return (
    <>
      <NavBar />
      <div className="document_container" style={{ paddingTop: 90, paddingBottom: 40, maxWidth: 1000, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
        <h1 style={{ marginBottom: 12 }}>Help Center</h1>
        <p>Find answers to common questions and get support.</p>
      </div>
      <Footer />
    </>
  );
}

export default HelpCenter;


