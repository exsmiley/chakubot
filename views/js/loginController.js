var app = angular.module('chakubot', ['ngSanitize']);

app.controller('loginController', function($scope, $http, $window) {
	$scope.login = true;
	$scope.formData = {};
	$scope.warning = "";

	// sets login to true or false
	$scope.isLogin = function(val) {
		$scope.login = val
	}

	$scope.doLogin = function() {
		$http.post("/api/login", {"email": $scope.formData.email, "pwd": $scope.formData.password}, {}).then(function(response) {
			if(response.data.loggedIn) {
				// redirect to logged in
				$window.location = $window.location + ""
			} else {
				// warning about user/pass
				$scope.warning = "Email or Password is incorrect!"
			}
		});
	}

	$scope.doSignup = function() {
		$http.post("/api/signup", {"email": $scope.formData.email, "pwd": $scope.formData.password, "companyName": $scope.formData.companyName}, {}).then(function(response) {
			if(response.data.accountMade) {
				// redirect to logged in
				$window.location = $window.location + ""
			} else {
				// warning about user/pass
				$scope.warning = "Email already has an account!"
			}
		});
	}
});