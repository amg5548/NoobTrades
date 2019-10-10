const app = angular.module('myApp', ['ngRoute', 'ngCookies']);

app.config(function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl: 'views/login.html',
		controller: 'login'
	}).when('/registration', {
		templateUrl: 'views/registration.html',
		controller: 'registration'
	}).when('/trade', {
		templateUrl: 'views/trade.html',
		controller: 'trade'
	}).when('/history', {
		templateUrl: 'views/history.html',
		controller: 'history'
	}).otherwise({ redirectTo: '/login' });
});
