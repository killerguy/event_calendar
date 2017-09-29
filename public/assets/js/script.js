// Initializing Angular App
var app = angular.module('event_calendar', ['ngRoute', 'angularMoment']).run(function($rootScope, $location){
  // Setting current year and month at rootscope for global scope variable
  $rootScope.currentYear = moment().format("Y");
  $rootScope.currentMonth = moment().format("M")-1;
  $rootScope.baseUrl = $location.protocol() + '://'+ $location.host() +':'+  $location.port();
});

//Route
app.config(function($routeProvider) {
    $routeProvider
        .when('/:year?/:month?', {
            templateUrl : 'pages/calendar.html',
            controller  : 'calendar'
        });
});


// Calendar Controller
app.controller('calendar', function ($scope, $rootScope, $http, $location, $routeParams) {
  $scope.generateCalendar = function(year, month){
    $scope.commonData = {};
    $scope.event = {title: '', description: ''};
    var weeks = [];
    var startWeek = moment([year, month]).startOf('month').week();
    var endWeek = moment([year, month]).endOf('month').week();

    if (month == 11){
      var endWeek = moment([year, month]).subtract((parseInt(year)+1) - moment().format("Y"), 'Y').endOf('month').week();
    }

    for(var week = startWeek; week<=endWeek;week++){
      weeks.push({
        week:week,
        days:Array(7).fill(0).map(function(n, i) {
          var day =  moment([year, month]).week(week).startOf('week').clone().add(n + i, 'day');
          return {"date": day.format("D"), "month": day.format("M"), "year": day.format("Y"), "day": day.format("dddd"), "events": []};
        })
      })
    }

    $scope.commonData.filteredYear = year;
    $scope.commonData.filteredMonth = month;
    $scope.commonData.filteredMonthName = moment([year, month]).format("MMMM");
    $scope.weeks = weeks;
    console.log(weeks);
  };

  // First time call for current month's calendar
  if($routeParams.year && $routeParams.month){
    $rootScope.currentYear = $routeParams.year;
    $rootScope.currentMonth = $routeParams.month;
  }
  $scope.generateCalendar($rootScope.currentYear, $rootScope.currentMonth);
  $http.get($rootScope.baseUrl + '/events', {params: {year: $rootScope.currentYear, month: (parseInt($rootScope.currentMonth)+1)}}).then(function(response) {
    if(response.data.status == 2000){
      for(var i=0; i<response.data.data.length; i++){
        $scope.weeks[response.data.data[i].weeksIndex].days[response.data.data[i].dayIndex].events.push(response.data.data[i]);
      }
    }
  });

  // Call for next month's calendar
  $scope.nextMonth = function(){
    var newDate = moment([$scope.currentYear, $scope.currentMonth]).add(1, 'M');
    $rootScope.currentYear = newDate.format("Y");
    $rootScope.currentMonth = newDate.format("M")-1;

    $location.path('/'+$rootScope.currentYear+'/'+$rootScope.currentMonth).replace();
  };

  // Call for previous month's calendar
  $scope.previousMonth = function(){
    var newDate = moment([$scope.currentYear, $scope.currentMonth]).subtract(1, 'M');
    $rootScope.currentYear = newDate.format("Y");
    $rootScope.currentMonth = newDate.format("M")-1;

    $location.path('/'+$rootScope.currentYear+'/'+$rootScope.currentMonth).replace();
  };

  // Call for add event
  $scope.addEvent = function(year, month, date, weeksIndex, dayIndex){
    $scope.triggeredCell = {year: year, month: month, date: date, weeksIndex: weeksIndex, dayIndex: dayIndex};
  };

  // Call for save event
  $scope.saveEvent = function(){
    $scope.triggeredCell.title = $scope.event.title;
    $scope.triggeredCell.description = $scope.event.description;

    $http.post($rootScope.baseUrl + '/events/create', $scope.triggeredCell).then(function(response) {
      if(response.data.status == 2001){
        $scope.weeks[response.data.data.weeksIndex].days[response.data.data.dayIndex].events.push(response.data.data);
        $scope.event = {title: '', description: ''};
        jQuery('#eventModal').modal('hide');
      }
    });
  }
});