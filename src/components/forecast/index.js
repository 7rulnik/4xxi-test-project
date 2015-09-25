import React, {Component} from 'react';
import Search from '../search/';
import City from '../city/';

function getCurrentPosition() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			const {latitude, longitude} = position.coords;

			fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}`)
				.then(response => {
					return response.json();
				}).then(data => {
					this.addCity(data.id, true);
				});
		});
	} else {
		alert('Geolocation is not supported by this browser.');
	}
}

export default class Forecast extends Component {
	constructor(props) {
		super(props);
		const localData = localStorage.getItem('weatherApp');
		this.state = {
			cityList: localData ? localData.split(',') : []
		};

		getCurrentPosition.call(this);
		this.addCity = this.addCity.bind(this);
		this.removeCity = this.removeCity.bind(this);
		this.updateLocalStorage = this.updateLocalStorage.bind(this);
	}

	addCity(cityID, geo) {
		if (geo) {
			this.setState({
				currentLocation: cityID
			});
			return;
		}
		const {cityList} = this.state;
		const indexInList = cityList.indexOf(cityID);

		if (indexInList > -1) {
			alert('This city already added');
			return;
		}

		this.setState({
			cityList: cityList.concat([cityID]).reverse()
		}, this.updateLocalStorage);
	}

	removeCity(cityID) {
		const {cityList} = this.state;

		this.setState({
			cityList: cityList.filter(item => Number(item) !== Number(cityID))
		}, this.updateLocalStorage);
	}

	updateLocalStorage() {
		const {cityList} = this.state;
		localStorage.setItem('weatherApp', cityList);
	}

	render() {
		const {cityList, currentLocation} = this.state;
		const cardClass = cityList.length + 1 > 2 ? 'mdl-cell--4-col' : 'mdl-cell--6-col';
		return (
			<section className="forecast mdl-card mdl-shadow--4dp">
				<h1 className="mdl-typography--display-3 mdl-typography--text-center mdl-typography--text-uppercase forecast__title">Forecast App</h1>
				<Search addCity={this.addCity}/>
				<section className="mdl-grid">
					{cityList.length > 0 && cityList.map(item => {
						return <City key={item} cardClass={cardClass} id={Number(item)} removeCity={this.removeCity}/>;
					})}
					{currentLocation && <City geo cardClass={cardClass} id={Number(currentLocation)} removeCity={this.removeCity}/>}
				</section>
			</section>
		);
	}
}
