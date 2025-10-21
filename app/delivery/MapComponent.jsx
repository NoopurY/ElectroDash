"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icons
const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropoffIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const deliveryIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapComponent({ selectedOrder }) {
  // Default center (Udaipur, Rajasthan area)
  const defaultCenter = [23.8103, 91.2925];
  const defaultZoom = 13;

  // Current delivery partner position (simulated)
  const deliveryPartnerPosition = [23.815, 91.295];

  return (
    <MapContainer
      center={selectedOrder ? selectedOrder.pickupCoords : defaultCenter}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Delivery Partner Current Location */}
      <Marker position={deliveryPartnerPosition} icon={deliveryIcon}>
        <Popup>
          <div className="text-center">
            <strong className="text-blue-600">Your Location</strong>
            <p className="text-xs text-gray-600">Delivery Partner</p>
          </div>
        </Popup>
      </Marker>

      {/* Selected Order Markers and Route */}
      {selectedOrder && (
        <>
          {/* Pickup Location */}
          <Marker position={selectedOrder.pickupCoords} icon={pickupIcon}>
            <Popup>
              <div>
                <strong className="text-green-600">Pickup Location</strong>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedOrder.pickup}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Order: {selectedOrder.id}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Dropoff Location */}
          <Marker position={selectedOrder.dropoffCoords} icon={dropoffIcon}>
            <Popup>
              <div>
                <strong className="text-red-600">Drop-off Location</strong>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedOrder.dropoff}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Customer: {selectedOrder.customer}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Route Line from Pickup to Dropoff */}
          <Polyline
            positions={[
              selectedOrder.pickupCoords,
              selectedOrder.dropoffCoords,
            ]}
            color="#5A8DEE"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />

          {/* Route Line from Delivery Partner to Pickup (if order is accepted) */}
          {selectedOrder.status === "accepted" && (
            <Polyline
              positions={[deliveryPartnerPosition, selectedOrder.pickupCoords]}
              color="#40E0D0"
              weight={3}
              opacity={0.7}
            />
          )}

          {/* Route Line from Delivery Partner to Dropoff (if order is picked) */}
          {selectedOrder.status === "picked" && (
            <Polyline
              positions={[deliveryPartnerPosition, selectedOrder.dropoffCoords]}
              color="#40E0D0"
              weight={3}
              opacity={0.7}
            />
          )}
        </>
      )}
    </MapContainer>
  );
}
