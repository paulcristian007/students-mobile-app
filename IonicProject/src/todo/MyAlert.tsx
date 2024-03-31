// MyComponent.tsx
import React, { useState } from 'react';
import { IonAlert, IonButton, createAnimation } from '@ionic/react';

const MyAlert: React.FC = () => {
    const [showAlert, setShowAlert] = useState(false);

    const enterAnimation = (baseEl: HTMLElement) => {
        return createAnimation()
            .addElement(baseEl)
            .fromTo('opacity', '0', '1')
            .duration(500)
            .easing('ease-in');
    };

    const leaveAnimation = (baseEl: HTMLElement) => {
        return createAnimation()
            .addElement(baseEl)
            .fromTo('opacity', '1', '0')
            .duration(500)
            .easing('ease-out');
    };

    return (
        <>
            <IonButton onClick={() => setShowAlert(true)}>Show Alert</IonButton>

            <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                header="Custom Alert"
                message="This is a custom alert with animation!"
                buttons={['OK']}
                enterAnimation={enterAnimation}
                leaveAnimation={leaveAnimation}
            />
        </>
    );
};

export default MyAlert;
