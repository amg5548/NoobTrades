app.controller('login', function($scope, $http, $cookies, $timeout, $location) {

	$scope.login = async function() {
		const users = await getAllUsers();
		if (checkUsername(users) == false) {
			swal({
				text: 'Invalid username/password combination',
				icon: 'error'
			});
		} else {
			const user = await getUser($scope.username);
			if (checkPassword(user) == false) {
				swal({
					text: 'Invalid username/password combination',
					icon: 'error'
				});
			} else {
				$cookies.put('cookie', user['_id']);
				$timeout(function() {
					$location.url('/trade');
				});
			}
		}
	};

	function getAllUsers() {
		return new Promise((resolve) => {
			$http.get('/api/users').then(function(response) {
				const a = response.data;
				const b = Object.keys(a).map((key) => {
					return [key, a[key]];
				});
				resolve(b);
			});
		});
	}

	function checkUsername(users) {
		for (let i = 0; i < users.length; i++) {
			if ($scope.username == users[i][1]['username']) {
				return true;
			}
		}
		return false;
	}

	function getUser(username) {
		return new Promise((resolve) => {
			$http.get(`/api/username/${username}`).then(function(response) {
				resolve(response.data[0]);
			});
		});
	}

	function checkPassword(user) {
		if ($scope.password == user['password']) {
			return true;
		}
		return false;
	}
});
