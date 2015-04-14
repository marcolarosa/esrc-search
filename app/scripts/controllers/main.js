'use strict';

angular.module('searchApp')
  .controller('MainCtrl', [ '$rootScope', '$scope', '$window', '$location', 'SolrService',
    function ($rootScope, $scope, $window, $location, SolrService) {
      $scope.ready = false;

      var w = angular.element($window);
      w.bind('resize', function() {
          $scope.$apply(function() {
            sizeThePanels();
          })
      });

      var sizeThePanels = function() {
          $scope.w = $window.innerWidth;
          $scope.h = $window.innerHeight;

          if ($scope.w < 760) {
              /*
              var site = $window.location.hash.split('/')[1];
              var newLocation; 
              if (site !== '') {
                $window.location.replace('/basic-search/#/' + site);
              } else {
                $window.location.replace('/basic-search');
              }
              */
          } else {
              $scope.t = 120;
          }

          $scope.topbarStyle = {
              'position': 'absolute',
              'top':      '0px',
              'left':     '0px',
              'width':    '100%',
              'z-index':  '10000',
              'padding':  '0px 10px'
          }
          $scope.bodypanelStyle = {
              'position':     'absolute',
              'top':          $scope.t + 'px',
              'left':         '0px',
              'width':        '100%',
              'height':       $scope.h - $scope.t + 'px',
              'overflow-y':   'scroll',
              'padding':      '0px 15px'
          }
      }
      sizeThePanels();

      /* handle summary / detail view toggle */
      $scope.$on('show-search-results-details', function() {
          $scope.detailsActive = false;
      });
      $scope.$on('hide-search-results-details', function() {
          $scope.detailsActive = true;
      });
      $scope.$on('site-name-retrieved', function() {
          if (SolrService.site === 'ESRC') {
              $scope.site_name = 'Search the datasets.';
              $scope.site_url = $location.absUrl();
              $scope.returnToSiteLink = false;
          } else {
              $scope.site_name = 'Search: ' + SolrService.site_name;
              $scope.site_url = SolrService.site_url;
              $scope.returnToSiteLink = true;
          }
      })
      $scope.$on('app-ready', function() {
          $scope.ready = true;

          // get the data structures defining the date and normal facet widgets
          $scope.facetWidgets = SolrService.configuration.facetWidgets;
          $scope.dateFacetWidgets = SolrService.configuration.dateFacetWidgets;
      });

      /* button methods */
      $scope.toggleDetails = function() {
          SolrService.toggleDetails();
      };

      $scope.clearAllFilters = function() {
        SolrService.reset();
      };
      $scope.openAllFilters = function() {
          $rootScope.$broadcast('open-all-filters');
      }
      $scope.closeAllFilters = function() {
          $rootScope.$broadcast('close-all-filters');
      }
      $scope.search = function() {
        if ($scope.ready) SolrService.search();
      }

      // get the party started
      SolrService.init();

  }]);
