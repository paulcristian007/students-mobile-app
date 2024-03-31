import {baseUrl, config, withLogs} from "../core";
import axios from "axios";

const authUrl = `http://${baseUrl}/auth`

export interface AuthProps {
    token: string;
}

export const loginUser = (username?: string, password?: string): Promise<AuthProps> => {
    console.log('login ', username, password);
    return withLogs(axios.post(`${authUrl}/login`, { username, password }, config), 'login');
}
