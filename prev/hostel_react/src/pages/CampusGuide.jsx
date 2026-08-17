import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function CampusGuide() {
  return (
    <>
      <NavBar />
      <div className="document_container" style={{ paddingTop: 90, paddingBottom: 40, maxWidth: 1000, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
        <h1 style={{ marginBottom: 12 }}>Campus Guide</h1>
        <p>Explore nearby amenities, transport, and essentials for your campus.</p>
      </div>
      <Footer />
    </>
  );
}

export default CampusGuide;


