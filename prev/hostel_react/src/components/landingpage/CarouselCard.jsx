import '../../assets/css/landingpage/CarouselCard.css';

function CarouselCard() {
  return (
    <div className="carousel_card">
      <div className="carousel_title">
        <p className="title">Student Success Stories</p>
      </div>
      <p className="subtitle">
        Real experiences from students who found their perfect hostel
      </p>
      <div className="flexed_content">
        
        <div className="testimonial_card">
          <div className="testimonial_header">
            <div className="student_avatar">
              <img src="/icons/person.svg" alt="Student" />
            </div>
            <div className="student_info">
              <h4 className="student_name">Sarah Johnson</h4>
              <p className="student_campus">University of Technology</p>
            </div>
          </div>
          <div className="testimonial_content">
            <p className="testimonial_text">
              "Found my perfect hostel in just 2 days! The platform made it so easy to compare 
              options and connect with the manager directly. Saved me weeks of searching."
            </p>
            <div className="rating">
              ⭐⭐⭐⭐⭐
            </div>
          </div>
        </div>
        
        <div className="testimonial_card">
          <div className="testimonial_header">
            <div className="student_avatar">
              <img src="/icons/person.svg" alt="Student" />
            </div>
            <div className="student_info">
              <h4 className="student_name">Michael Chen</h4>
              <p className="student_campus">State University</p>
            </div>
          </div>
          <div className="testimonial_content">
            <p className="testimonial_text">
              "The verified listings gave me confidence. No more worrying about fake ads. 
              The hostel I booked exceeded my expectations and the price was fair."
            </p>
            <div className="rating">
              ⭐⭐⭐⭐⭐
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarouselCard;
