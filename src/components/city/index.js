import React, {Component, PropTypes} from 'react';
import token from '../../token';

export default class City extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {
				sys: {}
			},
			loading: true
		};

		this.loadData = this.loadData.bind(this);
		this.loadData(props.id);
	}

	loadData(id) {
		fetch(`http://api.openweathermap.org/data/2.5/weather?id=${id}&APPID=${token}`)
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
						<h2 className="mdl-card__title-text">{data.name}</h2>
					</div>}

					<div className="mdl-card__menu">
						{geo && <button className="mdl-button mdl-button--icon mdl-js-button" id="gps">
							<i className="material-icons">gps_fixed</i>
						</button>}
						{geo && <div className="mdl-tooltip" htmlFor="gps">Ваше местоположение</div>}

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
	id: PropTypes.number.isRequired,
	geo: PropTypes.bool,
	cardClass: PropTypes.string.isRequired
};

City.defaultProps = {
	geo: false
};
