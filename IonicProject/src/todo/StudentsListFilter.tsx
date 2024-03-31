import React, {useContext, useEffect, useMemo, useState} from "react";
import {
    IonContent,
    IonPage,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
} from "@ionic/react";
import Student from "./Student";
import {RouteComponentProps} from "react-router";
import {StudentContext} from "../core/utils/studentProvider";
const StudentsListFilter : React.FC<RouteComponentProps> = () => {
    // the list of students
    const {students} = useContext(StudentContext);
    const [profiles, setProfiles] = useState<string[]>([]);
    const [filteredStudents, setFilteredStudents] =
        useState(students ? [...students] : []);


    // the number of items
    const count= useMemo(() => {
        return filteredStudents.length;
    }, [filteredStudents]);
    useEffect(() => {
        setProfiles(getAllProfiles())
    }, [students]);

    function getAllProfiles() {
        let newProfiles: string[] = [];
        if (!students) return [];
        for (const student of students)
            if (!newProfiles.includes(student.profile)) newProfiles.push(student.profile);
            else console.log('warning');
        return newProfiles;
    }

    function generateSelectOptions() {
        return profiles.map((profile) => (
            <IonSelectOption key={profile} value={profile}>
                {profile}
                </IonSelectOption>));
    }



    return (
        <IonPage>
            <IonContent fullscreen>
                <IonSelect onIonChange={(e) => {
                    if (students)
                        setFilteredStudents(students.filter((student) => student.profile === e.detail.value));
                }}>{generateSelectOptions()}</IonSelect>
                <IonItem>
                    <IonLabel> Number of students: {count} </IonLabel>
                </IonItem>
                <IonItem>
                    <IonLabel className="ion-text-center">Name</IonLabel>
                    <IonLabel className="ion-text-center">Profile</IonLabel>
                    <IonLabel className="ion-text-center">Year</IonLabel>
                    <IonLabel className="ion-text-center">Photo</IonLabel>
                </IonItem>
                {students && (
                    <IonList>
                        {filteredStudents.map(({_id, name, year, profile, photo}) =>
                            <Student key={_id} _id={_id} name={name} year={year} profile={profile} photo={photo} onEdit={(_id) =>
                            {}}/>)}
                    </IonList>)}

            </IonContent>
        </IonPage>
    );
};

export default StudentsListFilter;





