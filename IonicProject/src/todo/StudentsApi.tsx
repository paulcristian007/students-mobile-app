import axios from "axios";
import {StudentProps} from "./StudentProps";
import {authConfig, baseUrl, withLogs} from "../core";
//import {authConfig, baseUrl, withLogs} from "../core";


const serverUrl = `http://${baseUrl}/student`
const socketUrl = `ws://${baseUrl}`

export const getStudents = (token: string, left: number, right: number): Promise<StudentProps[]> => {
    const params = {
        left: left,
        right: right
    }
    console.log(left, right, token);
    return withLogs(axios.get(serverUrl, {...authConfig(token), params}), 'Get students');
}

export const createStudent = (student: StudentProps, token: string): Promise<StudentProps> => {
    console.log('Student: ', student);
    console.log('Token: ', token);
    return withLogs(axios.post(serverUrl, student, authConfig(token)), 'create student');
}

export const editStudent = (student: StudentProps, token: string): Promise<StudentProps> => {
    return withLogs(axios.put(`${serverUrl}/${student._id}`, student, authConfig(token)), 'update student');
}

interface MessageData {
    event: string;
    payload: {
        student: StudentProps;
    };
}

let ws: WebSocket;
export const newWebSocket = (onMessage: (data: MessageData) => void, token: string) => {
    ws = new WebSocket(socketUrl);
    ws.onopen = () => {
        console.log('web socket onopen');
        const message = {
            type: 'authorization', // Replace with your specific message type
            payload: {
                token: token // Replace with the actual token value
            }
        };
        ws.send(JSON.stringify(message));
    };
    ws.onclose = () => {
        console.log('web socket onclose');
    };
    ws.onerror = error => {
        console.log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        console.log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}

export const sendToken = (token: string) => {
    ws.send(token);
}