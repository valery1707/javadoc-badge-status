'use strict';

// Declare app level module which depends on views, and components
angular.module('javadocBadgeApp', [
	'ngRoute',
	'ngResource',
	'javadocBadgeApp.view1',
	'javadocBadgeApp.view2'
]).
config(['$routeProvider', function ($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/view1'});
}]).

// #status
factory('Status', ['$resource', function ($resource) {
	return $resource('api/status', {}, {
		query: {method: 'GET', params: {}, isArray: false}
	});
}]).
controller('StatusCtrl', ['$scope', 'Status', function ($scope, Status) {
	$scope.status = Status.query();
}]).

// #status/uptime
factory('Uptime', ['$resource', function ($resource) {
	return $resource('api/status/uptime', {}, {
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
}])
;
