// Centralized site metadata and URLs
// Values can be overridden via environment variables

export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://hosttelz.com';
export const OG_IMAGE_URL = `${SITE_URL}/images/hosttelz-banner.jpg`;
export const CANONICAL_URL = SITE_URL;

// API base used by client-side code via Vite env
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const DEFAULT_META = {
  title: 'Hosttelz | Book affordable Hostels & Manage Hostel Reservations Easily',
  description:
    'Find and book affordable hostels with Hosttelz. Hostel owners can easily manage reservations, check-ins, and guests. Discover the best hostel deals near you today!',
  keywords:
    'hostel booking, affordable hostels, hostel management, student housing, guest check-in, hostels in Ghana, hostel reservation platform',
};
