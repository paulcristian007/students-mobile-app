import {StudentProps} from "../../todo/StudentProps";
import React from "react";
import PropTypes from "prop-types";

export type SaveStudentFn = (student: StudentProps) => Promise<any>;
export type EditStudentFn = (student: StudentProps) => Promise<any>;
export type ScrollFn = (left: number, right: number) => Promise<any>
export interface StudentState {
    students?: StudentProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveStudent?: SaveStudentFn,
    saveSuccess: boolean,
    updateSuccess: boolean
    updating: boolean,
    updatingError?: Error | null,
    updateStudent?: EditStudentFn,
    getStudentsOffline?: () =>Promise<void>,
    status: string,
    leaveUpdatePage?: () => void,
    leaveSavePage?: () => void,
    fetchFromScroll?: ScrollFn,
    infiniteScrollDisabled: boolean
}

export const initialState: StudentState = {
    fetching: false,
    saving: false,
    updating: false,
    status: '',
    infiniteScrollDisabled: false,
    saveSuccess: false,
    updateSuccess: false
};
export const FETCH_STUDENTS_STARTED = "Started to fetch students";
export const FETCH_STUDENTS_SUCCEEDED = "Succeeded to fetch students"
export const FETCH_STUDENTS_FAILED = "Failed to fetch students"
export const SAVE_STUDENT_STARTED = "Started to save student";
export const SAVE_STUDENT_SUCCEEDED = "Succeeded to save student";
export const SAVE_STUDENT_FAILED = "Failed to save student"
export const UPDATE_STUDENT_STARTED = "Started to update students";
export const UPDATE_STUDENT_SUCCEEDED = "Succeeded to update students"
export const UPDATE_STUDENT_FAILED = "Failed to update student"
export const ONLINE = "Online";
export const OFFLINE = "Offline";
export const SCROLL = "scroll";
export const SCROLL_OVER = "scroll over";

export const SAVE_PAGE_EXIT = "The client has left the save page";
export const UPDATE_PAGE_EXIT = "The client has left the update page";
export const StudentContext = React.createContext<StudentState>(initialState);
export interface StudentProviderProps {
    children: PropTypes.ReactNodeLike,
}