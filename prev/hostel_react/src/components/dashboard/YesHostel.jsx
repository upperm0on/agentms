import "../../assets/css/dashboard/YesHostel.css";
import HostelCard from "./HostelCard";
import ManagerInfo from "./ManagerInfo";
import BookingInfo from "./BookingInfo";
import YourRoom from "./YourRoom";
import RatingReview from "./RatingReview";
import { useHostelData } from "../../hooks/useHostelData";

function YesHostel() {
  // Get hostel data from Redux
  const { hostel } = useHostelData();
  const hasBooking = hostel && Object.keys(hostel).length > 0;
  const hostelId = hostel?.id;

  return (
    <div className="hostel_dashboard_space">
        <div className="details_side">
            {hasBooking ? <YourRoom /> : null}
            <BookingInfo />
            <ManagerInfo />
        </div>
        <div className="hostel_side">
            <HostelCard />
            {hostelId && <RatingReview hostelId={hostelId} />}
        </div>
    </div>
  );
}

export default YesHostel;
