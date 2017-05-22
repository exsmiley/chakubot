app.controller('reportController', function($scope, $routeParams, $http) {
	$scope.message = "Hi mom"
	$scope.params = $routeParams;

	// gets all of the data from the interview
	$http({
	     url: "/api/interview_data", 
	     method: "GET",
	     params: {"interviewId": $scope.params.interviewId}  
	}).then(function(res) {
		$scope.questions = format_log(res.data)
		})

	// gets a map of question ids to topics 
	$http({
	     url: "/api/question_map", 
	     method: "GET",
	}).then(function(res) {
		$scope.questionMap = res.data
		})

	function format_log(log) {
		data = {"answers": [], "questions": {}}

		for(let entry of log) {
			if(entry.from_client) {
				data["answers"].push({"response": entry.message, "index": entry.log_index, "id": entry.question_id})
			} else if(entry.question_id !== -1 && entry.question_id !== -2) {
				data["questions"][entry.question_id] = {"question": entry.message, "index": entry.log_index, "id": entry.question_id, "answers":[], "score": entry.score}
			}
			
		}

		// sort answers so they will appear in data in order
		data.answers.sort(function(a, b) {return a.index > b.index})

		// now add answers to the questions
		for(let answer of data.answers) {
			if(data.questions.hasOwnProperty(answer.id)) {
				data.questions[answer.id]["answers"].push(answer)
			}
		}

		// sort questions
		let questions = []
		for(let key in data["questions"]) {
			q = data["questions"][key]
			questions.push(q)
		}
		questions.sort(function(a, b) {return a.index > b.index})

		for(let i=0; i<questions.length; i++) {
			questions[i]["listIndex"] = i+1
		}

		return questions
	}

	// submits the entered scores for the interview to the server
	$scope.submitScores = function() {
		$http.post("/api/submitScores", {"interviewId": $scope.params.interviewId, "questions": $scope.questions}, {}).then(function(response) {
			if(response.data.success) {
				// thank user for sending
				$scope.warning = "success"
			} else {
				// say that the submit failed
				$scope.warning = "failed"
			}
		});
	}
});