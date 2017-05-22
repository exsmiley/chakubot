app.controller('mainController', function($scope, $routeParams, $http, $window) {
	$scope.params = $routeParams;

	// gets general user information
	$http.get("/api/userInfo").then(function(response) {
		$scope.userInfo = response.data
	});

	// gets information about conducted interviews
	$http.get("/api/report_data").then(function(response) {
		$scope.reports = response.data
	});

	$scope.logout = function() {
		$http.get("/logout").then(function(response) {
			$window.location = "/"
		});
	}

});