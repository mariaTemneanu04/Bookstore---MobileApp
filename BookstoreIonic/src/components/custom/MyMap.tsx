import { GoogleMap } from '@capacitor/google-maps';
import { useEffect, useRef } from 'react';
import { mapsApiKey } from "../../utils/mapsApiKey";
import {getLogger} from "../../utils";

const log = getLogger('MyMap');

interface MyMapProps {
    lat: number;
    lng: number;
    onMapClick: (coords: { latitude: number; longitude: number }) => void;
}

const MyMap: React.FC<MyMapProps> = ({ lat, lng, onMapClick }) => {
    const mapRef = useRef<HTMLElement>(null);
    useEffect(myMapEffect, [mapRef.current])

    return (
        <div className="component-wrapper">
            <capacitor-google-map
                ref={mapRef}
                style={{
                    display: 'block',
                    width: '85%', // Set width to 85%
                    height: '45vh', // Set height to 85% of the viewport height
                    margin: '25px auto', // Center the map
                    borderRadius: '15px', // Add rounded corners
                }}
            ></capacitor-google-map>
        </div>
    );

    function myMapEffect() {
        let canceled = false;
        let googleMap: GoogleMap | null = null;
        let listOfMarkers: string[] = [];
        createMap();
        return () => {
            canceled = true;
            googleMap?.removeAllMapListeners();
        }

        async function createMap() {
            try {
                if (!mapRef.current) {
                    return;
                }

                googleMap = await GoogleMap.create({
                    id: 'my-phenomenal-map',
                    element: mapRef.current,
                    apiKey: mapsApiKey,
                    config: {
                        center: { lat, lng },
                        zoom: 14
                    }
                });
                console.log('my-phenomenal-map was successfully created!');
                const marker = await googleMap.addMarker({ coordinate: { lat, lng }, title: 'Current Location' });
                listOfMarkers.push(marker);

                await googleMap.setOnMapClickListener(async ({ latitude, longitude }) => {
                    console.log('map click event triggered - googleMap =', googleMap);

                    onMapClick({ latitude, longitude });
                    // change the marker position
                    if (googleMap && listOfMarkers.length > 0) {
                        googleMap?.removeMarkers(listOfMarkers);
                        listOfMarkers = [];
                        const newMarker = await googleMap?.addMarker({ coordinate: { lat: latitude, lng: longitude }, title: 'Selected Location' });
                        if (newMarker)
                            listOfMarkers.push(newMarker);
                    }
                });
                // put a marker on the map

            } catch (error) {
                log('createMap error', error);
            }
        }
    }
}


export default MyMap;
