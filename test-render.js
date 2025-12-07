import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.jsx';

try {
    console.log('Attempting to render App...');
    const html = renderToString(React.createElement(App));
    console.log('Render successful!');
} catch (error) {
    console.error('Render failed:', error);
}
