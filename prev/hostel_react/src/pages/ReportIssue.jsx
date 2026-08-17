import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function ReportIssue() {
  return (
    <>
      <NavBar />
      <div className="document_container" style={{ paddingTop: 90, paddingBottom: 40, maxWidth: 1000, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
        <h1 style={{ marginBottom: 12 }}>Report Issue</h1>
        <p>Tell us what went wrong so we can fix it quickly.</p>
      </div>
      <Footer />
    </>
  );
}

export default ReportIssue;


