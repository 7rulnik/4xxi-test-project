import React from 'react';
import ReactDOM from 'react-dom';
import Forecast from './components/forecast/';
require('es6-promise').polyfill();
require('whatwg-fetch');

ReactDOM.render(
	<Forecast/>,
	document.getElementById('app')
);
