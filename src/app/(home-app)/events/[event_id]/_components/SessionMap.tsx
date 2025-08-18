'use client'

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Skeleton } from "@/components/ui/skeleton";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons (Leaflet requires this in React/Next.js setups)
const defaultIcon = new L.Icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export const SessionMap = ({ location }: { location: { coordinates: [number, number] } }) => {
    // Handle SSR - don't render the map during server-side rendering
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <Skeleton className="h-64 w-full rounded-md" />;
    }

    // Convert coordinates to Leaflet format [lat, lng]
    // GeoJSON uses [longitude, latitude], but Leaflet uses [latitude, longitude]
    const position: [number, number] = [location.coordinates[1], location.coordinates[0]];

    return (
        <div className="h-64 w-full rounded-md overflow-hidden z-0">
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>Event Location</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};
