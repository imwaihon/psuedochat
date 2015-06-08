'use strict';

angular.module('myApp.main', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/main', {
    templateUrl: 'main/main.html',
    controller: 'MainController'
  });
}])

.controller('MainController', ['$scope', '$window', '$firebase', function($scope, $window, $firebase) {
	var chatRooms = new Firebase("https://psuedochat.firebaseio.com/chatRooms");

	$scope.create_name = ''

	$scope.createRoom = function () {

	}


}]);