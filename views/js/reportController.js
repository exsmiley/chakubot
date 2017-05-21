app.controller('reportController', function($scope, $routeParams, $http) {
	$scope.message = "Hi mom"
	$scope.params = $routeParams;
	console.log($scope.params)

	$http({
	     url: "/api/report_data", 
	     method: "GET",
	     params: {"companyId": $scope.params.companyId, "interviewId": $scope.params.interviewId}  
	}).then(function(res) {
		console.log(res.data)
		$scope.data = format_log(res.data)
		})

	function format_log(log) {
		data = {"answers": {"-1": ""}, "questions": {"-1": ""}}

		for(let entry of log) {
			if(entry.from_client) {
				// TODO FIX assumes each answer is only 1 entry
				if(!data["answers"].hasOwnProperty(entry.question_id)) {
					data["answers"][entry.question_id] = {"response": entry.message, "index": entry.log_index, "id": entry.question_id}
				}
			} else {
				data["questions"][entry.question_id] = {"response": entry.message, "index": entry.log_index}
			}
			
		}

		delete data["answers"]["-1"]
		delete data["questions"]["-1"]

		// handle answers
		let answers = []
		for(let key in data["answers"]) {
			answer = data["answers"][key]
			answers.push(answer)
		}
		answers.sort(function(a, b) {return a.index > b.index})

		// handle questions
		let questions = []
		for(let key in data["questions"]) {
			q = data["questions"][key]
			questions.push(q)
		}
		questions.sort(function(a, b) {return a.index > b.index})

		return {"answers": answers, "questions": questions}
	}
});