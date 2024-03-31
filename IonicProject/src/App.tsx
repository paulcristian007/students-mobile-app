import { Redirect, Route } from 'react-router-dom';
import {IonApp, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import StudentsList from "./todo/StudentsList";
import StudentEdit from "./todo/StudentEdit";
import React from "react";
import StudentSave from "./todo/StudentSave";
import {StudentProvider} from "./todo/StudentProvider";
import {AuthProvider} from "./auth/AuthProvider";
import {PrivateRoute} from "./auth/PrivateRoute";
import {Login} from "./auth/Login";
import StudentsListSearch from "./todo/StudentsListSearch";
import StudentsListFilter from "./todo/StudentsListFilter";
import {LocationProvider} from "./todo/LocationProvider";
setupIonicReact();

const App: React.FC = () => (
  <IonApp>
      <IonReactRouter>
            <IonTabs>
                  <IonRouterOutlet>
                        <AuthProvider>
                              <Route path="/login" component={Login} exact={true}/>
                              <StudentProvider>
                                    <PrivateRoute path="/students" component={StudentsList} exact={true}/>
                                    <PrivateRoute path="/students/search" component={StudentsListSearch} exact={true}/>
                                    <PrivateRoute path="/students/filter" component={StudentsListFilter} exact={true}/>

                                    <PrivateRoute path="/student" component={StudentSave} exact={true}/>
                                    <LocationProvider>
                                          <PrivateRoute path="/student/:_id" component={StudentEdit} exact={true}/>
                                    </LocationProvider>
                              </StudentProvider>
                              <Route exact path="/" render={() => <Redirect to="/students"/>}/>
                        </AuthProvider>
                  </IonRouterOutlet>
                  <IonTabBar slot="bottom">
                        <IonTabButton tab="home" href="/students">
                              <IonLabel>Home</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="search" href="/students/search">
                              <IonLabel>Search</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="filter" href="/students/filter">
                              <IonLabel>Filter</IonLabel>
                        </IonTabButton>
                  </IonTabBar>
            </IonTabs>
      </IonReactRouter>
  </IonApp>
);

export default App;