import React, {Component, PropTypes} from 'react';
import classNames from 'classNames';
import token from '../../token';

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}

	const error = new Error(response.statusText);
	error.response = response;
	throw error;
}

function parseJSON(response) {
	return response.json();
}

function checkForCityExist(id) {
	return fetch(`http://api.openweathermap.org/data/2.5/weather?id=${id}&APPID=${token}`)
		.then(checkStatus)
		.then(parseJSON)
		.then(data => {
			console.log('request succeeded with JSON response', data);
			if (data.cod === '404') {
				return false;
			}
			return true;
		})
		.catch(error => {
			console.log('request failed', error);
			return false;
		});
}

export default class Search extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: '',
			cityList: [],
			currentItem: -1
		};
		this.onChange = this.onChange.bind(this);
		this.getList = this.getList.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onItemClick = this.onItemClick.bind(this);
	}

	onBlur() {
		this.setState({
			currentItem: -1
		});
	}

	onKeyDown(event) {
		let {currentItem} = this.state;
		const {cityList} = this.state;
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				this.setState({
					currentItem: --currentItem < -1 ? -1 : currentItem
				});
				break;

			case 'ArrowDown':
				this.setState({
					currentItem: ++currentItem > cityList.length - 1 ? cityList.length - 1 : currentItem
				});
				break;

			case 'Enter':
				this.onItemClick(currentItem, event.target.value);
				break;
			default:
		}
	}

	onItemClick(currentItem, value) {
		if (!value) {
			return;
		}
		const {cityList} = this.state;
		const valueToCheck = currentItem === -1 ? value : cityList[currentItem].id;

		checkForCityExist(valueToCheck).then(isExist => {
			if (isExist) {
				this.props.addCity(valueToCheck);
				this.setState({
					// value: cityList[currentItem]
					value: '',
					cityList: []
				});
			} else {
				alert('This city does not exist');
			}
		});
	}

	onChange(event) {
		const {value} = event.target;
		this.setState({
			value,
			currentItem: -1
		}, this.getList);
	}

	getList() {
		fetch(`http://api.openweathermap.org/data/2.5/find?q=${this.state.value}&type=like&mode=json&APPID=${token}`)
			.then(parseJSON)
			.then(data => {
				this.setState({
					cityList: data.list || []
				});
			});
	}

	render() {
		const {value, cityList, currentItem} = this.state;
		return (
				<div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label search">
					<input
						onFocus={this.onFocus}
						onBlur={this.onBlur}
						onChange={this.onChange}
						onKeyDown={this.onKeyDown}
						value={value}
						className="mdl-textfield__input search__input"
						type="text"
						id="input"
						ref="input"
						/>
					<label
						className="mdl-textfield__label search__label"
						htmlFor="input"
						>Choose city from list or enter ID</label>
					{cityList.length > 0 && <ul className="mdl-card mdl-shadow--6dp search__suggest">
						{cityList.map((item, index) => {
							const itemClass = classNames(
								'search__suggest-item',
								{'search__suggest-item--active': currentItem === index}
							);

							return (
								<li
									key={item.id}
									onClick={this.onItemClick.bind(this, index)}
									className={itemClass}
									>{item.name}, {item.sys.country}</li>
							);
						})}
					</ul>}
				</div>
		);
	}
}

Search.propTypes = {
	addCity: PropTypes.func.isRequired
};
