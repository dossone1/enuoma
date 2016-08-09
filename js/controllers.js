angular.module('enuoma.controllers', [])

.controller('AuthCtrl', function($scope, $ionicConfig) {

})

// APP
.controller('AppCtrl', function($scope,$state, $cordovaDialogs,$window, $ionicConfig) {
$scope.loginState = 'false';
if(window.localStorage.getItem("loginState") == 'true' )
{
		$scope.loginState = 'true';
}

	// Triggered on a the logOut button click
	$scope.showLogOutMenu = function() {
		
		
			var confirmation = $cordovaDialogs.confirm('Are you sure you want to logout?', 'Attention!', [' Yes ',' Cancel '])
    .then(function(buttonIndex) {
      // no button = 0, 'OK' = 1, 'Cancel' = 2
      var btnIndex = buttonIndex;
	  if(btnIndex == 1)
	  {
			window.localStorage.removeItem("userToken");
				window.localStorage.removeItem("userID");
				window.localStorage.removeItem("loginState");
				$window.location.reload(true);
	  
	  }
		}); // end of confirm then
		

	};	


})

//LOGIN
.controller('LoginCtrl', function($scope, $ionicLoading, $state,$cordovaDialogs, $window, PostService) {
	
	$scope.user = {};
		
	if(window.localStorage.getItem("loginState") == 'true')
	{
		$state.go('app.products');
		
	}
	
	// We need this for the form validation
      // calling our submit function.
        $scope.doLogIn = function() {
	
	this.user.subm = 'submit';
	$ionicLoading.show({ template: 'Authenticating...'});
	     // Posting data to php file
    	
	   PostService.doLogin(this.user)
		.then(function(data){
			
			$scope.info = data.info;
						
		if($scope.info.msg == 'true')
			{
				window.localStorage.setItem("userToken", $scope.info.token);
				window.localStorage.setItem("userID", $scope.info.userid);
				window.localStorage.setItem("loginState", 'true');
				$ionicLoading.hide();
				$ionicLoading.show({ template: 'Login Successful..', duration: 1000});
			
				$window.location.reload(true);
				
			}else
			{  
			
			$ionicLoading.hide();

			var confirmation = $cordovaDialogs.alert('Wrong Login Details!', 'Attention!', [' OK ',' Cancel '])
    .then(function(buttonIndex) {
      // no button = 0, 'OK' = 1, 'Cancel' = 2
      var btnIndex = buttonIndex;
	  if(btnIndex == 1)
	  {
		  PostService.updateBasket($scope.user)
		.then(function(data){
		$scope.display = data.items;
		$scope.itemstotal = data.total;
		});	  
	  }
		}); // end of confirm then
		
			
		} // end of else
			
				
		}); // end of service login
		
        }; // end of do


})

.controller('SignupCtrl', function($scope,$ionicLoading, $state,$cordovaDialogs, PostService) {
	$scope.user = {};
	$scope.data = {};
		
	$scope.uOn = function(val) {
    return angular.isUndefined(val) || val === null 
	}
	
	$scope.doSignup = function(formState){
	
	$ionicLoading.show({ template: "Loading..."});
	
	if($scope.user.terms)
	{
		if($scope.data.txtPswd == $scope.data.txtPswd2)
		{
			if(!formState)
			{
			$ionicLoading.hide();
			$cordovaDialogs.alert('Please check details and re-submit', 'Attention!', [' OK ']);
			 // end of confirm then

			}else
			{
			
			// Do Signup
			 PostService.doSignup(this.data)
		.then(function(data){
				$ionicLoading.hide();
				if(data.info.status == 'true')
				{
					$cordovaDialogs.alert(data.info.msg, 'Registration Success', [' OK ']);
					
				}else
				{
				$cordovaDialogs.alert(data.info.msg, 'Attention!', [' OK ']);
				}
				
				}); // end of service Signup
			
				
			}
			
		
		}else
		{
				$ionicLoading.hide();
				$cordovaDialogs.alert('Password Mismatch', 'Attention!', [' OK ']);
  		
		}
		
	
	}else
	{
	$ionicLoading.hide();
	$cordovaDialogs.alert('Accept Terms of Service to continue', 'Attention!', [' OK ']);
	}
	

	// end of buttom scope dosignup
	};
	
	
})

.controller('ForgotPasswordCtrl', function($scope, $state) {
	$scope.recoverPassword = function(){
		$state.go('app.feeds-categories');
	};

	$scope.user = {};
})


.controller('SearchCtrl', function($scope, $state, PostService) {
	$scope.sdata = {};
	$scope.records = 0;
	
	$scope.doSearch = function(){
			$scope.loadingMessage = " Loading...";
			PostService.doSearch(this.sdata)
		.then(function(data){
			$scope.records = data.records;
			$scope.posts = data.items;
			console.log($scope.records);
			if($scope.records < 1)
			{
				$scope.loadingMessage = " Sorry, there are no products in this category yet.";
			}
			
		});
		
	};

		$scope.ngValue = function()
		{
		
		if($scope.records > 0)
		{
			
			return true;
		}else
		{
			
			return false;
		}
	}
	
})

// FEED
//brings all feed categories
.controller('FeedsCategoriesCtrl', function($scope, $http) {
	$scope.feeds_categories = [];

	$http.get('feeds-categories.json').success(function(response) {
		$scope.feeds_categories = response;
	});
})

//bring specific category providers
.controller('CategoryListCtrl', function($scope,$state, $http,$location, PostService, $stateParams) {
	$scope.categories = [];
	var parameters = [];
	$scope.loadingMessage = "Loading...";
	$scope.doRefresh = function() {
		
		$scope.loadingMessage = "Loading...";
		PostService.getCategoryList($stateParams.categoryId)
		.then(function(data){
			$scope.categories = data.items;
			$scope.records = data.records;
		if($scope.records == '0')
		{
				
			PostService.getCategoryProducts($stateParams.categoryId,$scope.page)
		.then(function(data){
			
			var tests = window.localStorage.getItem("userToken");
			
			$scope.records = data.records;
			$scope.posts = data.items;
			
			if($scope.records < 1)
			{
				$scope.loadingMessage = " Sorry, there are no products in this category yet.";
			}
			
		});
			
		}
		
		});// end of getRecentPosts
		
		
	};// end of do refresh
	
	$scope.ngValue = function()
	{
		
		if($scope.records > 0)
		{
			
			return true;
		}else
		{
			
			return false;
		}
	}
	
	$scope.categoryTitle = $stateParams.categoryTitle;
	$scope.categoryId = $stateParams.categoryId;
	$scope.doRefresh();
	

	
})

.controller('CategoryDetailsCtrl', function($scope,$state, $http,$location, PostService, $stateParams) {
	$scope.categories = [];
	$scope.posts = [];
	$scope.page = 1;
	$scope.totalPages = 1;

	$scope.doRefresh = function() {

		
		//Always bring me the latest posts => page=1
		PostService.getCategoryProducts($stateParams.categoryId,$scope.page)
		.then(function(data){
			//console.log(data);
			var tests = window.localStorage.getItem("userToken");
			
			$scope.totalPages = data.records;
			$scope.posts = data.items;
			$scope.zzz = data.sliders;
				//$ionicLoading.hide();
			$scope.$broadcast('scroll.refreshComplete');
		});// end of getRecentPosts
		
	};// end of do refresh
	
	
	$scope.loadMoreData = function(){
		$scope.page += 1;

		PostService.getRecentPosts($scope.page)
		.then(function(data){
			//We will update this value in every request because new posts can be created
			$scope.totalPages = data.records;
			$scope.posts = data.items;

			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};

	$scope.moreDataCanBeLoaded = function(){
		return $scope.totalPages > $scope.page;
	};

	$scope.bookmarkPost = function(post){
		$ionicLoading.show({ template: 'Post Saved!', noBackdrop: true, duration: 1000 });
		BookMarkService.bookmarkWordpressPost(post);
	};
	
	
	$scope.categoryTitle = $stateParams.categoryTitle;
	$scope.doRefresh();
	

	
})

//this method brings posts for a source provider
.controller('CategoriesCtrl', function($scope, $stateParams, $http, FeedList, $q, $ionicLoading, BookMarkService) {
	$scope.categories = [];
	$scope.doRefresh = function() {

		$http.get('feeds-categories.json').success(function(response) {

		 $scope.categories = response;
		
			
		});
	};

	$scope.doRefresh();

	$scope.bookmarkPost = function(post){
		$ionicLoading.show({ template: 'Post Saved!', noBackdrop: true, duration: 1000 });
		BookMarkService.bookmarkFeedPost(post);
	};
})

// SETTINGS
.controller('SettingsCtrl', function($scope, $ionicActionSheet, $state) {
	$scope.airplaneMode = true;
	$scope.wifi = false;
	$scope.bluetooth = true;
	$scope.personalHotspot = true;

	$scope.checkOpt1 = true;
	$scope.checkOpt2 = true;
	$scope.checkOpt3 = false;

	$scope.radioChoice = 'B';

	// Triggered on a the logOut button click
	$scope.showLogOutMenu = function() {

		// Show the action sheet
		var hideSheet = $ionicActionSheet.show({
			//Here you can add some more buttons
			// buttons: [
			// { text: '<b>Share</b> This' },
			// { text: 'Move' }
			// ],
			destructiveText: 'Logout',
			titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
			cancelText: 'Cancel',
			cancel: function() {
				// add cancel code..
			},
			buttonClicked: function(index) {
				//Called when one of the non-destructive buttons is clicked,
				//with the index of the button that was clicked and the button object.
				//Return true to close the action sheet, or false to keep it opened.
				return true;
			},
			destructiveButtonClicked: function(){
				//Called when the destructive button is clicked.
				//Return true to close the action sheet, or false to keep it opened.
				window.localStorage.removeItem("userToken");
				window.localStorage.removeItem("userID");
				window.localStorage.removeItem("loginState");
				$state.go('app.products');
			}
		});

	};
})

// SHOPPING BASKET
.controller('BasketCtrl', function($scope, $rootScope,$cordovaDialogs, PostService, $state,ENUOMA_BASE_URL) {
	$scope.user = [];
	$scope.display = '';
	$scope.loadingMessage = "Loading...";
	
	$scope.user.userid = window.localStorage.getItem('userID');
	$scope.user.token = window.localStorage.getItem('userToken');
	$scope.user.cartid = window.localStorage.getItem('userCart');
	$scope.user.itemcart = 0;
	$scope.basket = function(){
		
		PostService.getBasket($scope.user)
		.then(function(data){
			$scope.display = data.items;
			$scope.itemstotal = data.total;
			$scope.records = data.records;
	
	
		if($scope.records < 1)
			{
				$scope.loadingMessage = "No items in shopping cart yet. Pull page to refresh";
			}
			
		}).finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
     });
	 
	};
	
	// checking for results  
	$scope.ngValue = function()
	{
		
		if($scope.records > 0)
		{
			
			return true;
		}else
		{
			
			return false;
		}
	}
	
	////////////////////////////////
	
		$scope.itemDelete = function(itemcart){
		$scope.user.itemcart = itemcart;
		
		var confirmation = $cordovaDialogs.confirm('Delete Selected Items?', 'Attention!', [' OK ',' Cancel '])
    .then(function(buttonIndex) {
      // no button = 0, 'OK' = 1, 'Cancel' = 2
      var btnIndex = buttonIndex;
	  if(btnIndex == 1)
	  {
		  PostService.updateBasket($scope.user)
		.then(function(data){
		$scope.display = data.items;
		$scope.itemstotal = data.total;
		$scope.records = data.records;
		
		if($scope.records < 1)
			{
				$scope.loadingMessage = "No items in shopping cart yet. Pull page to refresh";
			}
			
		});
	  
	  }
	  
    	});
		
	
	 
	};
	
	$scope.goToLink = function(links){
		linkz = 'app/checkout/?userid=' + $scope.user.userid + '&token=' + $scope.user.token;
		links = ENUOMA_BASE_URL + linkz;
		if($scope.user.userid > 0)
		{
		PostService.gotoLink(links);
		}else
		{
			// give user alert to login if not logged in
			var confirmation = $cordovaDialogs.alert(' Please Login to Checkout! ', 'Attention!', [' OK ',' Cancel '])
    .then(function(buttonIndex) {
      
    	}); // eend of confirmation page
		
		}
	};
	
	$scope.basket();
})

// WORDPRESS
.controller('ProductCtrl', function($scope, $http, $ionicLoading, PostService, BookMarkService) {
	$scope.posts = [];
	$scope.page = 0;
	$scope.totalPages = 1;
	$scope.choice = false;
	var items = [];
	

	$scope.doRefresh = function() {

		
		//Always bring me the latest posts => page=1
		PostService.getRecentPosts(0)
		.then(function(data){
			//console.log(data);
			var tests = window.localStorage.getItem("userToken");
			$scope.totalPages = data.records;
			$scope.posts = data.items;
			$scope.slides = data.sliders;
			//$ionicLoading.hide();
			$scope.page = 9;
			$scope.$broadcast('scroll.refreshComplete');
			
		});// end of getRecentPosts
		
	};// end of do refresh
	
	
	$scope.loadMoreData = function(){
		

		PostService.getRecentPosts($scope.page)
		.then(function(data){
			//We will update this value in every request because new posts can be created
			$scope.totalPages = data.records;
			items = data.items;
			
			for (var i = 0; i < items.length; i++) {
        	$scope.posts.push(items[i]);
      		}
			
			$scope.page += 10;
			$scope.$broadcast('scroll.infiniteScrollComplete');
			
		});
	};

	$scope.moreDataCanBeLoaded = function(){
		
		if($scope.page < 10)
		{
			$scope.page = 10;
			return false;
		}else
		{
		return $scope.totalPages > $scope.page;
		}
	};
	
	
	$scope.doRefresh();
})

// duplicate product control

// WORDPRESS
.controller('DetailsCtrl', function($scope, $http, PostService,$stateParams, $ionicLoading) {
	$scope.product = [];
	$scope.result = [];
	$scope.qty = 1;
	
	$scope.qtyplus = function()
	{
		$scope.qty ++;
	};
	
		$scope.qtysub = function()
	{
		if($scope.qty > 1)
		{
		$scope.qty --;
		}
	};
	
	$scope.addToCart = function(itm) {
		
		$ionicLoading.show({ template: 'Added to cart!'});
		
		itm.token = window.localStorage.getItem("userToken");
		itm.cartid = window.localStorage.getItem("userCart");
		itm.userid = window.localStorage.getItem("userID");
		itm.qty = $scope.qty;
		PostService.addToCart(itm)
		.then(function(data){
		window.localStorage.setItem("userCart", data.items.cartid);
		
		$ionicLoading.hide();
		
		});
	
	};
	$scope.doRefresh = function() {

		
		//Always bring me the latest posts => page=1
		PostService.getProduct($stateParams.prdId)
		.then(function(data){
			
			$scope.product = data.items;
			$scope.$broadcast('scroll.refreshComplete');
		});
		
	};// end of do refresh
	
	$scope.doRefresh();
})



.controller('ImagePickerCtrl', function($scope, $rootScope, $cordovaCamera) {

	$scope.images = [];

	$scope.selImages = function() {

		window.imagePicker.getPictures(
			function(results) {
				for (var i = 0; i < results.length; i++) {
					console.log('Image URI: ' + results[i]);
					$scope.images.push(results[i]);
				}
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}, function (error) {
				console.log('Error: ' + error);
			}
		);
	};

	$scope.removeImage = function(image) {
		$scope.images = _.without($scope.images, image);
	};

	$scope.shareImage = function(image) {
		window.plugins.socialsharing.share(null, null, image);
	};

	$scope.shareAll = function() {
		window.plugins.socialsharing.share(null, null, $scope.images);
	};
})

;
