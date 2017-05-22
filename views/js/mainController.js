app.controller('mainController', function($scope, $routeParams, $http, $window) {
	$scope.params = $routeParams;

	$http.get("/api/myinfo").then(function(response) {
		$scope.email = response.data.email
		$scope.companyName = response.data.companyName
		$scope.embedUrl = response.data.companyId
	});
	$scope.logout = function() {
		$http.get("/logout").then(function(response) {
			$window.location = "/"
		});
	}

});