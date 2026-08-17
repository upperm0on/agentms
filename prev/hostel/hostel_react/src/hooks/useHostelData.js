import { useSelector } from 'react-redux';

// Simple hook to get hostel data from Redux
export const useHostelData = () => {
  const hostelState = useSelector(state => state.hostel);
  
  return {
    hostel: hostelState.currentHostel,
    allHostels: hostelState.allHostels,
    loading: hostelState.loading,
    error: hostelState.error,
  };
};
