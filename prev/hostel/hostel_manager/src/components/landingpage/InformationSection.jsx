import "../../assets/css/landingpage/InformationSection.css";
import CarouselCard from "./CarouselCard";

function InformationSection() {
  return (
    <div className="information_section">
      <div className="information_information">
        <div className="information_section_title">
          <p>Why Staypal</p>
        </div>
        <div className="information_section_subtitle">
          See how staypal will transform your hostel search experience
        </div>
      </div>

    <div className="carousel_section">
    <CarouselCard />
    </div>
    </div>
  );
}

export default InformationSection;
