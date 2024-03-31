import React, {useState} from "react";
import PropTypes from "prop-types";

interface LocationState {
    lat?: number,
    long?: number,
    updateCoordinates?: (lat: number | undefined, long: number | undefined) => void
}

const initialState: LocationState = {
}
export const LocationContext = React.createContext<LocationState>(initialState);
export interface LocationProviderProps {
    children: PropTypes.ReactNodeLike,
}
export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
    const [location, setLocation] = useState<LocationState>(initialState);
    const {lat, long} = location;
    const value = {lat, long, updateCoordinates};


    function updateCoordinates(lat: number | undefined, long: number | undefined)  {
        setLocation({...location, lat: lat, long: long});
    }
    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}