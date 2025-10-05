"use client"; 
import { store, persistor } from "@/store/store"; 
import React from "react";
import { Provider } from "react-redux";
import Loading from "./Loading";
import { PersistGate } from "redux-persist/integration/react";

const GlobalProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<Loading />}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default GlobalProvider;
