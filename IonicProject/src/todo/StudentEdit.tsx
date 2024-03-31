import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {
    createAnimation,
    IonButton,
    IonContent, IonFab, IonFabButton, IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonLoading,
    IonPage,
    IonRow
} from "@ionic/react";
import {RouteComponentProps, useParams} from "react-router";
import {StudentContext,} from "../core/utils/studentProvider";
import {Preferences} from "@capacitor/preferences";
import {useCamera} from "../core/useCamera";
import {camera, constructOutline, paw} from "ionicons/icons";
import MyMap from "../core/MyMap";
import { Geolocation } from '@capacitor/geolocation';
import {LocationContext} from "./LocationProvider";
import type { Animation } from '@ionic/react';
import {containsDigits, isValidNumber, play, stop} from "../core/animations";




const StudentEdit : React.FC<RouteComponentProps> = ({history}) => {
    const { _id } = useParams<{ _id: string }>();
    const [name, setName] = useState('');
    const [profile, setProfile] = useState('');
    const [year, setYear] = useState('');
    const [photo, setPhoto] = useState<string | undefined>();

    const {students, updateSuccess, updating, updatingError, updateStudent, leaveUpdatePage} = useContext(StudentContext);
    const {lat, long, updateCoordinates} = useContext(LocationContext);
    const {getPhoto} = useCamera();
    const [defaultLat, setDefaultLat] = useState<number>();
    const [defaultLng, setDefaultLng] = useState<number>();

    const nameRef = useRef<HTMLIonInputElement | null>(null);
    const profileRef = useRef<HTMLIonInputElement | null>(null);
    const yearRef = useRef<HTMLIonInputElement | null>(null);

    const nameAnimation = useRef<Animation | null>(null);
    const profileAnimation = useRef<Animation | null>(null);
    const yearAnimation = useRef<Animation | null>(null);

    useEffect(makeAnimations, [nameAnimation, nameRef, profileAnimation, profileRef, yearAnimation, yearRef]);



    function makeAnimations() {
        console.log('make animations');
        makeAnimation(nameAnimation, nameRef);
        makeAnimation(profileAnimation, profileRef);
        makeAnimation(yearAnimation, yearRef);
        function makeAnimation(animation: any, ref: any) {
            if (animation.current !== null) return;
            animation.current = createAnimation()
                .addElement(ref.current!)
                .fromTo('opacity', '1', '0.2')
                .fromTo('color', 'red', 'red')
                .duration(1500)
                .iterations(Infinity);
        }
    }

    function loadCoordsEffect() {
        loadCoords().then((coords) => {
            coords.latitude && setDefaultLat(coords.latitude);
            coords.longitude && setDefaultLng(coords.longitude);
        });
        async function loadCoords() {
            const {coords} = await Geolocation.getCurrentPosition();
            return coords;
        }
    }

    async function takePhoto() {
        const { base64String } = await getPhoto();
        setPhoto(base64String);
    }


    function setEditProps() {
        const realStudent = students?.find(it => it._id === _id);
        realStudent && setName(realStudent.name);
        realStudent && setProfile(realStudent.profile);
        realStudent && setYear(realStudent.year.toString());
        realStudent && realStudent.photo && setPhoto(realStudent.photo);
        realStudent && updateCoordinates && updateCoordinates(realStudent.lat, realStudent.lng);

        getPropsFromStorage();
        async function getPropsFromStorage() {
            const {value} = await Preferences.get({key: _id.toString()});
            if (!value) return;
            const {event, studentProps} = JSON.parse(value || '');
            if (event !== 'updated') return;
            setName(studentProps.name);
            setProfile(studentProps.profile);
            setYear(studentProps.year);
        }
    }
    const handleUpdateClicked = useCallback( () => {
        let ok = true;
        if (containsDigits(name)) {
            ok = false;
            play(nameAnimation);
        }
        if (containsDigits(profile)) {
            ok = false;
            play(profileAnimation);
        }
        if (!isValidNumber(year)) {
            ok = false;
            play(yearAnimation);
        }

        if (!ok) return;
        const updatedStudent = {_id: _id, name : name, profile: profile, year: parseInt(year), photo: photo,
            lat: lat, lng: long};
        updateStudent && updateStudent(updatedStudent).then(() => {
            setName('');
            setProfile('');
            setYear('');
            updateCoordinates && updateCoordinates(undefined, undefined);
        });

    }, [name, profile, year, history, photo, lat, long, play, updatingError, nameAnimation, profileAnimation, yearAnimation, updateStudent]);


    useEffect(() => {
        if (updateSuccess) history.goBack();
    }, [updateSuccess]);


    useEffect(() => {
        setEditProps();
        loadCoordsEffect();
        return () => {
            leaveUpdatePage && leaveUpdatePage();
            updateCoordinates && updateCoordinates(undefined, undefined);

        }
    }, []);

    return (
        <IonPage>
            <IonContent>
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={() => takePhoto()}>
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
                <IonRow>
                    <IonInput value={name} ref={nameRef} onIonChange={(e) =>
                        setName(e.detail.value || '')} onFocus = {() => stop(nameAnimation)}>
                    </IonInput>
                    <IonInput value={profile} ref={profileRef} onIonChange={(e) =>
                        setProfile(e.detail.value || '')} onFocus = {() => stop(profileAnimation)}>
                    </IonInput>
                    <IonInput value={year} ref={yearRef} onIonChange={(e) =>
                        setYear(e.detail.value || '')} onFocus = {() => stop(yearAnimation)}>
                    </IonInput>
                    {photo && <IonImg src={`data:image/jpeg;base64,${photo}`} style={{height: "100px"}}/>}
                    {!photo && <IonImg src="src/core/no-face.png" style={{height: "100px"}}/>}
                </IonRow>
                {lat && long && <MyMap lat={lat} lng={long}/>}
                {!lat && !long && defaultLat && defaultLng && <MyMap lat={defaultLat} lng={defaultLng}/>}

                <IonItem>
                    <IonButton onClick={handleUpdateClicked}>Update Student</IonButton>
                </IonItem>

                {updatingError && (
                    <IonItem>{updatingError.message} The student will be updated when the server comes back</IonItem>
                )}
                <IonLoading isOpen={updating} message="Updating the student"/>
            </IonContent>
        </IonPage>
    );
};

export default StudentEdit;


