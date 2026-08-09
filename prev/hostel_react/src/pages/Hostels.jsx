import Footer from "../components/Footer";
import CategoryHostel from "../components/hostel/CategoryHostel";
import DetailPopup from "../components/hostel/DetailPopup";
import NavBar from "../components/NavBar";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import "../assets/css/hostel/CategoryHostel.css";
import SEO from "../components/seo/SEO";
import { SITE_URL } from "../config/site";
import { buildApiUrl, API_ENDPOINTS } from "../config/api";
import { useNavigate } from "react-router-dom";
import { checkResponseForUnverifiedAccount, handleUnverifiedAccount } from "../utils/authUtils";
import { useDispatch } from "react-redux";
import { fetchAllReservations } from "../store/thunks/hostelThunks";
import { useAuthData } from "../hooks/useAuthData";

function Hostels() {
    const [q, setQ] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token, isAuthenticated } = useAuthData();

    const [hostelsData, setHostelsData] = useState(() => {
        try { 
            const cached = localStorage.getItem("all_hostels");
            const cacheTime = localStorage.getItem("all_hostels_timestamp");
            const now = Date.now();
            const cacheAge = now - (parseInt(cacheTime) || 0);
            const maxCacheAge = 5 * 60 * 1000; // 5 minutes
            
            if (cached && cacheAge < maxCacheAge) {
                return JSON.parse(cached) || [];
            }
            return [];
        } catch { return []; }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to clear cache and force refresh
    const clearCacheAndRefresh = () => {
        try {
            localStorage.removeItem('all_hostels');
            localStorage.removeItem('all_hostels_timestamp');
        } catch (e) {
        }
        // Force refresh by setting hostelsData to empty array
        setHostelsData([]);
    };

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return hostelsData;
        const parseAmenities = (value) => {
            try {
                if (!value) return [];
                if (Array.isArray(value)) return value;
                if (typeof value === "string") {
                    const t = value.trim();
                    if (t.startsWith("[") || t.startsWith("{")) {
                        const p = JSON.parse(t);
                        return Array.isArray(p) ? p : [];
                    }
                    return t.split(",").map(v => v.trim()).filter(Boolean);
                }
                return [];
            } catch { return []; }
        };
    return hostelsData.filter(h => {
            const nameMatch = (h?.name || "").toLowerCase().includes(query);
            const campusMatch = (h?.campus?.campus || "").toLowerCase().includes(query);
            const amenities = parseAmenities(h?.additional_details);
            const amenityMatch = amenities.some(a => (a || "").toLowerCase().includes(query));
            return nameMatch || campusMatch || amenityMatch;
        });
    }, [q, hostelsData]);

    // Always request hostels data when visiting this page and cache to localStorage
    useEffect(() => {
        const email = localStorage.getItem('email');

        // If there's no token, show a simple login prompt UI (we still allow viewing landing/signup elsewhere)
        if (!token || !isAuthenticated) return;

        // Fetch all reservations for availability calculation
        dispatch(fetchAllReservations());

        let cancelled = false;

                async function fetchHostels() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(buildApiUrl(API_ENDPOINTS.HOSTELS), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`
                    }
                });

                // handle unverified account redirect
                if (await checkResponseForUnverifiedAccount(res)) {
                    handleUnverifiedAccount(email, navigate);
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    throw new Error(`Failed to fetch hostels: ${res.status}`);
                }

                const hostels = await res.json();
                if (cancelled) return;
                try { 
                    localStorage.setItem('all_hostels', JSON.stringify(hostels));
                    localStorage.setItem('all_hostels_timestamp', Date.now().toString());
                } catch (e) { }
                setHostelsData(hostels || []);
                // trigger re-render by setting search state to itself (or could use a state for hostels)
                setQ((s) => s);
            } catch (err) {
                if (!cancelled) setError(err.message || String(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchHostels();

        return () => { cancelled = true; };
    }, [navigate, token, isAuthenticated]);

    // Auto-fetch when hostelsData is empty (after cache clear)
    useEffect(() => {
        if (hostelsData.length === 0 && !loading) {
            const fetchHostels = async () => {
                try {
                    setLoading(true);
                    const token = localStorage.getItem('token');
                    const email = localStorage.getItem('email');
                    
                    if (!token || !email) {
                        setLoading(false);
                        return;
                    }

                    const res = await fetch(buildApiUrl(API_ENDPOINTS.HOSTELS), {
                        headers: {
                            'Authorization': `Token ${token}`
                        }
                    });

                    if (await checkResponseForUnverifiedAccount(res)) {
                        handleUnverifiedAccount(email, navigate);
                        setLoading(false);
                        return;
                    }

                    if (!res.ok) {
                        throw new Error(`Failed to fetch hostels: ${res.status}`);
                    }

                    const hostels = await res.json();
                    try { 
                        localStorage.setItem('all_hostels', JSON.stringify(hostels));
                        localStorage.setItem('all_hostels_timestamp', Date.now().toString());
                    } catch (e) { }
                    setHostelsData(hostels || []);
                } catch (err) {
                    setError(err.message || String(err));
                } finally {
                    setLoading(false);
                }
            };

            fetchHostels();
        }
    }, [hostelsData.length, loading, navigate]);

    return (
        <>
            <SEO
                title="Browse Hostels | Hosttelz"
                description="Explore and search affordable hostels by name, campus, and amenities on Hosttelz."
                canonical={`${SITE_URL}/hostels`}
                url={`${SITE_URL}/hostels`}
            />
            <NavBar />
            <div className="hostels_main_container" style={{paddingTop: 90}}>
                {/* If user is not logged in, show prompt to login to access hostels */}
                {!token || !isAuthenticated ? (
                    <div style={{textAlign: 'center', padding: '80px 16px'}}>
                        <h2 style={{fontSize: '1.5rem', marginBottom: 8}}>Please log in to browse hostels</h2>
                        <p style={{color: 'var(--color-muted-text)', marginBottom: 20}}>You need to be signed in to access detailed hostel listings. Create an account or log in to continue.</p>
                        <div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
                            <a href="/signup" className="cta_button secondary">Sign up</a>
                            <a href="/login" className="cta_button">Log in</a>
                        </div>
                    </div>
                ) : (
                <>
                <div className="hostels_header">
                    <div className="hostels_main_title">Browse Hostels</div>
                    <div className="hostels_subtitle">Search by name, campus or amenities</div>
                    <form onSubmit={(e)=> e.preventDefault()} style={{display:'flex',justifyContent:'center',marginTop:16}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(248,250,252,0.9)',border:'1px solid rgba(226,232,240,0.7)',padding:'10px 12px',borderRadius:12,minWidth:280}}>
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search hostels or amenities"
                                value={q}
                                onChange={(e)=> setQ(e.target.value)}
                                style={{border:'none',outline:'none',background:'transparent',width:320,maxWidth:'70vw'}}
                                aria-label="Search hostels"
                            />
                        </div>
                    </form>
                </div>
                    {/* Render categories using filtered list if available */}
                    <CategoryHostel externalHostels={filtered.length ? filtered : hostelsData} />
                </>
                )}
            </div>
            <DetailPopup />
            <script src="https://js.paystack.co/v1/inline.js"></script>
            <Footer />
        </>
    );
}

export default Hostels;