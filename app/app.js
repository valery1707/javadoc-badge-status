'use strict';

var apiBaseUrl = '//javadoc-emblem.rhcloud.com/api/v1';

// Declare app level module which depends on views, and components
angular.module('javadocBadgeApp', [
	'ngRoute',
	'ngResource'
	, 'chart.js'
]).
config(['$routeProvider', function ($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/view1'});
}]).

// #status
factory('Status', ['$resource', function ($resource) {
	return $resource(apiBaseUrl + '/status', {}, {
		query: {method: 'GET', params: {}, isArray: false}
	});
}]).
controller('StatusCtrl', ['$scope', 'Status', function ($scope, Status) {
	$scope.status = Status.query();
}]).

// #status/uptime
factory('Uptime', ['$resource', function ($resource) {
	return $resource(apiBaseUrl + '/status/uptime', {}, {
		query: {
			method: 'GET',
			params: {},
			isArray: false,
			cache: false,
			responseType: 'text',
			transformResponse: function (data, headersGetter) {
				//todo Transform to duration
				return {value: data};
			}
		}
	});
}]).
controller('UptimeCtrl', ['$scope', 'Uptime', function ($scope, Uptime) {
	$scope.uptime = Uptime.query();
}]).

// #status/memory
factory('Memory', ['$resource', function ($resource) {
	return $resource(apiBaseUrl + '/status/memory', {}, {
		query: {
			method: 'GET',
			params: {},
			isArray: false,
			cache: false
		}
	});
}]).
controller('MemoryCtrl', ['$scope', '$interval', 'Memory', function ($scope, $interval, Memory) {
	var toChart = function (data) {
		$scope.labels = [
			"Max: " + formatBytes_1024($scope.memory.max),
			"Total: " + formatBytes_1024($scope.memory.total),
			"Used: " + formatBytes_1024($scope.memory.used)
		];
		$scope.data = [
			$scope.memory.max - $scope.memory.total,
			$scope.memory.total - $scope.memory.used,
			$scope.memory.used
		];
	};
	$scope.options = {
		tooltipTemplate: "<%= label %>"
	};
	$scope.update = function () {
		$scope.memory = Memory.query(function (data) {
			toChart(data);
		});
	};
	$scope.refreshEnabled = false;
	$scope.refreshFn = null;
	$scope.refresh = function () {
		var wasEnabled = $scope.refreshEnabled;
		$scope.refreshEnabled = !$scope.refreshEnabled;
		if (wasEnabled) {
			$interval.cancel($scope.refreshFn);
		} else {
			$scope.refreshFn = $interval($scope.update, 5000);
			$scope.update();
		}
	};
	$scope.memory = Memory.query(function () {
		toChart($scope.memory);
	});
}])
;
