import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import NoHostel from "../components/dashboard/NoHostel";
import YesHostel from "../components/dashboard/YesHostel";
import YourReservation from "../components/dashboard/YourReservation";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import { fetchReservations, fetchAllReservations, fetchConsumerData } from "../store/thunks/hostelThunks";
import { setCurrentHostel, clearHostelData } from "../store/slices/hostelSlice";
import { useAuthData } from "../hooks/useAuthData";
import { useHostelData } from "../hooks/useHostelData";
import { useReservationData } from "../hooks/useReservationData";
import { checkResponseForUnverifiedAccount, handleUnverifiedAccount } from "../utils/authUtils";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Use Redux hooks for data
  const { token, email, isAuthenticated } = useAuthData();
  const { hostel, loading: hostelLoading } = useHostelData();
  const { hasReservation, reservation, loading: reservationLoading } = useReservationData();

  // Fetch data when component mounts
  useEffect(() => {
    if (isAuthenticated && token) {
      
      // Fetch data in sequence to avoid conflicts
      const fetchData = async () => {
        try {
          const consumerResult = await dispatch(fetchConsumerData());
          
          const reservationResult = await dispatch(fetchReservations());
          
          const allReservationsResult = await dispatch(fetchAllReservations());
        } catch (error) {
        }
      };
      
      fetchData();
    }
  }, [dispatch, isAuthenticated, token]);

  // Determine user status based on API responses
  const hasHostel = hostel && Object.keys(hostel).length > 0;
  const hasReservationData = hasReservation && reservation && Object.keys(reservation).length > 0;
  const isLoading = hostelLoading || reservationLoading;

  // Dashboard logic based on actual API responses:
  // 1. hasHostel = true → Confirmed consumer (consumer.stat === "True" and data exists)
  // 2. hasReservation = true but no hostel → Reserved user (has reservations but not confirmed consumer)
  // 3. Neither → No reservation
  const dashboardState = isLoading 
    ? 'loading' 
    : hasHostel 
      ? 'consumer'        // User is confirmed consumer (living in hostel)
      : hasReservationData 
        ? 'reserved'      // User has reservation but not confirmed consumer
        : 'none';        // No reservation

  // Debug logging
  
  

  // Also log localStorage for comparison

  return (
    <div>
      <NavBar />
      
      
      
      {dashboardState === 'loading' ? (
        <div>Loading...</div>
      ) : dashboardState === 'consumer' ? (
        <YesHostel />
      ) : dashboardState === 'reserved' ? (
        <YourReservation />
      ) : (
        <NoHostel />
      )}
      <Footer />
    </div>
  );
}

export default Dashboard;