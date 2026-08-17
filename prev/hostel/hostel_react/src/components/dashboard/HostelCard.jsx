import React from 'react';
import RoomCard from "./RoomCard";
import { Building2, BarChart3, Users, MapPin, Sparkles, Star } from "lucide-react";
import "../../assets/css/dashboard/HostelCard.css";
import { buildMediaUrl } from "../../config/api";
import { useHostelData } from "../../hooks/useHostelData";

function HostelCard() {
  const { hostel } = useHostelData();
  const additionalDetails = Array.isArray(hostel?.additional_details)
    ? hostel.additional_details
    : [];

  // Normalize hostel.image: support array/JSON/CSV and strip leading '/https://'
  const parseFirstImage = (val) => {
    try {
      if (Array.isArray(val)) return (val[0] || "").toString().trim();
      if (typeof val === "string") {
        const s = val.trim();
        if (!s) return "";
        if (s.startsWith("[")) {
          const arr = JSON.parse(s);
          if (Array.isArray(arr)) return (arr[0] || "").toString().trim();
        }
        if (s.includes(",")) {
          const first = s.split(",").map(t => t.trim()).find(Boolean);
          return first || "";
        }
        return s;
      }
      return "";
    } catch {
      return typeof val === "string" ? val.split(",")[0].trim() : "";
    }
  };

  let hostelImage = parseFirstImage(hostel?.image);
  // Fix '/https://...' edge case
  hostelImage = String(hostelImage).trim().replace(/^\/+((?:https?:)?\/\/)/i, '$1');
  // If absolute or protocol-relative, use as-is; else build with base
  const imgSrc = /^(?:https?:)?\/\//i.test(hostelImage)
    ? (hostelImage.startsWith('http') ? hostelImage : `https:${hostelImage}`)
    : buildMediaUrl(hostelImage);

  // Final guard: strip any accidental leading slash before a scheme
  const finalSrc = String(imgSrc).replace(/^\/+((?:https?:)?\/\/)/i, '$1');

  return (
    <div className="dashboard_card">
      <div className="image">
        <img 
          src={hostel.image ? finalSrc : '/images/hostel1.png'} 
          alt={hostel?.name || "Hostel"} 
          onError={(e) => {
            e.target.src = '/images/hostel1.png'; // Fallback image
          }}
        />
        <div className="hostel_location">
          <MapPin size={16} />
          {hostel?.campus?.campus || hostel?.campus || hostel?.location || "Campus Information"}
        </div>
      </div>

      <div className="hostel_details">
        <ul className="details_hostel">
          <li className="details_hostel_item">
            <strong><Building2 size={16} /> Hostel:</strong> {hostel?.name || "—"}
          </li>
          <li className="details_hostel_item">
            <strong><BarChart3 size={16} /> Status:</strong> {hostel?.status || "—"}
          </li>
          <li className="details_hostel_item">
            <strong><Users size={16} /> Gender Type:</strong> {hostel?.gender_type || "—"}
          </li>
          <li className="details_hostel_item">
            <strong><Star size={16} /> Rating:</strong> {hostel?.ratings || "—"}
          </li>
        </ul>

        <div className="grided-content">
          {additionalDetails.length > 0 && (
            <div className="additional_details">
              <h4><Sparkles size={20} /> General Amenities</h4>
              <ul>
                {additionalDetails.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default HostelCard;
