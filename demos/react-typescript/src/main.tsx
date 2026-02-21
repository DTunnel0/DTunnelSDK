import React from 'react';
import ReactDOM from 'react-dom/client';
import { DTunnelSDKProvider } from 'dtunnel-sdk/react';
import { App } from './App';
import './style.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DTunnelSDKProvider
      options={{
        strict: false,
        autoRegisterNativeEvents: true,
      }}
    >
      <App />
    </DTunnelSDKProvider>
  </React.StrictMode>,
);
