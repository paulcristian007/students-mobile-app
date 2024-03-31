import React, {useCallback, useContext, useEffect, useReducer} from "react";
import {StudentProps} from "./StudentProps";
import {createStudent, getStudents, editStudent, newWebSocket} from "./StudentsApi";
import {ActionProps} from "../core/utils/utils";
import {
    EditStudentFn,
    FETCH_STUDENTS_FAILED,
    FETCH_STUDENTS_STARTED,
    FETCH_STUDENTS_SUCCEEDED, initialState,
    SAVE_STUDENT_FAILED,
    SAVE_STUDENT_STARTED,
    SAVE_STUDENT_SUCCEEDED,
    SaveStudentFn,
    StudentContext,
    StudentProviderProps,
    StudentState,
    UPDATE_STUDENT_FAILED,
    UPDATE_STUDENT_STARTED,
    UPDATE_STUDENT_SUCCEEDED,
    ONLINE,
    OFFLINE, SAVE_PAGE_EXIT, UPDATE_PAGE_EXIT, SCROLL, ScrollFn, SCROLL_OVER
} from "../core/utils/studentProvider";
import {Preferences} from "@capacitor/preferences";
import {AuthContext} from "../auth/AuthProvider";
import {Network} from "@capacitor/network";
import {PAGE_SIZE} from "../core";
import {useFilesystem} from "../core/useFilesytem";

function reducer(state: StudentState, action: ActionProps): StudentState {
    switch (action.type) {
        case FETCH_STUDENTS_STARTED:
            return {...state, fetching: true};
        case FETCH_STUDENTS_FAILED:
            return {...state, fetching: false, fetchingError: action.payload.error};
        case FETCH_STUDENTS_SUCCEEDED:
            return {...state, fetching: false, students: action.payload.students};
        case SAVE_STUDENT_STARTED:
            return {...state, saving: true, saveSuccess: false};
        case SAVE_STUDENT_FAILED: {
            return {...state, saving: false, savingError: action.payload.error};
        }
        case SAVE_STUDENT_SUCCEEDED: {
            const students = [...state.students || []];
            if (students.findIndex((student) => student._id == action.payload.student._id) == -1)
                students.push(action.payload.student);
            return {...state, saving: false, students, saveSuccess: true}
        }
        case UPDATE_STUDENT_STARTED:
            return {...state, updating: true, updateSuccess: false};
        case UPDATE_STUDENT_FAILED:
            return {...state, updating: false, updatingError: action.payload.error};
        case UPDATE_STUDENT_SUCCEEDED: {
            const students = [...(state.students || [])];
            const pos = students.findIndex((student) => student._id == action.payload.student._id);
            students[pos] = action.payload.student;
            return {...state, students, updating: false, updateSuccess: true}
        }

        case SAVE_PAGE_EXIT:
            return {...state, savingError: null, saveSuccess: false}
        case UPDATE_PAGE_EXIT:
            return {...state, updatingError: null, updateSuccess: false}
        case ONLINE:
            return {...state, status: "Online"}
        case OFFLINE:
            return {...state, status: "Offline"}
        case SCROLL:
            let newStudents = action.payload.students;
            if (state.students)
                newStudents = [...state.students, ...action.payload.students];
            return {...state, students: newStudents};
        case SCROLL_OVER:
            return {...state, infiniteScrollDisabled: true}
        default:
            return state;
    }
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
    const { token , refreshEffect} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {students, fetching, fetchingError,
        saving, saveSuccess, savingError,
        updating,updatingError, updateSuccess,
        infiniteScrollDisabled, status} = state;
    const saveStudent = useCallback<SaveStudentFn>(saveStudentCallback, [token]);
    const updateStudent = useCallback<EditStudentFn>(updateStudentCallback, [token]);
    const leaveSavePage = useCallback(leaveSavePageCallback, []);
    const leaveUpdatePage = useCallback(leaveUpdatePageCallback, []);
    const fetchFromScroll = useCallback<ScrollFn>(scrollCallback, [token]);

    const value = {students, fetching, fetchingError, saving, savingError, saveStudent, saveSuccess, infiniteScrollDisabled,
        updating, updatingError, updateStudent, updateSuccess, leaveUpdatePage, leaveSavePage, fetchFromScroll, status};
    const {writeFile} = useFilesystem();
    useEffect(() => {
        const networkStatusListener = Network.addListener('networkStatusChange', (state) => {
            if (state.connected)
                dispatch({type: ONLINE});
            else dispatch({type: OFFLINE});
        });

        return () => {
            networkStatusListener.remove();
        };
    }, []);
    useEffect(() => {
        getStatusEffect();
    }, []);

    async function getStatusEffect() {
        const networkState = await Network.getStatus();
        if (networkState.connected) dispatch({type: ONLINE});
        else dispatch({type: OFFLINE});
    }

    useEffect(wsEffect, [token]);

    useEffect(handleStatusEffect, [status]);

    useEffect(() => {
        fetchStudents();
    }, [token]);

    function handleStatusEffect() {
        if (status === "Online") handleOnlineSwitch();
        else if (status === "Offline") handleOfflineSwitch();
        async function handleOnlineSwitch() {
            try {
                const {keys} = await Preferences.keys();
                for (const key of keys)
                    if (key !== 'token') {
                        const {value} = await Preferences.get({key: key});
                        const {event, studentProps} = JSON.parse(value || '');
                        if (event && event === 'created') {
                            await Preferences.remove({key: key});
                            saveStudent && await saveStudent(studentProps);
                        }
                        if (event && event === 'updated') {
                            await Preferences.remove({key: key});
                            updateStudent && await updateStudent(studentProps);
                        }
                    }
            } catch (error) {
                console.error(error);
            }
        }

        async function handleOfflineSwitch() {
            const {keys} = await Preferences.keys();
            let offlineStudents: StudentProps[] = [];
            for (const key of keys)
                if (key !== 'token') {
                    const {value} = await Preferences.get({key: key});
                    const {event, studentProps} = JSON.parse(value || '');
                    if (event && event === 'none') offlineStudents.push(studentProps);
                }
            dispatch({type: FETCH_STUDENTS_SUCCEEDED, payload: {students: offlineStudents}});
        }
    }

    const fetchStudents = async () => {
        console.log('start fetch');
        if (!token || token === '') return;
        try {
            dispatch({type: FETCH_STUDENTS_STARTED});
            const students = await getStudents(token, 0, PAGE_SIZE);
            console.log(students);
            for (let student of students)
                await copyStudentLocally(student);
            dispatch({type: FETCH_STUDENTS_SUCCEEDED, payload: {students}});
        }
        catch (error) {
            dispatch({type: FETCH_STUDENTS_FAILED, payload: {error}});
        }
    }

    async function scrollCallback(left: number, right: number) {
        const students = await getStudents(token, left, right);
        for (const student of students)
            await copyStudentLocally(student);
        if (students.length < PAGE_SIZE) dispatch({type: SCROLL_OVER});
        dispatch({type: SCROLL, payload: {students}});
    }

    function wsEffect() {
        let canceled = false;
        if (token === '') return;
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const { event, payload: { student }} = message;
            if (event === 'created') {
                dispatch({type: SAVE_STUDENT_SUCCEEDED, payload: {student}});
            }
            if (event === 'updated') {
                dispatch({type: UPDATE_STUDENT_SUCCEEDED, payload: {student}});
                console.log({student});
            }
        }, token);
        return () => {
            canceled = true;
            closeWebSocket();
        }
    }

    async function saveStudentCallback(student: StudentProps) {
        try {
            dispatch({type: SAVE_STUDENT_STARTED});
            if (token === '' || !token) refreshEffect && refreshEffect();

            const newStudent = await createStudent(student, token);
            await copyStudentLocally(newStudent);
            dispatch({type: SAVE_STUDENT_SUCCEEDED, payload: {student: newStudent}});
        }
        catch (error) {
            await saveItemLocally(student);
            dispatch({type: SAVE_STUDENT_FAILED, payload: {error}});
        }
    }

    async function updateStudentCallback(student: StudentProps) {
        try {
            dispatch({type: UPDATE_STUDENT_STARTED});
            const updatedStudent = await editStudent(student, token);
            await copyStudentLocally(updatedStudent);
            dispatch({type: UPDATE_STUDENT_SUCCEEDED, payload: {student: updatedStudent}});
        }
        catch (error) {
            await updateItemLocally(student);
            dispatch({type: UPDATE_STUDENT_FAILED, payload: {error}});
        }
    }

    async function generateLocalStorageId() {
        const {keys} = await Preferences.keys();
        let max = 0;
        for (const key of keys)
            try {
                const keyNo = Number(key);
                if (keyNo > max) max = keyNo;
            }
            catch(error) {

            }
        return max + 1;
    }

    async function saveItemLocally(student: StudentProps) {
        const id = await generateLocalStorageId();
        await Preferences.set({key: id.toString(), value: JSON.stringify({event: 'created', studentProps: student})});
    }

    async function updateItemLocally(student: StudentProps) {
        await Preferences.set({key: student._id || '', value: JSON.stringify({event: 'updated', studentProps: student})});
    }

    async function copyStudentLocally(student: StudentProps) {
        const filepath = student._id + '.jpeg';
        const data = student.photo;
        if (data)
            await writeFile(filepath, data);
        await Preferences.set({key: student._id || '', value: JSON.stringify({event: 'none', studentProps: student})});
    }


    function leaveSavePageCallback() {
        dispatch({type: SAVE_PAGE_EXIT});
    }
    function leaveUpdatePageCallback() {
        dispatch({type: UPDATE_PAGE_EXIT});
    }

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
}
