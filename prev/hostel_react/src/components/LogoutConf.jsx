import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import "../assets/css/LogoutConf.css";

function LogoutConfirm({ children, onConfirm }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ vertical: 'below', horizontal: 'center' });
  const buttonRef = useRef(null);
  const popupRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("search_data");
    localStorage.removeItem("information");
    localStorage.removeItem("room_booked");
    window.location.href = "/";
  };

  // Calculate optimal position for modal
  const calculatePosition = () => {
    if (!buttonRef.current || !popupRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const modalRect = popupRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const modalWidth = 400; // max-width from CSS
    const modalHeight = 200; // estimated height
    const margin = 20; // margin from viewport edges

    let vertical = 'below';
    let horizontal = 'center';

    // Check if there's enough space below the button
    if (buttonRect.bottom + modalHeight + margin > viewportHeight) {
      vertical = 'above';
    }

    // Check horizontal positioning
    const centerX = buttonRect.left + (buttonRect.width / 2);
    const modalLeft = centerX - (modalWidth / 2);
    const modalRight = centerX + (modalWidth / 2);

    if (modalLeft < margin) {
      horizontal = 'right';
    } else if (modalRight > viewportWidth - margin) {
      horizontal = 'left';
    }

    setPosition({ vertical, horizontal });
  };

  // Close if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      // Calculate position when modal opens
      setTimeout(calculatePosition, 0);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="logout-wrapper">
      {/* The Logout trigger */}
      <div
        ref={buttonRef}
        className="logout-trigger"
        onClick={() => setOpen(!open)}
      >
        {children}
      </div>

      {/* Modal overlay */}
      {open && (
        <div 
          className={`logout-overlay ${
            position.vertical === 'above' ? 'position-above' : ''
          } ${
            position.horizontal === 'right' ? 'position-right' : 
            position.horizontal === 'left' ? 'position-left' : ''
          }`}
        >
          <div ref={popupRef} className="logout-modal">
            <div className="modal-header">
              <div className="modal-icon">
                <LogOut size={20} />
              </div>
              <h3 className="modal-title">Confirm Logout</h3>
            </div>
            
            <div className="modal-content">
              <p className="modal-message">
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="modal-btn cancel-btn" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn confirm-btn" 
                onClick={() => {
                  if (onConfirm) {
                    onConfirm(logout());
                  } else {
                    logout();
                  }
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogoutConfirm;
