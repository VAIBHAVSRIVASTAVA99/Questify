import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Correct usage
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
