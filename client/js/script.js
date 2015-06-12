var mdToHtml = function (arr) {

    var converter = new Showdown.converter();

    return arr.map(function (value) {

        value.body = converter.makeHtml(value.body);
        return value;
    });
};    

var getCookie = function(name) {

  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();

};

var checkCookie = function($rootScope) {

    var value = getCookie('uniqueUser') && (getCookie('uniqueUser') !== 'undefined');
    $rootScope.$broadcast('set/login', value);
};

var today;

angular.module('DuckSoup', ['ngSanitize','ngRoute'])
    .config(['$routeProvider', function( $routeProvider ) {
        $routeProvider
            .when('/', {
                templateUrl: '../home.html',
                controller: 'HomeController'
            })
            .when('/posts/:post_id', {
                templateUrl: '../post.html',
                controller: 'PostController'
            })
            .when('/posts/edit/:post_id', {
                templateUrl: '../post.html',
                controller: 'PostController'
            })
            .when('/posts/new/', {
                templateUrl: '../post.html',
                controller: 'PostController'
            })
            .otherwise({
                redirectTo: '/'
            })
            ;
    }])
    .controller('HomeController', ['$scope', '$rootScope', '$http', '$log', function($scope, $rootScope, $http, $log){

        $rootScope.mode = 'LIST';
        $rootScope._id  = undefined;

        // fetching the profile 
        $http.get('/api/profile/')        
            .success(function(data, status, headers, config) {

                $scope.profile = data[0];
            })
            .error(function(data, status, headers, config) {

                $log.log('error');
            })
            ;

        // fetching all the posts
        $http.get('/api/posts/')        
            .success(function(data, status, headers, config) {

                $scope.error = false;

                if (data.error) {

                    $scope.error = true;

                } else {

                    $scope.posts = mdToHtml(data);

                }
                
            })
            .error(function(data, status, headers, config) {

                $log.log('error');
            })
            ;

        $scope.$on('submit/search', function( e, searchText ) {

            $scope.searchText = searchText;
        });    
    }])
    .controller('PostController', ['$scope', '$rootScope', '$http', '$log', '$window', '$routeParams', function($scope, $rootScope, $http, $log, $window, $routeParams){

        var postObj
        ,   path
        ;

        $scope.updatePost = function(commentFlag) {

            postObj = {};
            path = $rootScope.mode === 'EDIT' || commentFlag ? '/api/posts/' + $routeParams.post_id : '/api/posts/';   

            if(commentFlag) {
                postObj.comments = $scope.post.comments;
            } else {
                postObj.content = $('textarea').val();
                postObj.minread = Math.ceil( postObj.content.split(' ').length / 180 );
            }
            

            // send postdata
            $http.post(path, postObj)        
                .success(function(data, status, headers, config) {

                    $scope.status = 'true';
                })
                .error(function(data, status, headers, config) {

                    $scope.status = 'false';
                    $log.log('error');
                })
                ;
        };

        $scope.$on('click/publish', function( e ) {

            e.preventDefault();
            $scope.updatePost();
        });

        $scope.$on('click/delete', function( e ) {

            e.preventDefault();


            path = '/api/posts/' + $routeParams.post_id;

            // delete request
            $http.delete(path)        
                .success(function(data, status, headers, config) {

                    $window.location.hash = '#/';
                })
                .error(function(data, status, headers, config) {

                    $log.log('error');
                })
                ;
        });

        $scope.letsLove = function() {

            path = '/api/profile';
            postObj = {};
            postObj.loveIncreament = true;

            $http.post(path, postObj)        
                .success(function(data, status, headers, config) {

                    console.log('success');
                })
                .error(function(data, status, headers, config) {

                    
                    console.log('error');
                })
        }

        if ($window.location.hash === '#/posts/new') {  // new

            $rootScope.mode = 'NEW';
            $rootScope._id  = undefined;

        } else if ($window.location.hash.indexOf('#/posts/edit/') !== -1) { // edit
            
            $rootScope.mode = 'EDIT';
            $rootScope._id  = $routeParams.post_id;

            // fetching post with post_id
            $http.get('/api/posts/' + $routeParams.post_id)        
                .success(function(data, status, headers, config) {

                    $scope.post = data[0];
                })
                .error(function(data, status, headers, config) {

                    $log.log('error');
                })
                ;

        } else {    // read

            $rootScope.mode = 'READ';
            $rootScope._id  = $routeParams.post_id;

            // fetching post with post_id
            $http.get('/api/posts/' + $routeParams.post_id)        
                .success(function(data, status, headers, config) {

                    $scope.post = mdToHtml(data)[0];
                })
                .error(function(data, status, headers, config) {

                    $log.log('error');
                })
                ;
        }

    }])
    .directive('editbox', ['$timeout', function($timeout) {

        return {
            restrict: 'E',
            // transclude: true,
            templateUrl: function(element, attr){

                return '../views/editbox.html';   
            },
            link: function( scope, element, attr ){

                scope.clickComment = function() {

                    // empty comments
                    if(!scope.boxBody.trim()) { return; }

                    var commentObj = {};

                    commentObj.user = scope.commentUser || 'Guest';
                    commentObj.body = scope.boxBody;
                    commentObj.time = (new Date()).toUTCString();

                    scope.post.comments.push(commentObj);

                    scope.boxBody = '';

                    scope.updatePost(true);

                };

                scope.rows = attr.lines;
                var el = $('textarea', element);
                var initialHeight = initialHeight || el.height();
                var resize = function() { 

                    el.height(initialHeight + 'px');
                    el.height(el.prop('scrollHeight') + 'px');
                };

                el.on("blur keyup change", resize);
                $timeout(resize, 0);
            }
        };     
    }])        
    .directive('commentbox', [function() {

        return {
            restrict: 'E',
            templateUrl: function(element, attr){

                return '../views/comment.html';   
            },
            link: function( scope, element, attr ){
            }
        };     
    }])        
    .directive('navigation', ['$rootScope', '$http', function($rootScope, $http) {

        return {
            restrict: 'E',
            templateUrl: function(element, attr){

                return '../views/navigation.html';   
            },
            link: function( scope, element, attr ){

                var setLogin = function(value) {
                    scope.loggedIn = value;
                };

                scope.$on('set/login', function( e, value ) {

                    setLogin(value);
                });

                scope.searchForm = function(e) {
                    var searchText = $(e.target).find('input').val();
                    $rootScope.$broadcast('submit/search', searchText);
                };

                scope.loginForm = function(e) {
                    var formdata = $(e.target).serializeArray();
                    var login = {};
                    
                    login[formdata[0].name] = formdata[0].value;
                    login[formdata[1].name] = formdata[1].value;

                    // authentication
                    $http.get('/api/auth', {params: login})        
                        .success(function(data, status, headers, config) {

                            setLogin(!data.error);
                        })
                        .error(function(data, status, headers, config) {

                            setLogin(false);
                        })
                        ;
                };

                // check whether the user is logged in or not
                checkCookie($rootScope);

            }
        };     
    }])        
    ;