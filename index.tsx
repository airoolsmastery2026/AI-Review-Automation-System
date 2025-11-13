import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './contexts/I18nContext';
import { NotificationProvider } from './contexts/NotificationContext';

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <I18nProvider>
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </I18nProvider>
        </React.StrictMode>
    );
}
