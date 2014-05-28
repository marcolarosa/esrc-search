"use strict";angular.module("searchApp",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("searchApp").controller("MainCtrl",["$scope",function(){}]),angular.module("searchApp").directive("searchForm",["$rootScope","SolrService",function(a,b){return{templateUrl:"views/search-form.html",restrict:"E",scope:{help:"@",deployment:"@",site:"@"},link:function(c){c.goodToGo=b.init(c.deployment,c.site),a.$on("search-suggestion-available",function(){c.suggestion=b.suggestion}),a.$on("search-suggestion-removed",function(){c.suggestion=b.suggestion}),c.search=function(){(void 0===c.searchBox||""===c.searchBox)&&(c.searchBox="*"),b.search(c.searchBox,0,void 0,!0)},c.setSuggestion=function(a){c.searchBox=a,c.search()}}}}]),angular.module("searchApp").factory("SolrService",["$rootScope","$http","LoggerService","Configuration",function a(b,c,d,e){function f(b,c){return d.init(e.loglevel),a.site=c,void 0===b&&"production"!==b&&(b="production"),void 0===c?(d.error("Can't run! No solr_core defined!"),!1):(a.solr=e[b]+"/"+c+"/select",d.debug("Solr Service: "+a.solr),d.debug("Site: "+a.site),!0)}function g(b){var c,d,e=a.term;c="*"===e||"~"===e.substr(-1,1)?"(name:"+e+"^20 OR altname:"+e+"^10 OR locality:"+e+"^10 OR text:"+e+")":'(name:"'+e+'"^20 OR altname:"'+e+'"^10 OR locality:"'+e+'"^10 OR text:"'+e+'")';var f=o().join(" AND ");return void 0===f&&(f=""),d=void 0===a.sort?"*"===e?"name asc":"score desc":a.sort,a.resultSort=d,console.log("Sort by: ",d),c={url:a.solr,params:{q:c,start:b,rows:a.rows,wt:"json","json.wrf":"JSON_CALLBACK",fq:f,sort:d}},a.q=c,a.q}function h(e,f,k){k&&(a.suggestion=void 0,b.$broadcast("search-suggestion-removed")),(e!==a.term||0===f)&&(a.results.docs=[],a.results.start=0),a.term=e;var l=g(f);d.debug(l),c.jsonp(a.solr,l).then(function(b){0===b.data.response.numFound&&0===Object.keys(a.filters).length?1===e.split(" ").length?(i(a.term),"*"!==e&&"~"!==e.substr(-1,1)&&h(e+"~",0,!1)):j(void 0):j(b)})}function i(e){var f;f={url:a.solr,params:{q:"name:"+e,rows:0,wt:"json","json.wrf":"JSON_CALLBACK"}},d.debug("Suggest: "),d.debug(f),c.jsonp(a.solr,f).then(function(c){a.suggestion=c.data.spellcheck.suggestions[1].suggestion[0],b.$broadcast("search-suggestion-available")})}function j(c){if(void 0===c)a.results={term:a.term,total:0,docs:[]};else{var d,e;if(void 0===a.results.docs)d=c.data.response.docs;else for(d=a.results.docs,e=0;e<c.data.response.docs.length;e++)d.push(c.data.response.docs[e]);for(e=0;e<d.length;e++)d[e].sequenceNo=e;a.results={term:a.term,total:c.data.response.numFound,start:parseInt(c.data.responseHeader.params.start),docs:d}}m(),b.$broadcast("search-results-updated")}function k(){var b=a.results.start+a.rows;h(a.term,b)}function l(e){var f=g(0);f.params.facet=!0,f.params["facet.field"]=e,f.params.rows=0,d.debug(f),c.jsonp(a.solr,f).then(function(c){angular.forEach(c.data.facet_counts.facet_fields,function(c,d){for(var e=[],f=0;f<c.length;f+=2)e.push([c[f],c[f+1],!1]);a.facets[d]=e,b.$broadcast(d+"-facets-updated")})})}function m(){angular.forEach(a.facets,function(b,c){a.updateFacetCount(c)})}function n(b,c){if(void 0===a.filters[b])a.filters[b]=[c];else if(-1===a.filters[b].indexOf(c))a.filters[b].push(c);else{var d=a.filters[b].indexOf(c);a.filters[b].splice(d,1),0===a.filters[b].length&&delete a.filters[b]}a.results.docs=[],a.results.start=0,h(a.term,0,!0)}function o(){var b=[];for(var c in a.filters)b.push(c+':("'+a.filters[c].join('" OR "')+'")');return b}function p(){a.filters=[],h(a.term,0,!0),b.$broadcast("reset-all-filters")}function q(c){console.log("toggle: ",c),void 0!==c&&(a.hideDetails=c),b.$broadcast(a.hideDetails===!0?"hide-search-results-details":"show-search-results-details")}function r(){h(a.term,0)}var a={results:{},facets:{},filters:{},term:"*",rows:10,sort:void 0,resultSort:void 0,hideDetails:!1,init:f,search:h,saveData:j,nextPage:k,updateFacetCount:l,filterQuery:n,getFilterObject:o,clearAllFilters:p,toggleDetails:q,reSort:r};return a}]),angular.module("searchApp").service("LoggerService",function(){return{logLevel:"ERROR",init:function(a){this.logLevel=a},log:function(a,b){console.log(a+": ",b)},debug:function(a){"DEBUG"===this.logLevel&&this.log("DEBUG",a)},info:function(a){"INFO"===this.logLevel&&this.log("INFO",a)},error:function(a){"ERROR"===this.logLevel&&this.log("ERROR",a)}}}),angular.module("searchApp").directive("searchResults",["$rootScope","$window","SolrService",function(a,b,c){return{templateUrl:"views/search-results.html",restrict:"E",link:function(d){d.height=b.innerHeight-250,d.showFilters=!1,d.site=c.site,d.summaryActive="",d.detailsActive="active",a.$on("search-results-updated",function(){d.results=c.results,d.filters=c.getFilterObject(),d.results.docs.length!==parseInt(d.results.total)&&(d.scrollDisabled=!1)}),a.$on("show-search-results-details",function(){d.summaryActive="",d.detailsActive="active"}),a.$on("hide-search-results-details",function(){d.summaryActive="active",d.detailsActive=""}),d.toggleDetails=function(a){c.toggleDetails(a)},d.loadNextPage=function(){c.nextPage()},d.clearAllFilters=function(){c.clearAllFilters()}}}}]),angular.module("searchApp").directive("genericResultDisplay",["$rootScope","SolrService",function(a,b){return{templateUrl:"views/generic-result-display.html",restrict:"E",scope:{data:"=ngModel"},link:function(c){c.hideDetails=b.hideDetails,a.$on("show-search-results-details",function(){c.hideDetails=!1}),a.$on("hide-search-results-details",function(){c.hideDetails=!0})}}}]),angular.module("searchApp").directive("facetWidget",["$rootScope","SolrService",function(a,b){return{templateUrl:"views/facet-widget.html",restrict:"E",scope:{facetField:"@",label:"@"},link:function(c){c.isCollapsed=!0,c.displayLimit=8,c.selected=[],a.$on(c.facetField+"-facets-updated",function(){var a,d=b.facets[c.facetField];for(a=0;a<d.length;a++)-1!==c.selected.indexOf(d[a][0])&&(d[a][2]=!0);for(a=0;a<d.length;a++)d=0===d[a][1]&&a<c.displayLimit?d.slice(0,a):d.slice(0,c.displayLimit);c.facets=d,b.facets[c.facetField].length>c.displayLimit&&(c.moreResults=!0)}),a.$on("reset-all-filters",function(){for(var a=0;a<c.facets.length;a++)c.facets[a][2]=!1,c.selected=[]}),b.updateFacetCount(c.facetField),c.showAll=function(){c.facets=b.facets[c.facetField],c.moreResults=!1},c.facet=function(a){-1===c.selected.indexOf(a)?c.selected.push(a):c.selected.splice(c.selected.indexOf(a),1),b.filterQuery(c.facetField,a);for(var d=0;d<c.facets.length;d++)c.facets[d][0]===a&&(c.facets[d][2]=!0)}}}}]),angular.module("searchApp").constant("Configuration",{production:"https://data.esrc.unimelb.edu.au/solr",testing:"https://data.esrc.info/solr",loglevel:"DEBUG"}),angular.module("searchApp").directive("searchFilters",function(){return{templateUrl:"views/search-filters.html",restrict:"E",scope:{filter:"@"},link:function(a){var b=a.filter.split(",");a.filters=[];for(var c=0;c<b.length;c++)a.filters.push(-1!==b[c].indexOf(":::")?{field:b[c].split(":::")[0],label:b[c].split(":::")[1]}:{field:b[c],label:b[c]})}}}),angular.module("searchApp").directive("sortResults",["$rootScope","SolrService",function(a,b){return{templateUrl:"views/sort-results.html",restrict:"E",link:function(c){c.sortBy=b.resultSort,a.$on("search-results-updated",function(){c.sortBy=b.resultSort}),c.sort=function(){b.sort=c.sortBy,b.reSort()}}}}]);