app.controller('reportController', function($scope, $routeParams, $http) {
	$scope.message = "Hi mom"
	$scope.params = $routeParams;
	console.log($scope.params)

	$http({
	     url: "/api/report_data", 
	     method: "GET",
	     params: {"companyId": $scope.params.companyId, "interviewId": $scope.params.interviewId}  
	}).then(function(res) {
		console.log(res)
		console.log(res.data)
		$scope.data = format_log(res.data.log)
		// $scope.$apply()
		})

	function format_log(log) {
		// TODO
		let keep = [[]];
		let placeholder = 0;
		let questionNum = 0;

		for(let entry of log) {
			if(entry.question === questionNum) {
				placeholder += 1
			} else if(entry.question > questionNum) {
				placeholder = 1;
				questionNum += 1;
				keep.push([]);
			}

			if(placeholder >= 2) {
				keep[keep.length-1].push(entry)
			}
		}

		return log
	}
});