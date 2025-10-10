'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix the default marker icon issue using the type-safe "replacement" method.
const defaultIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;


interface VenueMapProps {
    center: [number, number];
    venueName: string;
}

const VenueMap: React.FC<VenueMapProps> = ({ center, venueName }) => {
    return (
        <MapContainer
            center={center}
            zoom={15}
            style={{ width: "100%", height: "100%", zIndex: 10 }}
            className="z-10"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={center}>
                <Popup>{venueName || "Event Venue"}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default VenueMap;