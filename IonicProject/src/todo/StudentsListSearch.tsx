import React, {useContext, useEffect, useMemo, useState} from "react";
import {IonContent, IonPage, IonList, IonItem, IonLabel,IonSearchbar} from "@ionic/react";
import Student from "./Student";
import {StudentContext} from "../core/utils/studentProvider";
import {StudentProps} from "./StudentProps";

const StudentsListSearch : React.FC<StudentProps> = () => {
    // the list of students
    const {students} = useContext(StudentContext);
    const [filteredStudents, setFilteredStudents] =
        useState(students ? [...students] : []);

    useEffect(() => {
        students && setFilteredStudents(students);
    }, [students]);

    // the number of items
    const count= useMemo(() => {
        return filteredStudents.length;
    }, [filteredStudents]);


    const handleInput = (ev: Event) => {
        let query = '';
        const target = ev.target as HTMLIonSearchbarElement;
        if (target) query = target.value!.toLowerCase();

        setFilteredStudents(students ?
            students.filter((student) => student.name.toLowerCase().indexOf(query) > -1) : []);
    };



    return (
        <IonPage>
            <IonContent fullscreen>
                <IonSearchbar debounce={200} onIonInput={(ev) => handleInput(ev)}>
                </IonSearchbar>
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

export default StudentsListSearch;





