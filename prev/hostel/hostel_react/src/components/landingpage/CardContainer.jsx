import "../../assets/css/landingpage/CardContainer.css";
import LandingTest from "./LandingText";
import FeaturesSection from "./FeaturesSection";
import HowItWorks from "./HowItWorks";
import CTASection from "./CTASection";

function CardContainer() {
  return (
    <div className="main_container">
      <LandingTest />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
    </div>
  );
}

export default CardContainer;
