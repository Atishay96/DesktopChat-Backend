app.controller('index', function($scope,$http){
	$scope.submit = function(){
		if(!$scope.phoneNumber){
			return message("please enter your phoneNumber");
		}
		if($scope.stopClick){
			return;
		}
		$scope.stopClick = true;
		$http({
			url: '/api/verifyPhoneNumber',
			method: 'post',
			data:{
				phoneNumber: $scope.phoneNumber
			}
		}).success(function(dataset, status){
			console.log('status');
			if(status == 202){
				redirect('signup');
			}else{
				redirect('login');
			}
			$scope.stopClick = false;
		}).error(function(err, status){
			$scope.stopClick = false;
			console.log(err, status);
		})
	}
});