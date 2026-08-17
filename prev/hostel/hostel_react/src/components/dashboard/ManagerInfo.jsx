import { User, Mail, MessageCircle } from 'lucide-react';
import '../../assets/css/dashboard/ManagerInfo.css';
import { useHostelData } from '../../hooks/useHostelData';

function ManagerInfo() {
    const { hostel } = useHostelData();
    
    // Debug logging to see the actual data structure
    
    // Try different possible manager data structures
    const manager = hostel?.manager?.user || hostel?.manager || hostel?.hostel_manager;
    const managerName = manager?.username || manager?.name || manager?.first_name || 'Manager';
    const managerEmail = manager?.email || 'contact@hostel.com';

    if (!hostel) {
        return (
            <div className="p-4 rounded-2xl shadow bg-red-50 text-red-700">
                <p>No hostel information available.</p>
            </div>
        )
    }

    return (
        <div className="p-6 rounded-2xl shadow bg-white border">
            <h2 className="text-xl font-semibold mb-4"><User size={20} /> Host Information</h2>
            <div className="space-y-2">
                <p><span className="font-medium"><User size={16} /> Host Name:</span> {managerName}</p>
                <p><span className="font-medium"><Mail size={16} /> Email:</span> {managerEmail}</p>
                <button type='button' className='host_button'><MessageCircle size={16} /> Contact Host</button>
            </div>
        </div>
    )
}

export default ManagerInfo
