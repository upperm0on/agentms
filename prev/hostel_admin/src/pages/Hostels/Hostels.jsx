import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react'
import { fetchHostels, setFilters, deleteHostel } from '../../store/slices/hostelsSlice'
import HostelCard from '../../components/Hostels/HostelCard'
import HostelModal from '../../components/Hostels/HostelModal'
import './Hostels.css'

function Hostels() {
  const dispatch = useDispatch()
  const { hostels, isLoading, filters } = useSelector((state) => state.hostels)
  
  const [showModal, setShowModal] = useState(false)
  const [selectedHostel, setSelectedHostel] = useState(null)
  const [searchInput, setSearchInput] = useState(filters.search)
  const [expandedHostels, setExpandedHostels] = useState(new Set())

  useEffect(() => {
    dispatch(fetchHostels())
  }, [dispatch])


  const handleCreateHostel = () => {
    setSelectedHostel(null)
    setShowModal(true)
  }

  const handleEditHostel = (hostel) => {
    setSelectedHostel(hostel)
    setShowModal(true)
  }

  const handleViewHostel = (hostel) => {
    // Navigate to hostel details or open view modal
    console.log('View hostel:', hostel)
  }

  const handleDeleteHostel = async (hostel) => {
    if (window.confirm(`Are you sure you want to delete ${hostel.name}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteHostel(hostel.id)).unwrap()
        // Show success message or handle success
        console.log('Hostel deleted successfully')
      } catch (error) {
        console.error('Failed to delete hostel:', error)
        alert(`Failed to delete hostel: ${error}`)
      }
    }
  }

  const toggleExpanded = (hostelId) => {
    const newExpanded = new Set(expandedHostels)
    if (newExpanded.has(hostelId)) {
      newExpanded.delete(hostelId)
    } else {
      newExpanded.add(hostelId)
    }
    setExpandedHostels(newExpanded)
  }

  const filteredHostels = useMemo(() => {
    return hostels.filter(hostel => 
      hostel.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
      hostel.campus?.campus?.toLowerCase().includes(searchInput.toLowerCase()) ||
      hostel.location?.toLowerCase().includes(searchInput.toLowerCase())
    )
  }, [hostels, searchInput])

  return (
    <div className="hostels">
      <div className="hostels-header">
        <div>
          <h1 className="hostels-title">Hostels</h1>
          <p className="hostels-subtitle">Manage all hostels in the system</p>
        </div>
        <button 
          className="create-hostel-btn"
          onClick={handleCreateHostel}
        >
          <Plus size={20} />
          Add Hostel
        </button>
      </div>

      <div className="hostels-filters">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search hostels..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="filter-btn">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {isLoading ? (
        <div className="hostels-loading">
          <div className="loading-spinner"></div>
          <p>Loading hostels...</p>
        </div>
      ) : (
        <div className="hostels-list">
          {filteredHostels.map((hostel) => {
            const isExpanded = expandedHostels.has(hostel.id)
            return (
              <div key={`hostel-${hostel.id}`} className="hostel-list-item">
                <div 
                  className="hostel-list-header"
                  onClick={() => toggleExpanded(hostel.id)}
                >
                  <div className="hostel-list-info">
                    <h3 className="hostel-name">{hostel.name}</h3>
                    <p className="hostel-location">{hostel.campus?.campus || hostel.location}</p>
                    <p className="hostel-status">
                      {hostel.accepts_bookings ? 'Accepting Bookings' : 'Not Accepting Bookings'}
                    </p>
                  </div>
                  <div className="hostel-list-actions">
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditHostel(hostel)
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewHostel(hostel)
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteHostel(hostel)
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="expand-btn">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="hostel-list-details">
                    <HostelCard
                      key={`hostel-card-${hostel.id}`}
                      hostel={hostel}
                      onEdit={handleEditHostel}
                      onView={handleViewHostel}
                      onDelete={handleDeleteHostel}
                      isExpanded={true}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <HostelModal
          hostel={selectedHostel}
          onClose={() => {
            setShowModal(false)
            setSelectedHostel(null)
          }}
        />
      )}
    </div>
  )
}

export default Hostels
