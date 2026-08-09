import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function StudentResources() {
  return (
    <>
      <NavBar />
      <div className="document_container" style={{ paddingTop: 90, paddingBottom: 40, maxWidth: 1000, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
        <h1 style={{ marginBottom: 12 }}>Student Resources</h1>
        <p>Guides and tips to help you find and settle into your hostel.</p>
      </div>
      <Footer />
    </>
  );
}

export default StudentResources;


