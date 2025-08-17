import * as React from 'react';
import {useState, useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import {CreateEventFormData} from '@/lib/validators/event';
import {toast} from 'sonner';
import {MapContainer, TileLayer, Marker, useMapEvents} from 'react-leaflet';
import L, {LatLngLiteral} from 'leaflet';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Checkbox} from '@/components/ui/checkbox';
import {Skeleton} from '@/components/ui/skeleton';
import {SessionType} from "@/lib/validators/salesStartRuleType";

import 'leaflet/dist/leaflet.css';

// Default center for the map (Colombo, Sri Lanka)
const DEFAULT_MAP_CENTER: LatLngLiteral = {
    lat: 6.9271,
    lng: 79.8612,
};

// Fix for default Leaflet marker icons
// Using proper typing for the Leaflet Icon prototype
interface IconDefaultPrototype extends L.Icon.Default {
    _getIconUrl?: unknown;
}

delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

// Small helper to handle map clicks
function LocationMarker({setMarkerPosition}: { setMarkerPosition: (pos: LatLngLiteral) => void }) {
    useMapEvents({
        click(e) {
            setMarkerPosition(e.latlng);
        }
    });
    return null;
}

export function LocationConfigDialog({index, open, setOpenAction}: {
    index: number;
    open: boolean;
    setOpenAction: (open: boolean) => void
}) {
    const {getValues, setValue} = useFormContext<CreateEventFormData>();

    // Local form state
    const [localFormState, setLocalFormState] = useState({
        sessionType: SessionType.PHYSICAL,
        venueDetails: {
            name: '',
            address: '',
            onlineLink: '',
            latitude: DEFAULT_MAP_CENTER.lat,
            longitude: DEFAULT_MAP_CENTER.lng,
        }
    });
    const [applyToAll, setApplyToAll] = useState(false);
    const [localErrors, setLocalErrors] = useState<{
        venueName?: string;
        onlineLink?: string;
    }>({});

    const [markerPosition, setMarkerPosition] = useState<LatLngLiteral>(DEFAULT_MAP_CENTER);

    // Snapshot form values when dialog opens
    useEffect(() => {
        if (open) {
            const sessionData = getValues(`sessions.${index}`);
            setLocalFormState({
                sessionType: sessionData.sessionType || SessionType.PHYSICAL,
                venueDetails: {
                    name: sessionData.venueDetails?.name || '',
                    address: sessionData.venueDetails?.address || '',
                    onlineLink: sessionData.venueDetails?.onlineLink || '',
                    latitude: sessionData.venueDetails?.latitude ?? DEFAULT_MAP_CENTER.lat,
                    longitude: sessionData.venueDetails?.longitude ?? DEFAULT_MAP_CENTER.lng,
                }
            });

            setMarkerPosition({
                lat: sessionData.venueDetails?.latitude ?? DEFAULT_MAP_CENTER.lat,
                lng: sessionData.venueDetails?.longitude ?? DEFAULT_MAP_CENTER.lng
            });

            setLocalErrors({});
        }
    }, [open, getValues, index]);

    // Keep marker synced with form state
    useEffect(() => {
        if (localFormState.sessionType === SessionType.PHYSICAL) {
            setMarkerPosition({
                lat: localFormState.venueDetails.latitude ?? DEFAULT_MAP_CENTER.lat,
                lng: localFormState.venueDetails.longitude ?? DEFAULT_MAP_CENTER.lng
            });
        }
    }, [
        localFormState.venueDetails.latitude,
        localFormState.venueDetails.longitude,
        localFormState.sessionType
    ]);

    // Local validation
    const validateLocalState = () => {
        const errors: { venueName?: string; onlineLink?: string } = {};

        if (localFormState.sessionType === SessionType.PHYSICAL && !localFormState.venueDetails.name) {
            errors.venueName = "Venue name is required";
        }

        if (localFormState.sessionType === SessionType.ONLINE) {
            if (!localFormState.venueDetails.onlineLink) {
                errors.onlineLink = "Online link is required";
            } else if (!/^https?:\/\/.+/.test(localFormState.venueDetails.onlineLink)) {
                errors.onlineLink = "Must be a valid URL";
            }
        }

        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        const isValid = validateLocalState();
        if (!isValid) return;

        setValue(`sessions.${index}.sessionType`, localFormState.sessionType, {shouldValidate: true});

        if (localFormState.sessionType === SessionType.PHYSICAL) {
            setValue(`sessions.${index}.venueDetails`, {
                name: localFormState.venueDetails.name,
                address: localFormState.venueDetails.address,
                latitude: localFormState.venueDetails.latitude,
                longitude: localFormState.venueDetails.longitude
            }, {shouldValidate: true});
        } else {
            setValue(`sessions.${index}.venueDetails`, {
                onlineLink: localFormState.venueDetails.onlineLink
            }, {shouldValidate: true});
        }

        setValue(`sessions.${index}.layoutData`, {name: null, layout: {blocks: []}}, {shouldValidate: true});

        if (applyToAll) {
            const allSessions = getValues('sessions');
            allSessions.forEach((_, i) => {
                if (i === index) return;

                setValue(`sessions.${i}.sessionType`, localFormState.sessionType, {shouldValidate: true});

                if (localFormState.sessionType === SessionType.PHYSICAL) {
                    setValue(`sessions.${i}.venueDetails`, {
                        name: localFormState.venueDetails.name,
                        address: localFormState.venueDetails.address,
                        latitude: localFormState.venueDetails.latitude,
                        longitude: localFormState.venueDetails.longitude
                    }, {shouldValidate: true});
                } else {
                    setValue(`sessions.${i}.venueDetails`, {
                        onlineLink: localFormState.venueDetails.onlineLink
                    }, {shouldValidate: true});
                }

                setValue(`sessions.${i}.layoutData`, {name: null, layout: {blocks: []}}, {shouldValidate: true});
            });
            toast.success("Location details applied to all sessions.");
        }

        setOpenAction(false);
    };

    const handleInputChange = (field: string, value: string | number) => {
        setLocalFormState(prev => ({
            ...prev,
            venueDetails: {
                ...prev.venueDetails,
                [field]: value
            }
        }));
    };

    const handleSessionTypeChange = (type: SessionType) => {
        setLocalFormState(prev => ({
            ...prev,
            sessionType: type
        }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpenAction}>
            <DialogContent className="sm:max-w-6xl p-0 grid grid-rows-[auto_1fr_auto] max-h-[90vh]">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Configure Location for Session {index + 1}</DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto">
                    <Tabs
                        defaultValue={localFormState.sessionType === SessionType.ONLINE ? "online" : "physical"}
                        onValueChange={(value) => {
                            handleSessionTypeChange(value === 'online' ? SessionType.ONLINE : SessionType.PHYSICAL);
                        }}
                        className="w-full"
                    >
                        <TabsList className="mx-6 mt-4">
                            <TabsTrigger value="physical">Physical</TabsTrigger>
                            <TabsTrigger value="online">Online</TabsTrigger>
                        </TabsList>
                        <TabsContent value="physical" className="px-4 py-0">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {/* Left Side */}
                                <div className="space-y-4 p-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="venue-name">Venue Name</Label>
                                        <Input
                                            id="venue-name"
                                            placeholder="e.g., Grand Hall"
                                            value={localFormState.venueDetails.name || ''}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                        />
                                        {localErrors.venueName && (
                                            <p className="text-sm text-destructive">{localErrors.venueName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="venue-address">Address</Label>
                                        <Input
                                            id="venue-address"
                                            placeholder="Street, City"
                                            value={localFormState.venueDetails.address || ''}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                        />
                                    </div>
                                    <div className="text-sm text-muted-foreground pt-4">
                                        <p>Use the map to locate the venue precisely. You can:</p>
                                        <ul className="list-disc pl-5 mt-2 space-y-1">
                                            <li>Click on the map to place a marker.</li>
                                            <li>Drag the marker to fine-tune the location.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Right Side - Map */}
                                <div className="flex flex-col md:h-full gap-4">
                                    {open ? (
                                        <MapContainer
                                            center={markerPosition}
                                            zoom={15}
                                            style={{width: '100%', height: '400px', borderRadius: 'var(--radius)'}}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker
                                                position={markerPosition}
                                                draggable={true}
                                                eventHandlers={{
                                                    dragend: (e) => {
                                                        const marker = e.target as L.Marker;
                                                        const pos = marker.getLatLng();
                                                        setMarkerPosition(pos);
                                                        setLocalFormState(prev => ({
                                                            ...prev,
                                                            venueDetails: {
                                                                ...prev.venueDetails,
                                                                latitude: pos.lat,
                                                                longitude: pos.lng
                                                            }
                                                        }));
                                                    }
                                                }}
                                            />
                                            <LocationMarker setMarkerPosition={(pos) => {
                                                setMarkerPosition(pos);
                                                setLocalFormState(prev => ({
                                                    ...prev,
                                                    venueDetails: {
                                                        ...prev.venueDetails,
                                                        latitude: pos.lat,
                                                        longitude: pos.lng
                                                    }
                                                }));
                                            }}/>
                                        </MapContainer>
                                    ) : <Skeleton className="h-full w-full"/>}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="online" className="p-6">
                            <div className="space-y-2">
                                <Label htmlFor="online-link">Online Link</Label>
                                <Input
                                    id="online-link"
                                    placeholder="https://zoom.us/..."
                                    value={localFormState.venueDetails.onlineLink || ''}
                                    onChange={(e) => handleInputChange('onlineLink', e.target.value)}
                                />
                                {localErrors.onlineLink && (
                                    <p className="text-sm text-destructive">{localErrors.onlineLink}</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="justify-between p-6 border-t">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="apply-to-all" checked={applyToAll}
                                  onCheckedChange={(checked) => setApplyToAll(checked === true)}/>
                        <Label htmlFor="apply-to-all">Apply to all sessions</Label>
                    </div>
                    <Button type="button" onClick={handleSave}>Save Location</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
