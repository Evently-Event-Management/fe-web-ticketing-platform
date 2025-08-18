// 'use client';
//
// import React, {useEffect, useState} from 'react';
// import {GoogleMap, useJsApiLoader, Marker} from '@react-google-maps/api';
// import {apiFetch} from '@/lib/api';
// import keycloak from '@/lib/keycloak';
// import {Button} from '@/components/ui/button';
// import {Skeleton} from '@/components/ui/skeleton';
//
// // Define a type for the expected API response
// type ApiResponse = {
//     message: string;
//     // Add other properties you expect from the backend
//     uid?: string;
//     username?: string;
//     scope?: string;
// };
//
// const MAP_CONTAINER_STYLE = {
//     width: '100%',
//     height: '500px',
//     borderRadius: 'var(--radius)',
// };
//
// // Default center for the map (Colombo, Sri Lanka)
// const DEFAULT_MAP_CENTER = {
//     lat: 6.9271,
//     lng: 79.8612,
// };
//
// const LIBRARIES: ("places")[] = ['places'];
//
// const Page = () => {
//     // Initialize state to null or an object with a default message
//     const [data, setData] = useState<ApiResponse | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(DEFAULT_MAP_CENTER);
//     const [showMap, setShowMap] = useState(false);
//     const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
//
//     const {isLoaded} = useJsApiLoader({
//         id: 'google-map-script',
//         googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
//         libraries: LIBRARIES,
//     });
//
//     useEffect(() => {
//         if (!keycloak.authenticated) {
//             setError('User not authenticated. Please log in.');
//             return;
//         }
//
//         const fetchData = async () => {
//             try {
//                 const response = await apiFetch<ApiResponse>('/event-seating/v1/protected/hello');
//                 setData(response);
//             } catch (err) {
//                 console.error('Fetch error:', err);
//                 setError('Failed to connect to the API. Make sure the backend is running and accessible.');
//             }
//         };
//
//         fetchData();
//     }, []);
//
//     const handleMapClick = (event: google.maps.MapMouseEvent) => {
//         if (event.latLng) {
//             const newPos = {lat: event.latLng.lat(), lng: event.latLng.lng()};
//             setMarkerPosition(newPos);
//             console.log('Map clicked at:', newPos);
//         }
//     };
//
//     // Render different UI based on the state
//     let apiContent;
//     if (error) {
//         apiContent = <p style={{color: 'red'}}>{error}</p>;
//     } else if (!data) {
//         apiContent = <p>Loading API data...</p>;
//     } else {
//         apiContent = <p>{data.message}</p>;
//     }
//
//     return (
//         <div className="p-6 space-y-6">
//             <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
//             {apiContent}
//
//             <div className="space-y-4">
//                 <h2 className="text-xl font-semibold">Google Maps Test</h2>
//                 <p className="text-sm text-muted-foreground">
//                     This is a test implementation of Google Maps to verify marker dragging functionality.
//                 </p>
//
//                 <Button onClick={() => setShowMap(!showMap)}>
//                     {showMap ? 'Hide Map' : 'Show Map'}
//                 </Button>
//
//                 {showMap && (
//                     <div className="border rounded-lg p-4 bg-card">
//                         <div className="mb-4">
//                             <p className="font-medium">Current Marker Position:</p>
//                             <p className="text-sm">Latitude: {markerPosition.lat.toFixed(6)}</p>
//                             <p className="text-sm">Longitude: {markerPosition.lng.toFixed(6)}</p>
//                         </div>
//
//                         <div className="h-[500px] relative">
//                             {isLoaded ? (
//                                 <GoogleMap
//                                     mapContainerStyle={MAP_CONTAINER_STYLE}
//                                     center={mapCenter} // stays constant unless you explicitly update
//                                     zoom={15}
//                                     onClick={(e) => {
//                                         console.log('Map clicked:', e);
//                                         if (e.latLng) {
//                                             const newPos = e.latLng.toJSON();
//                                             setMarkerPosition(newPos);
//                                             setMapCenter(newPos); // optional: re-center on click
//                                             console.log('Map clicked at:', newPos);
//                                         }
//                                     }}
//                                 >
//                                     <Marker
//                                         key="main-marker" // ensures the event listener is bound once
//                                         position={markerPosition}
//                                         draggable={true} // explicitly set true, avoids JSX boolean quirk
//                                         onDragEnd={(e) => {
//                                             console.log('Marker drag ended:', e);
//                                             const newPos = e.latLng?.toJSON();
//                                             if (!newPos) return;
//                                             setMarkerPosition(newPos);
//                                             console.log('Marker dragged to:', newPos);
//                                         }}
//                                     />
//                                 </GoogleMap>
//                             ) : (
//                                 <Skeleton className="w-full h-full"/>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default Page;

import React from 'react';

const Page = () => {
    return (
        <div>
            Hello
        </div>
    );
};

export default Page;