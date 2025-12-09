import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './react/App';

document.addEventListener('DOMContentLoaded', () => {
	const rootEl = document.getElementById('wallet-dashboard');
	if (rootEl) {
		const root = createRoot(rootEl);
		root.render(React.createElement(App));
	}
});
