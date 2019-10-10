//eslint-disable-next-line padded-blocks
app.controller('registration', function($scope, $http, $timeout, $location) {

	$scope.register = async function() {
		const users = await getAllUsers();
		if (checkExistence(users) == true) {
			swal({
				text: `User ${$scope.username} already exists!`,
				icon: 'error'
			});
		} else if (validatePassword($scope.password, $scope.confirmPassword) == false) {
			swal({
				text: 'Passwords do not match',
				icon: 'error'
			});
		} else {
			$http.post('/api/users', {
				'fname': $scope.fname,
				'lname': $scope.lname,
				'email': $scope.email,
				'username': $scope.username,
				'password': $scope.password,
				'cashTotal': 100000
			});
			clearForm();
			swal({
				text: 'Your account has been created!',
				icon: 'success'
			}).then(function() {
				$timeout(function() {
					$location.url('/login');
				});
			});
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

	function checkExistence(users) {
		for (let i = 0; i < users.length; i++) {
			if ($scope.username == users[i][1]['username']) {
				return true;
			}
		}
		return false;
	}

	function validatePassword(password, confirmPassword) {
		if (password == confirmPassword) {
			return true;
		}
		return false;
	}

	function clearForm() {
		$scope.fname = '';
		$scope.lname = '';
		$scope.email = '';
		$scope.username = '';
		$scope.password = '';
		$scope.confirmPassword = '';
	}
});
