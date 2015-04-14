'use strict';

angular.module('searchApp')
  .directive('searchResults', [ '$rootScope', '$window', 'SolrService', function ($rootScope, $window, SolrService) {
    return {
      templateUrl: 'views/search-results.html',
      restrict: 'E',
      scope: {
      },
      link: function postLink(scope, element, attrs) {

          // Initialise the widget / defaults
          scope.showFilters = false;
          scope.site = SolrService.site;
          scope.summaryActive = '';
          scope.detailsActive = 'active';

          // put a watch on results.dateStamp to do stuff when it changes
          scope.$watch(function() { return SolrService.results.dateStamp;}, function() {
              // data updated - do fancy things

              // but if any of the results has undefined for the thumbnail - ditch it
              var thumbs = _.groupBy(SolrService.results.docs, function(d) { return d.thumbnail; });
              scope.gridView = _.has(thumbs, 'undefined') ? false : true;

              // grab the filter object
              scope.filters = SolrService.getFilterObject();

              // save the data in scope
              scope.results = SolrService.results;

          }, true);

          // handle suggestions
          scope.$on('search-suggestion-available', function() {
              scope.suggestion = SolrService.suggestion;
          });
          scope.$on('search-suggestion-removed', function() {
              scope.suggestion = SolrService.suggestion;
          });

          /* handle summary / detail view toggle */
          scope.$on('show-search-results-details', function() {
              scope.summaryActive = '';
              scope.detailsActive = 'active';
          });
          scope.$on('hide-search-results-details', function() {
              scope.summaryActive = 'active';
              scope.detailsActive = '';
          });

          scope.setSuggestion = function(suggestion) {
              SolrService.search(suggestion, 0, true);
          };

          scope.loadNextPage = function() {
              SolrService.nextPage();
          };

          scope.clearAllFilters = function() {
            SolrService.clearAllFilters();
          };

      }
    };
  }]);
