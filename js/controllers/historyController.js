app.controller('history', function($scope, $http, $cookies, $window) {

	$scope.hidden = true;

	$scope.$on('$routeChangeSuccess', function() {
		getUserData();
	});

	function getUserData() {
		$http.get(`/api/id/${$cookies.get('cookie')}`).then(function(response) {
			$scope.fname = response.data[0]['fname'];
			$scope.lname = response.data[0]['lname'];
			$scope.cashTotal = response.data[0]['cashTotal'];
			$scope.history = response.data[0]['history'];
			if ($scope.history.length > 0) {
				$scope.hidden = false;
			}
		});
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

	function getPositions() {
		return new Promise((resolve) => {
			$http.get(`/api/id/${$cookies.get('cookie')}`).then(function(response) {
				resolve(response.data[0]['positions']);
			});
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
