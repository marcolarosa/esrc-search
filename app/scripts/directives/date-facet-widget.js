'use strict';

angular.module('searchApp')
  .directive('dateFacetWidget', [ '$log', 'SolrService', function ($log, SolrService) {
    return {
      templateUrl: 'views/date-facet-widget.html',
      restrict: 'E',
      scope: {
          facetField: '@',
          existenceFromField: '@',
          existenceToField: '@',
          id: '@',
          label: '@',
          start: '@',
          end: '@',
          interval: '@',
          isCollapsed: '@',
          alwaysOpen: '@',
      },
      link: function postLink(scope, element, attrs) {
          // configure defaults for those optional attributes if not defined
          scope.ao = scope.alwaysOpen === undefined                         ? false : angular.fromJson(scope.alwaysOpen);
          scope.ic = scope.isCollapsed === undefined                       ? true  : angular.fromJson(scope.isCollapsed);

          if (scope.start === undefined) {
              $log.error('start not defined. Need to pass in a year from which to start the facetting.');
          }
          if (scope.interval === undefined) {
              $log.error('interval not defined. Need to pass in an interval for the range facetting.');
          }
          if (scope.id === undefined) {
              $log.error('id not defined. Need to pass in an id for the range facetting.');
          }
          scope.facetRangeEnd = _.isEmpty(scope.end) ? new Date().getFullYear() : scope.end;

          scope.$on(scope.facetField + '_' + scope.id + '-facet-data-ready', function() {
              var data = SolrService.query.dateFacets[scope.facetField + '_' + scope.id];
              scope.facets = _.map(data, function(d) {
                  return {
                      'start': d.rangeStart,
                      'end': d.rangeEnd,
                      'label': d.rangeStart + ' - ' + d.rangeEnd,
                      'count': d.count,
                      'checked': false
                  }
              });
          });

          // handle open / close broadcasts
          scope.$on('open-all-filters', function() {
              scope.ic = false;
          })
          scope.$on('close-all-filters', function() {
              scope.ic = true;
          })

          // on reset, reinit the widget
          scope.$on('reset-all-filters', function() {
              SolrService.compileDateFacets(scope.facetField, scope.id, scope.start, scope.facetRangeEnd, scope.interval);
          });

          // apply the clicked facet
          scope.facet = function(facetLabel) {
              SolrService.filterDateQuery(scope.facetField, scope.existenceFromField, scope.existenceToField, facetLabel);
          }

          // initialise the widget 
          SolrService.compileDateFacets(scope.facetField, scope.id, scope.start, scope.facetRangeEnd, scope.interval);

      }
    };
  }]);
