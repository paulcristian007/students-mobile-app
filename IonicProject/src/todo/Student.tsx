import React from "react";
import {StudentProps} from "./StudentProps";
import {IonCol, IonGrid, IonImg, IonItem, IonLabel, IonRow} from "@ionic/react";

export interface StudentPropsExtended extends StudentProps{
    onEdit: (_id?: string) => void;
}

const Student : React.FC<StudentPropsExtended> = ({_id, name, profile, year, onEdit, photo}) => {
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel className="ion-text-center">{name}</IonLabel>
             <IonLabel className="ion-text-center">{profile}</IonLabel>
             <IonLabel className="ion-text-center">{year}</IonLabel>
             <IonLabel>
                {photo && <IonImg src={`data:image/jpeg;base64,${photo}`} style={{height: "100px"}}/>}
                {!photo && <IonImg src="src/core/no-face.png" style={{height: "100px"}}/>}
             </IonLabel>
         </IonItem>

    );
};

export default Student;


