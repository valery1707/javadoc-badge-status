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
		$scope.labels.push(new Date().toISOString());
		$scope.data[0].push($scope.memory.max);
		$scope.data[1].push($scope.memory.total);
		$scope.data[2].push($scope.memory.used);
		if ($scope.type == 'Bar' && $scope.labels.length > 3) {
			$scope.type = 'Line';
		}
	};
	$scope.labels = [];
	$scope.series = ["Max", "Total", "Used"];
	$scope.data = [[], [], []];
	$scope.type = 'Bar';
	$scope.options = {
		animation: false,
		showScale: false,
		multiTooltipTemplate: "<%= formatBytes_1024(value) %>"
	};
	$scope.update = function () {
		$scope.memory = Memory.query(function (data) {
			toChart(data);
		});
	};
	$scope.refreshEnabled = false;
	var refreshFn;
	$scope.refreshStart = function () {
		if (angular.isDefined(refreshFn)) {
			return;
		}
		$scope.refreshEnabled = true;
		refreshFn = $interval($scope.update, 5000);
		$scope.update();
	};
	$scope.refreshStop = function () {
		$scope.refreshEnabled = false;
		if (angular.isDefined(refreshFn)) {
			$interval.cancel(refreshFn);
			refreshFn = undefined;
		}
	};
	$scope.refreshTrigger = function () {
		if ($scope.refreshEnabled) {
			$scope.refreshStop();
		} else {
			$scope.refreshStart();
		}
	};
	$scope.$on('$destroy', function () {
		// Make sure that the interval is destroyed too
		$scope.refreshStop();
	});
	$scope.update();
}])
;
