'use strict';

angular.module('javadocBadgeApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'UptimeCtrl'
  });
}])

.controller('View1Ctrl', [function() {

}]);