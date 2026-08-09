import NavBar from "../components/NavBar";
import CardContainer from "../components/landingpage/CardContainer";
import Footer from "../components/Footer";
import { buildApiUrl, API_ENDPOINTS } from "../config/api";
import SEO from "../components/seo/SEO";
import { SITE_URL, DEFAULT_META } from "../config/site";


function Landingpage() {

  const token = localStorage.getItem('token');
  
  async function get_username() {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.LANDING_PAGE), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        }
      });
      const data = await res.json();

      localStorage.setItem('name', data.name || data.username)
      localStorage.setItem('email', data.email)
      
    };

  get_username()
    
  return (
    <>
      <SEO
        title={DEFAULT_META.title}
        description={DEFAULT_META.description}
        keywords={DEFAULT_META.keywords}
        canonical={SITE_URL}
        url={SITE_URL}
      />
      <NavBar />
      <CardContainer />
      <Footer />
    </>
  );
}

export default Landingpage;
