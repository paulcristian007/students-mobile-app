import React, { useState } from 'react';
import {createAnimation, IonModal, IonButton, IonContent, IonList, IonItem, IonLabel, IonInput} from '@ionic/react';
import {stop} from "../core/animations";

interface MyModalProps {
    count: number,
    status: string
}
export const MyModal: React.FC<MyModalProps> = ({count, status}) => {
  const [showModal, setShowModal] = useState(false);

  const enterAnimation = (baseEl: any) => {
    const root = baseEl.shadowRoot;
    /*const backdropAnimation = createAnimation()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');*/

    const wrapperAnimation = createAnimation()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' }
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(700)
      .addAnimation([ wrapperAnimation]);
  }

  const leaveAnimation = (baseEl: any) => {
    return enterAnimation(baseEl).direction('reverse');
  }

  console.log('MyModal', showModal);
  return (
    <>
      <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
          <IonList>
              <IonItem>
                  <IonLabel className="ion-text-center">Number of students: </IonLabel>
                  <IonInput value={count}/>
              </IonItem>
              <IonItem>
                  <IonLabel className="ion-text-center">Network Status: </IonLabel>
                  <IonInput value={status}/>
              </IonItem>
          </IonList>
          <IonButton onClick={() => setShowModal(false)}>Close Info</IonButton>

      </IonModal>
    <IonButton onClick={() => setShowModal(true)}>Show App Info</IonButton>


    </>
  );
};
