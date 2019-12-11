app.controller('trade', function($scope, $http, $cookies, $interval, $window) {

	$scope.disabled = true;
	$scope.selected = 'Buy';

	$scope.makeUpperCase = function() {
		$scope.model = $scope.model.toUpperCase();
	};

	$scope.provoked = function(event) {
		if (event.which == 13) {
			$scope.setStock();
			event.preventDefault();
			event.stopPropagation();
		}
	};

	$scope.showTotal = function() {
		$scope.total = $scope.price * $scope.qty;
	};

	$scope.$on('$routeChangeSuccess', async function() {
		getUserData();
		const symbol = await getInitialStock();
		$http.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=apikey`).then(function(response) {
			if (handleResponseErrors(response.data) == false) {
				const data = formatResponseData(response.data, 'Time Series (1min)');
				$scope.symbol = symbol;
				$scope.price = data[0][1]['4. close'];
				setTimer();
				$scope.disabled = false;
				drawChart('1min', data);
			}
		});
	});

	function getUserData() {
		$http.get(`/api/id/${$cookies.get('cookie')}`).then(function(response) {
			$scope.fname = response.data[0]['fname'];
			$scope.lname = response.data[0]['lname'];
			$scope.cashTotal = response.data[0]['cashTotal'];
		});
	}

	function getInitialStock() {
		return new Promise((resolve) => {
			$http.get(`/api/id/${$cookies.get('cookie')}`).then(function(response) {
				if (response.data[0]['history'].length == 0) {
					resolve('MSFT');
				} else {
					resolve(response.data[0]['history'][0]['stock']);
				}
			});
		});
	}

	function handleResponseErrors(response) {
		if (Object.prototype.hasOwnProperty.call(response, 'Note') == true) {
			swal('Wait a minute!', 'You are being rate limited by the Alpha Vantage API', 'error');
		} if (Object.prototype.hasOwnProperty.call(response, 'Error Message') == true) {
			swal({
				text: `${$scope.model} is not a valid stock ticker symbol`,
				icon: 'error'
			});
		}
		return false;
	}

	function formatResponseData(response, series) {
		const a = response[series];
		const b = Object.keys(a).map((key) => {
			return [key, a[key]];
		});
		const c = [];
		if (b.length > 100) {
			for (let i = 0; i < 100; i++) {
				c.push(b[i]);
			}
		} else {
			for (let i = 0; i < b.length; i++) {
				c.push(b[i]);
			}
		}
		return c;
	}

	function setTimer() {
		$interval.cancel($scope.timer);
		const today = new Date();
		$scope.seconds = (60 - CanvasJS.formatDate(today, 's'));
		$scope.timer = $interval(function() {
			if ($scope.seconds != 1) {
				$scope.seconds--;
			} else {
				$scope.seconds = 60;
				$http.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${$scope.symbol}&interval=1min&apikey=apikey`)
					.then(function(response) {
						const a = response.data['Time Series (1min)'];
						const b = Object.keys(a).map((key) => {
							return [key, a[key]];
						});
						$scope.price = b[0][1]['4. close'];
					});
			}
		}, 1000);
	}

	function drawChart(interval, data) {
		const chart = new CanvasJS.Chart('chart-div2', {
			animationEnabled: true,
			zoomEnabled: true,
			theme: 'dark2',
			toolTip: { backgroundColor: 'black' },
			title: {
				text: `${$scope.symbol}: ${interval}`,
				fontFamily: 'Helvetica',
				horizontalAlign: 'left',
				padding: { bottom: '15' }
			},
			axisX: {
				labelFontFamily: 'Helvetica',
				labelMaxWidth: 100,
				interval: 12
			},
			axisY: {
				labelFormatter: function(e) {
					return e.value.toFixed(2);
				},
				includeZero: false,
				prefix: '$',
				labelFontFamily: 'Helvetica'
			},
			data: [{
				type: 'candlestick',
				risingColor: '#93c47d',
				fallingColor: '#e06666',
				yValueFormatString: '$##0.00',
				dataPoints: formatDataForCanvas(data, interval)
			}]
		});
		changeBorderColor(chart);
		chart.render();
	}

	function formatDataForCanvas(arr, interval) {
		const totalArr = [];
		for (let i = 0; i < (arr.length); i++) {
			const open = Number(arr[i][1]['1. open']);
			const high = Number(arr[i][1]['2. high']);
			const low = Number(arr[i][1]['3. low']);
			const close = Number(arr[i][1]['4. close']);
			const dataArr = [open, high, low, close];
			const date = new Date(arr[i][0]);
			if (interval == '1min' || interval == '5min' || interval == '15min' || interval == '30min' || interval == '60min') {
				const data = { y: dataArr, label: formatDataForIntraday(date) };
				totalArr.push(data);
			}
			if (interval == 'Daily') {
				const data = { y: dataArr, label: formatDataForDaily(date) };
				totalArr.push(data);
			}
			if (interval == 'Weekly') {
				const data = { y: dataArr, label: formatDataForWeekly(date) };
				totalArr.push(data);
			}
			if (interval == 'Monthly') {
				const data = { y: dataArr, label: formatDataForMonthly(date) };
				totalArr.push(data);
			}
		}
		return totalArr.reverse();
	}

	function formatDataForIntraday(date) {
		return CanvasJS.formatDate(date, 'HH:mm (MM/DD)');
	}

	function formatDataForDaily(date) {
		return CanvasJS.formatDate(date, 'MM/DD');
	}

	function formatDataForWeekly(date) {
		return CanvasJS.formatDate(date, 'MM/DD (YYYY)');
	}

	function formatDataForMonthly(date) {
		return CanvasJS.formatDate(date, 'MMM YYYY');
	}

	function changeBorderColor(chart) {
		let dataSeries;
		for (let i = 0; i < chart.options.data.length; i++) {
			dataSeries = chart.options.data[i];
			for (let j = 0; j < dataSeries.dataPoints.length; j++) {
				dataSeries.dataPoints[j].color = (dataSeries.dataPoints[j].y[0] <= dataSeries.dataPoints[j].y[3]) ? (dataSeries.risingColor ? dataSeries.risingColor : dataSeries.color) : (dataSeries.fallingColor ? dataSeries.fallingColor : dataSeries.color);
			}
		}
	}

	$scope.setStock = function() {
		if ($scope.model == '') {
			//do nothing
		} else {
			$http.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${$scope.model}&interval=1min&apikey=apikey`).then(function(response) {
				if (handleResponseErrors(response.data) == false) {
					const data = formatResponseData(response.data, 'Time Series (1min)');
					$scope.symbol = $scope.model;
					$scope.model = '';
					$scope.price = data[0][1]['4. close'];
					setTimer();
					$scope.qty = null;
					$scope.total = null;
					$scope.disabled = false;
					drawChart('1min', data);
				}
			});
		}
	};

	$scope.placeOrder = function() {
		if ($scope.selected == 'Buy') {
			buy();
		} if ($scope.selected == 'Sell') {
			sell();
		}
	};

	async function buy() {
		if (await confirmBuy() == true) {
			swal({
				text: `You bought ${$scope.qty} share(s) of ${$scope.symbol}`,
				icon: 'success'
			});
			Promise.all([updateCashTotal($scope.cashTotal - $scope.total), updatePositions($scope.selected), updateHistory()]).then(function() {
				getUserData();
				resetPlaceOrder();
			});
		}
	}

	function confirmBuy() {
		return new Promise((resolve) => {
			if ($scope.cashTotal < $scope.total) {
				swal({
					text: 'Insufficient funds',
					icon: 'error'
				});
			} else {
				swal({
					text: `Are you sure you want to BUY ${$scope.qty} share(s) of ${$scope.symbol}?`,
					icon: 'warning',
					buttons: ['No', 'Yes']
				}).then((willBuy) => {
					if (willBuy) {
						resolve(true);
					}
				});
			}
		});
	}

	function updateCashTotal(cashTotal) {
		return new Promise((resolve) => {
			$http.put(`/api/id/${$cookies.get('cookie')}`, { 'cashTotal': cashTotal }).then(function() {
				resolve();
			});
		});
	}

	function updatePositions(order) {
		if (order == 'Buy') {
			return new Promise((resolve) => {
				$http.get(`/api/id/${$cookies.get('cookie')}`).then(function(response) {
					const positions = response.data[0]['positions'];
					const arr = [];
					for (let i = 0; i < positions.length; i++) {
						if (positions[i]['stock'] == $scope.symbol) {
							arr.unshift({
								'stock': positions[i]['stock'],
								'shares': positions[i]['shares'] + Number($scope.qty)
							});
						} else {
							arr.push(positions[i]);
						}
					}
					if (checkOwnership(positions, $scope.symbol) == false) {
						arr.unshift({
							'stock': $scope.symbol,
							'shares': $scope.qty
						});
					}
					$http.put(`/api/id/${$cookies.get('cookie')}`, { 'positions': arr }).then(function() {
						resolve();
					});
				});
			});
		} else if (order == 'Sell') {
			return new Promise((resolve) => {
				$http.get(`/api/id/${$cookies.get('cookie')}`).then(function(response) {
					const positions = response.data[0]['positions'];
					const arr = [];
					for (let i = 0; i < positions.length; i++) {
						if (positions[i]['stock'] == $scope.symbol && positions[i]['shares'] == $scope.qty) {
							//do nothing
						} else if (positions[i]['stock'] == $scope.symbol) {
							arr.unshift({
								'stock': positions[i]['stock'],
								'shares': positions[i]['shares'] - Number($scope.qty)
							});
						} else {
							arr.push(positions[i]);
						}
					}
					$http.put(`/api/id/${$cookies.get('cookie')}`, { 'positions': arr }).then(function() {
						resolve();
					});
				});
			});
		}
	}

	function checkOwnership(arr, symbol) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i]['stock'] == symbol) {
				return true;
			}
		}
		return false;
	}

	function updateHistory() {
		return new Promise((resolve) => {
			$http.get(`/api/id/${$cookies.get('cookie')}`).then(function(response) {
				const history = response.data[0]['history'];
				const arr = [];
				for (let i = 0; i < history.length; i++) {
					arr.push(history[i]);
				}
				const date = new Date();
				const time = CanvasJS.formatDate(date, 'H:mm');
				arr.unshift({
					'stock': $scope.symbol,
					'order': $scope.selected,
					'shares': $scope.qty,
					'pricePer': $scope.price,
					'priceTotal': $scope.total,
					'date': date,
					'time': time
				});
				$http.put(`/api/id/${$cookies.get('cookie')}`, { 'history': arr }).then(function() {
					resolve();
				});
			});
		});
	}

	function resetPlaceOrder() {
		$scope.selected = 'Buy';
		$scope.qty = null;
		$scope.total = null;
	}

	async function sell() {
		const positions = await getPositions();
		if (await confirmSell(positions) == true) {
			swal({
				text: `You sold ${$scope.qty} share(s) of ${$scope.symbol}`,
				icon: 'success'
			});
			Promise.all([updateCashTotal($scope.cashTotal + $scope.total), updatePositions($scope.selected), updateHistory()]).then(function() {
				getUserData();
				resetPlaceOrder();
			});
		}
	}

	function getPositions() {
		return new Promise((resolve) => {
			$http.get(`/api/id/${$cookies.get('cookie')}`).then(function(response) {
				resolve(response.data[0]['positions']);
			});
		});
	}

	function confirmSell(positions) {
		return new Promise((resolve) => {
			if ($scope.qty > getShareQty($scope.symbol, positions)) {
				swal({
					text: `Cannot sell more shares than you own of ${$scope.symbol}`,
					icon: 'error'
				});
			} else {
				swal({
					text: `Are you sure you want to SELL ${$scope.qty} share(s) of ${$scope.symbol}?`,
					icon: 'warning',
					buttons: ['No', 'Yes']
				})
					.then((willSell) => {
						if (willSell) {
							resolve(true);
						}
					});
			}
		});
	}

	function getShareQty(symbol, positions) {
		for (let i = 0; i < positions.length; i++) {
			if (positions[i]['stock'] == symbol) {
				return positions[i]['shares'];
			}
		}
		return 0;
	}

	$scope.showPositions = async function() {
		const positions = await getPositions();
		if (positions.length == 0) {
			swal({
				text: 'You\'re not currently invested in anything',
				icon: 'info'
			});
		} else {
			let a = [];
			for (let i = 0; i < positions.length; i++) {
				const b = `${positions[i].stock} x ${positions[i].shares}`;
				a.push(b);
			}
			a = a.join('\n');
			swal({
				text: `${'You\'re currently invested in...' + '\n'}${a}`,
				icon: 'info'
			});
		}
	};

	$scope.show1min = function() {
		getStockData('TIME_SERIES_INTRADAY', $scope.symbol, '1min', 'Time Series (1min)');
	};

	$scope.show5min = function() {
		getStockData('TIME_SERIES_INTRADAY', $scope.symbol, '5min', 'Time Series (5min)');
	};

	$scope.show15min = function() {
		getStockData('TIME_SERIES_INTRADAY', $scope.symbol, '15min', 'Time Series (15min)');
	};

	$scope.show30min = function() {
		getStockData('TIME_SERIES_INTRADAY', $scope.symbol, '30min', 'Time Series (30min)');
	};

	$scope.show60min = function() {
		getStockData('TIME_SERIES_INTRADAY', $scope.symbol, '60min', 'Time Series (60min)');
	};

	$scope.showDaily = function() {
		getStockData('TIME_SERIES_DAILY', $scope.symbol, 'Daily', 'Time Series (Daily)');
	};

	$scope.showWeekly = function() {
		getStockData('TIME_SERIES_WEEKLY', $scope.symbol, 'Weekly', 'Weekly Time Series');
	};

	$scope.showMonthly = function() {
		getStockData('TIME_SERIES_MONTHLY', $scope.symbol, 'Monthly', 'Monthly Time Series');
	};

	function getStockData(series, symbol, interval, series2) {
		$http.get(`https://www.alphavantage.co/query?function=${series}&symbol=${symbol}&interval=${interval}&apikey=apikey`).then(function(response) {
			if (handleResponseErrors(response.data) == false) {
				const data = formatResponseData(response.data, series2);
				drawChart(interval, data);
			}
		});
	}

	$scope.dropDown = function() {
		document.getElementById('myDropdown').classList.toggle('show');
	};

	$window.onclick = function(event) {
		if (!event.target.matches('.dropbtn')) {
			const dropdowns = document.getElementsByClassName('dropdown-content');
			for (let i = 0; i < dropdowns.length; i++) {
				const openDropdown = dropdowns[i];
				if (openDropdown.classList.contains('show')) {
					openDropdown.classList.remove('show');
				}
			}
		}
	};
});
