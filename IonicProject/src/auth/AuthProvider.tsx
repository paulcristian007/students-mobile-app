import React, {useCallback, useEffect, useReducer} from "react";
import {loginUser} from "./AuthApi";
import {Preferences} from "@capacitor/preferences";
import {ActionProps} from "../core/utils/utils";
import PropTypes from "prop-types";

export type LoginFn = (username?: string, password?: string) => Promise<any>;
export type LogoutFn = () => Promise<any>;

export const LOGIN_STARTED = "Login has started";
export const LOGIN_SUCCEEDED = "Login has succeeded";
export const LOGIN_FAILED = "Login has failed";
export const LOGOUT = "Logout";

interface AuthState {
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFn;
    logout?: LogoutFn;
    token: string;
    refreshEffect?: () => void
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

function reducer(state: AuthState, action: ActionProps): AuthState {
    switch (action.type) {
        case LOGIN_STARTED:
            return {...state, isAuthenticating: true}
        case LOGIN_SUCCEEDED: {
            console.log('hello world', action.payload.token);
            return {...state, isAuthenticating: false, isAuthenticated: true, token: action.payload.token}
        }
        case LOGIN_FAILED:
            return {...state, isAuthenticating: false}
        case LOGOUT:
            return {...state, token: '', isAuthenticated: false}
        default:
            return state;
    }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {authenticationError, isAuthenticated, isAuthenticating, token} = state;
    const login = useCallback<LoginFn>(loginCallback, []);
    const logout = useCallback<LogoutFn>(logoutCallback, []);
    const value = {authenticationError, isAuthenticated, isAuthenticating, login, logout, token, refreshEffect};

    useEffect(() => {
        refreshEffect();
    }, [token]);

    function refreshEffect()  {
        if (token === '' || !token) refreshToken();
         async function refreshToken() {
            const tokenValue = await Preferences.get({key: 'token'});
            if (tokenValue.value) {
                dispatch({type: LOGIN_SUCCEEDED, payload: {token: tokenValue.value}});
            }
        }
    }

    async function loginCallback(username?: string, password?: string) {
        try {
            dispatch({type: LOGIN_STARTED});
            const {token} = await loginUser(username, password);
            await Preferences.set({key: 'token', value: token});
            dispatch({type: LOGIN_SUCCEEDED, payload: {token}})
        }
        catch (error) {
            dispatch({type: LOGIN_FAILED, payload: {error}});
        }
    }

    async function logoutCallback() {
        await Preferences.remove({key: 'token'});
        const {keys} = await Preferences.keys();
        for (const key of keys)
            await Preferences.remove({key: key});
        dispatch({type: LOGOUT});
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}