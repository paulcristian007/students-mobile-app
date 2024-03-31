import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {
    Animation, createAnimation,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton, IonIcon, IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonPage
} from "@ionic/react";
import {RouteComponentProps} from "react-router";
import {StudentContext} from "../core/utils/studentProvider";
import {camera} from "ionicons/icons";
import {useCamera} from "../core/useCamera";
import {StudentProps} from "./StudentProps";
import {containsDigits, isValidNumber, play, stop} from "../core/animations";

const StudentSave : React.FC<RouteComponentProps> = ({history}) => {
    //const history = useHistory();
    const {saving, savingError,saveSuccess, saveStudent, leaveSavePage} = useContext(StudentContext);
    const [name, setName] = useState('');
    const [profile, setProfile] = useState('');
    const [year, setYear] = useState('');
    const [photo, setPhoto] = useState<string | undefined>();
    const nameRef = useRef<HTMLIonInputElement | null>(null);
    const profileRef = useRef<HTMLIonInputElement | null>(null);
    const yearRef = useRef<HTMLIonInputElement | null>(null);

    const nameAnimation = useRef<Animation | null>(null);
    const profileAnimation = useRef<Animation | null>(null);
    const yearAnimation = useRef<Animation | null>(null);
    const {getPhoto} = useCamera();
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
    async function takePhoto() {
        const { base64String } = await getPhoto();
        setPhoto(base64String);
    }
    const handleSaveClicked = useCallback( () => {
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
        const student: StudentProps = {_id: undefined, name : name, profile: profile, year: parseInt(year)};
        if (photo)
            student.photo = photo;
        saveStudent && saveStudent(student).then(() => {
            setName('');
            setProfile('');
            setYear('');
        });
    }, [name, profile, year, history, photo, saveStudent]);

    useEffect(() => {
        if (saveSuccess) history.goBack();
    }, [saveSuccess]);

    useEffect(() => {
        return() => {
            leaveSavePage && leaveSavePage();
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
                    <IonList>

                        <IonItem>
                            <IonLabel className="ion-text-center">Name</IonLabel>
                            <IonInput ref={nameRef} value={name} onIonChange={(e) =>
                                setName(e.detail.value || '')} onFocus={() => stop(nameAnimation)}></IonInput>
                        </IonItem>
                        <IonItem>
                            <IonLabel className="ion-text-center">Profile</IonLabel>
                            <IonInput ref={profileRef} value={profile} onIonChange={(e) =>
                                setProfile(e.detail.value || '')} onFocus={() => stop(profileAnimation)}></IonInput>
                        </IonItem>

                        <IonItem>
                            <IonLabel className="ion-text-center">Year</IonLabel>
                            <IonInput ref={yearRef} value={year} onIonChange={(e) =>
                                setYear(e.detail.value || '')} onFocus={() => stop(yearAnimation)}></IonInput>
                        </IonItem>
                        {photo && <IonImg src={`data:image/jpeg;base64,${photo}`} style={{height: "100px"}}/>}
                        {!photo && <IonImg src="src/core/no-face.png" style={{height: "100px"}}/>}
                        <IonButton onClick={handleSaveClicked}>Store Student</IonButton>
                    </IonList>

                {savingError && (
                    <IonItem>{savingError.message} The student will be persisted when you get online</IonItem>
                )}
                <IonLoading isOpen={saving} message="Saving the student"/>
            </IonContent>
        </IonPage>
    );
};

export default StudentSave;