import { GoogleMap } from '@capacitor/google-maps';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {mapsApiKey} from "./utils/utils";
import {LocationContext} from "../todo/LocationProvider";

interface MyMapProps {
    lat: number;
    lng: number;
}

const MyMap: React.FC<MyMapProps> = ({ lat, lng }) => {
    const mapRef = useRef<HTMLElement>(null);
    const {updateCoordinates} = useContext(LocationContext);
    useEffect(myMapEffect, [mapRef.current]);

    function myMapEffect() {
        let canceled = false;
        let googleMap: GoogleMap | null = null;
        createMap();
        return () => {
            canceled = true;
            googleMap?.removeAllMapListeners();
        }
        async function createMap() {
            if (!mapRef.current) {
                return;
            }
            googleMap = await GoogleMap.create({
                id: 'my-cool-map',
                element: mapRef.current,
                apiKey: mapsApiKey,
                config: {
                    center: { lat: lat, lng: lng },
                    zoom: 8
                }
            });
            console.log('gm created');
            let myLocationMarkerId = await googleMap?.addMarker({ coordinate: { lat, lng }});
            await googleMap?.setOnMapClickListener(async ({latitude, longitude}) => {
                await googleMap?.removeMarker(myLocationMarkerId);
                if (googleMap)
                    myLocationMarkerId = await googleMap.addMarker({coordinate: {lat: lat, lng: lng}});
                updateCoordinates && updateCoordinates(latitude, longitude);
            });
        }
    }


    return (
        <div className="component-wrapper">
            <capacitor-google-map ref={mapRef} style={{
                display: 'block',
                width: 300,
                height: 400
            }}></capacitor-google-map>
        </div>
    );
}

export default MyMap;
