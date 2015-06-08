'use strict';

angular.module('myApp.wall', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/wall/:wallid', {
    templateUrl: 'wall/wall.html',
    controller: 'WallController'
  });
}])

.controller('WallController', ['$scope', '$window', '$firebase', '$routeParams',
	function($scope, $window, $firebase, $routeParams) {

	var chatRooms = new Firebase("https://psuedochat.firebaseio.com/chatRooms");

	$scope.roomName = $routeParams.wallid;
	$scope.userName = 'Tester';
	$scope.voiceChoice = 1;
	$scope.LOADED = false;
	$scope.RECORDING = false;
	$scope.randomize = false;
	$scope.language = "en-US"

	$scope.languages = {'English': "en-US", '中文':'cmn-Hans-CN'}

	$scope.setLanguage = function(key) {
		$scope.language = $scope.languages[key];
	}


	$scope.randomizeVoice = function () {
		if ($scope.randomize) {
			$scope.randomize = false;
		} else {
			$scope.randomize = true;
		}

	}





	var chatRoom = chatRooms.child($scope.roomName);
 
  var msgsSync = $firebase(chatRoom.child('chatMessages').limitToLast(8));
  $scope.chatMessages = msgsSync.$asArray();

	$scope.chatMessages.$loaded().then(function(result) {
		$scope.LOADED = true;
		result.$watch(function(event){
			if (event.event == "child_added") {
				var msg = new SpeechSynthesisUtterance($scope.chatMessages.$getRecord(event.key).message);
				// msg.lang = $scope.chatMessages.$getRecord(event.key).language;
				if ($scope.randomize == true) {
					$scope.voiceChoice = Math.floor(Math.random() * window.speechSynthesis.getVoices().length);
				}
			msg.voice = window.speechSynthesis.getVoices()[$scope.voiceChoice];
	  	window.speechSynthesis.speak(msg);
			}
		})

	});



  var recognition = new webkitSpeechRecognition();
  var ignore_onend = false;
  $scope.final_transcript = ''

  $scope.final_span = ''
  $scope.interim_span = ''

  recognition.continuous = true;
	recognition.interimResults = true;

  recognition.onstart = function() {
    $scope.RECORDING = true;
    $scope.$apply();
  };


  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      ignore_onend = true;
    }
  };



  recognition.onend = function() {
    $scope.RECORDING = false;
    if (ignore_onend) {
      return;
    }
    if (!$scope.final_transcript) {
      return;
    }


    msgsSync.$push({
      postedby: $scope.userName,
      message: $scope.final_transcript,
      language: $scope.language
  	});

  };

 	recognition.onresult = function(event) {
    var interim_transcript = '';

    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        $scope.final_transcript += event.results[i][0].transcript;
        $scope.$apply();
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    $scope.final_transcript = capitalize($scope.final_transcript);
    $scope.final_span = linebreak($scope.final_transcript);
    $scope.interim_span = linebreak(interim_transcript);
    $scope.$apply();
  };
 

  var two_line = /\n\n/g;
	var one_line = /\n/g;
	function linebreak(s) {
	  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
	}
	var first_char = /\S/;
	function capitalize(s) {
	  return s.replace(first_char, function(m) { return m.toUpperCase(); });
	}


 
  $scope.sendMessage = function($event) {

    if ($scope.RECORDING) {
	    recognition.stop();


	    return;
	  }

	  $scope.final_transcript = '';
	  recognition.lang = $scope.language;
	  recognition.start();
	  $scope.ignore_onend = false;
	  $scope.final_span = '';
	  $scope.interim_span = '';


  };

}]);

