import React, {useCallback, useContext, useState} from "react";
import {Redirect, Route} from "react-router-dom";
import {AuthContext} from "./AuthProvider";


export interface PrivateRouteProps {
    component: any,
    path: string,
    exact?: boolean
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
    const { isAuthenticated } = useContext(AuthContext);
    return (
        <Route {...rest} render={props => {
            if (isAuthenticated) {
                return <Component {...props} />;
            }
            return <Redirect to={{ pathname: '/login' }}/>
        }}/>
    );
}