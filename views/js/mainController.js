app.controller('mainController', function($scope, $routeParams) {
	$scope.message = "Hi mom"
	$scope.params = $routeParams;
	$scope.login = true;

	// sets login to true or false
	$scope.isLogin = function(val) {
		$scope.login = val
	}

	$scope.doLogin = function() {
		// TODO
	}

	$scope.doSignup = function() {
		// TODO
	}
});