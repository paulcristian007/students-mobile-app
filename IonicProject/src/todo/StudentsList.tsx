import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useCamera} from "../core/useCamera";
import {
    IonHeader,
    IonContent,
    IonPage,
    IonToolbar,
    IonTitle,
    IonFab,
    IonFabButton,
    IonIcon,
    IonLoading,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSearchbar,
    IonRow,
    IonCol, IonImg, IonAlert
} from "@ionic/react";
import Student from "./Student";
import {add, camera} from "ionicons/icons";
import {RouteComponentProps, useHistory} from "react-router";
import {StudentContext} from "../core/utils/studentProvider";
import {AuthContext} from "../auth/AuthProvider";
import {PAGE_SIZE} from "../core";
import MyAlert from "./MyAlert";
import {MyModal} from "./MyModal";

const StudentsList : React.FC<RouteComponentProps> = () => {
    const history = useHistory();

    // the list of students
    const {students,  status, fetching, fetchingError,
        infiniteScrollDisabled, fetchFromScroll} = useContext(StudentContext);
    const {logout} = useContext(AuthContext);

    // the number of items
    const count= useMemo(() => {
            console.log('count updated');
            return students && students.length;
        }, [students]);


    const addStudent = useCallback(async () => {
        history.push('/student');
    }, []);

    async function fetchData() {
        if (count)
            fetchFromScroll && await fetchFromScroll(count, count + PAGE_SIZE);
    }

    async function searchNext($event: CustomEvent<void>) {
        await fetchData();
        await ($event.target as HTMLIonInfiniteScrollElement).complete();
    }


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My First Mobile App</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <MyModal count={count || 0} status={status}/>
                <IonItem>
                    <IonLabel className="ion-text-center">Name</IonLabel>
                    <IonLabel className="ion-text-center">Profile</IonLabel>
                    <IonLabel className="ion-text-center">Year</IonLabel>
                    <IonLabel className="ion-text-center">Photo</IonLabel>
                </IonItem>
                <IonLoading isOpen={fetching} message="Fetching students" />
                {students && (
                    <IonList>
                        {students.map(({_id, name, year, profile, photo}) =>
                                <Student key={_id} _id={_id} name={name} year={year} profile={profile} photo={photo} onEdit={(_id) =>
                                        {
                                        history.push(`/student/${_id}`);
                                        console.log(history)}}/>
                        )}
                    </IonList>)}

                <IonInfiniteScroll threshold="100px" disabled={infiniteScrollDisabled}
                                   onIonInfinite={(e: CustomEvent<void >) =>searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading more students...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>

                {fetchingError && (
                    <div>
                        {fetchingError.message}
                    </div>
                )}

                <IonButton onClick={logout}>Logout</IonButton>


                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={addStudent}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>


            </IonContent>
        </IonPage>
    );
};

export default StudentsList;





