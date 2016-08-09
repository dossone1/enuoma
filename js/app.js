// Ionic Starter App
angular.module('underscore', [])
.factory('_', function() {
  return window._; // assumes underscore has already been loaded on the page
});

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('enuoma', [
  'ionic',
  'angularMoment',
  'enuoma.controllers',
  'enuoma.directives',
  'enuoma.filters',
  'enuoma.services',
  'enuoma.factories',
  'enuoma.config',
  'enuoma.views',
  'underscore',
  'ngResource',
  'ngCordova',
  'slugifier'
  ])

.run(function($ionicPlatform, PushNotificationsService, $rootScope, $ionicConfig, $timeout) {

  $ionicPlatform.on("deviceready", function(){
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
	navigator.splashscreen.show();
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

  });
	
  $ionicPlatform.on("resume", function(){
    
	PushNotificationsService.register();
  });

})


.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider

  //INTRO
  .state('auth', {
    url: "/auth",
    templateUrl: "views/auth/auth.html",
    abstract: true,
    controller: 'AuthCtrl'
  })

  .state('auth.walkthrough', {
    url: '/walkthrough',
    templateUrl: "views/auth/walkthrough.html"
  })

  .state('app.login', {
    url: '/login',
	views: {
      'menuContent': {
       templateUrl: "views/app/login.html",
   		controller: 'LoginCtrl'
      }
    }
   
  })

  .state('app.forgot-password', {
    url: "/forgot-password",
    views: {
		'menuContent': {
		templateUrl: "views/app/forgot.html",
    	controller: 'ForgotPasswordCtrl'
		}
	}
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "views/app/left-menu.html",
    controller: 'AppCtrl'
  })

  //MISCELLANEOUS
  .state('app.miscellaneous', {
    url: "/miscellaneous",
    views: {
      'menuContent': {
        templateUrl: "views/app/miscellaneous/miscellaneous.html"
      }
    }
  })

  .state('app.maps', {
    url: "/miscellaneous/maps",
    views: {
      'menuContent': {
        templateUrl: "views/app/miscellaneous/maps.html",
        controller: 'MapsCtrl'
      }
    }
  })

  .state('app.image-picker', {
    url: "/miscellaneous/image-picker",
    views: {
      'menuContent': {
        templateUrl: "views/app/miscellaneous/image-picker.html",
        controller: 'ImagePickerCtrl'
      }
    }
  })

  //LAYOUTS
  .state('app.search', {
    url: "/search",
    views: {
      'menuContent': {
        templateUrl: "views/app/search.html",
		controller: 'SearchCtrl'
      }
    }
  })

  .state('app.tinder-cards', {
    url: "/layouts/tinder-cards",
    views: {
      'menuContent': {
        templateUrl: "views/app/layouts/tinder-cards.html",
        controller: 'TinderCardsCtrl'
      }
    }
  })

  .state('app.slider', {
    url: "/layouts/slider",
    views: {
      'menuContent': {
        templateUrl: "views/app/layouts/slider.html"
      }
    }
  })

  //FEEDS
  .state('app.item-list', {
    url: "/item-list",
    views: {
      'menuContent': {
        templateUrl: "views/app/item-list.html",
        controller: 'FeedsCategoriesCtrl'
      }
    }
  })

  .state('app.category-list', {
    url: "/category-list/:categoryId/:categoryTitle",
    views: {
      'menuContent': {
        templateUrl: "views/app/category-list.html",
        controller: 'CategoryListCtrl'
      }
    }
  })
	
	 .state('app.category-details', {
    url: "/category-details/:categoryId/:categoryTitle",
	  views: {
      'menuContent': {
        templateUrl: "views/app/category-details.html",
        controller: 'CategoryDetailsCtrl'
      }
    }
  })

  .state('app.categories', {
    url: "/categories",
    views: {
      'menuContent': {
        templateUrl: "views/app/category-view.html",
        controller: 'CategoriesCtrl'
      }
    }
  })

	  //PRODUCT DETAILS
  .state('app.prd-details', {
    url: "/details/:prdId/:prdTitle",
    views: {
      'menuContent': {
        templateUrl: "views/app/prd_details.html",
        controller: 'DetailsCtrl'
      },
    resolve: {
      post_data: function(PostService, $ionicLoading, $stateParams) {
        $ionicLoading.show({
      		template: 'Loading product ...'
      	});

        var prdId = $stateParams.prdId;
		$scope.prdId = prdId;
        return PostService.getProduct(prdId);
      }
    }
	
    }
  })

  //PRODUCT LIST
  .state('app.products', {
    url: "/products",
    views: {
      'menuContent': {
        templateUrl: "views/app/products.html",
        controller: 'ProductCtrl'
      }
    }
  })

  .state('app.post', {
    url: "/wordpress/:postId",
    views: {
      'menuContent': {
        templateUrl: "views/app/wordpress/wordpress_post.html",
        controller: 'WordpressPostCtrl'
      }
    },
    resolve: {
      post_data: function(PostService, $ionicLoading, $stateParams) {
        $ionicLoading.show({
      		template: 'Loading post ...'
      	});

        var postId = $stateParams.postId;
		
        return PostService.getPost(postId);
      }
    }
  })
  

  //OTHERS
  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "views/app/setting.html",
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.signup', {
    url: "/signup",
    views: {
      'menuContent': {
        templateUrl: "views/app/signup.html",
		controller: 'SignupCtrl'
      }
    }
  })

  .state('app.profile', {
    url: "/profile",
    views: {
      'menuContent': {
        templateUrl: "views/app/profile.html"
      }
    }
  })

  .state('app.basket', {
    url: "/basket",
    views: {
      'menuContent': {
        templateUrl: "views/app/basket.html",
        controller: 'BasketCtrl'
      }
    }
  })

;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/products');
  
  
});
