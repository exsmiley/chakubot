// create the module and name it angryCartels
var app = angular.module('chakubot', ['ngRoute', 'ngSanitize']);

// connect the socket so we can do cool stuff, will probably link this with logging in though
// var socket = io.connect();

// configure our routes
app.config(function($routeProvider, $locationProvider) {
	$routeProvider

		// route for the home page
		.when('/', {
			templateUrl : 'pages/home.html',
			// controller  : 'homeController'
		})

		// // route for the report page
		.when('/report', {
			templateUrl : 'pages/report.html',
		})

		.when('/profile/:companyId', {
			templateUrl : 'pages/report.html',
		})

		.when('/profile/:companyId/report/:interviewId', {
			templateUrl : 'pages/report.html',
			controller  : 'reportController'
		})

		.otherwise({
		    templateUrl : 'pages/404.html',
		});

		// use the HTML5 History API to get the pretty urls without a weird /#/ between relevant info
        $locationProvider.html5Mode(true);
});