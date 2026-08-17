import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import HostelSEO from '../components/seo/HostelSEO';
import { API_ENDPOINTS, buildApiUrl } from '../config/api';

export default function HostelDetail() {
  const { slugOrId } = useParams();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);

  const allHostels = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('all_hostels')) || []; } catch { return []; }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const localMatch = allHostels.find(h => `${h.slug || h.uuid || h.id}` === slugOrId);
    if (localMatch) {
      setHostel(localMatch);
      setLoading(false);
    }

    async function fetchHostel() {
      try {
        // Attempt to fetch single hostel by id/slug if your API supports it.
        // Fallback: fetch all and filter.
        const listUrl = buildApiUrl(API_ENDPOINTS.HOSTELS);
        const res = await fetch(listUrl);
        if (!res.ok) throw new Error('Failed to load hostels');
        const data = await res.json();
        const found = Array.isArray(data) ? data.find(h => `${h.slug || h.uuid || h.id}` === slugOrId) : null;
        if (!cancelled) {
          setHostel(found || localMatch || null);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) setLoading(false);
      }
    }

    if (!localMatch) fetchHostel();

    return () => { cancelled = true; }
  }, [slugOrId, allHostels]);

  return (
    <>
      {hostel && <HostelSEO hostel={hostel} />}
      <NavBar />
      <div style={{ paddingTop: 90, minHeight: '60vh' }}>
        {loading && <div style={{ textAlign: 'center' }}>Loading hostel…</div>}
        {!loading && !hostel && <div style={{ textAlign: 'center' }}>Hostel not found.</div>}
        {!loading && hostel && (
          <div className="hostel-detail-container" style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>{hostel.name}</h1>
            <div style={{ marginTop: 12, color: '#64748b' }}>{hostel.description || hostel.short_description}</div>
            {hostel.image && (
              <img
                src={`/${hostel.image}`}
                alt={hostel.name}
                style={{ width: '100%', height: 'auto', borderRadius: 12, marginTop: 16 }}
              />
            )}
            {/* TODO: Render more hostel fields here as needed */}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
