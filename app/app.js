'use strict';

var apiBaseUrl = '//javadoc-emblem.rhcloud.com/api/v1';

// Declare app level module which depends on views, and components
angular.module('javadocBadgeApp', [
	'ngRoute',
	'ngResource'
	, 'angularChart'
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
	$scope.update = function () {
		$scope.uptime = Uptime.query();
	};
	$scope.update();
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
		$scope.options_chart.data.push({
			max: $scope.memory.max,
			total: $scope.memory.total,
			used: $scope.memory.used,
			date: new Date()
		});
	};
	$scope.options_chart = {
		data: [],
		dimensions: {
			max: {
				type: 'spline',
				dataType: 'numeric',
				displayFormat: formatBytes_1024
			},
			total: {
				type: 'area-spline',
				dataType: 'numeric',
				displayFormat: formatBytes_1024
			},
			used: {
				type: 'spline',
				dataType: 'numeric',
				displayFormat: formatBytes_1024
			},
			date: {
				dataType: 'datetime',
				axis: 'x',
				displayFormat: function (x) {
					var s = x.toISOString();
					return s.substring(0, s.indexOf('.')).replace('T', ' ');
				}
			}
		}
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
		refreshFn = $interval($scope.update, 60 * 1000);
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
