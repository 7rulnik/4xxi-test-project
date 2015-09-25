import React, {Component, PropTypes} from 'react';
import token from '../../token';

export default class City extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {
				sys: {
					country: ''
				},
				main: {
					temp: ''
				},
				weather: [
					{
						descriptions: ''
					}
				]
			},
			loading: true
		};

		this.loadData = this.loadData.bind(this);
		this.loadData(props.id);
	}

	loadData(id) {
		fetch(`http://api.openweathermap.org/data/2.5/weather?id=${id}&units=metric&APPID=${token}`)
			.then(response => {
				return response.json();
			}).then(data => {
				this.setState({
					loading: false,
					data
				});
			});
	}

	render() {
		const {id, geo, cardClass} = this.props;
		const {data, loading} = this.state;
		return (
			<div className={`mdl-cell ${cardClass} city`}>
				<div className="mdl-card mdl-shadow--2dp city__card">
					{loading && <div className="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active city__loading"></div>}

					{!loading && <div className="mdl-card__title">
						<h2 className="mdl-card__title-text">{data.name},&nbsp;{data.sys.country}</h2>
					</div>}

					<div className="mdl-card__supporting-text">
						Weather: {data.weather[0].description}<br/>
						Temp: {Math.floor(data.main.temp)}°C<br/>
						Humidity: {Math.floor(data.main.humidity)}%<br/>
						Pressure: {Math.floor(data.main.pressure)} hpa
					</div>

					<div className="mdl-card__menu">
						{geo && <div className="mdl-button mdl-button--icon">
							<i className="icon material-icons">gps_fixed</i>
						</div>}

						{!geo && <button
							onClick={this.props.removeCity.bind(this, id)}
							className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
							>
							<i className="material-icons">close</i>
						</button>}
					</div>

				</div>
			</div>
		);
	}
}

City.propTypes = {
	removeCity: PropTypes.func.isRequired,
	id: PropTypes.string.isRequired,
	geo: PropTypes.bool,
	cardClass: PropTypes.string.isRequired
};

City.defaultProps = {
	geo: false
};
