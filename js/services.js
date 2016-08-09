angular.module('enuoma.services', [])

.service('FeedList', function ($rootScope, FeedLoader, $q){
	this.get = function(feedSourceUrl) {
		var response = $q.defer();
		//num is the number of results to pull form the source
		FeedLoader.fetch({q: feedSourceUrl, num: 20}, {}, function (data){
			response.resolve(data.responseData);
		});
		return response.promise;
	};
})


// PUSH NOTIFICATIONS
.service('PushNotificationsService', function ($rootScope, $cordovaPush, NodePushServer, GCM_SENDER_ID){
	/* Apple recommends you register your application for push notifications on the device every time it’s run since tokens can change. The documentation says: ‘By requesting the device token and passing it to the provider every time your application launches, you help to ensure that the provider has the current token for the device. If a user restores a backup to a device other than the one that the backup was created for (for example, the user migrates data to a new device), he or she must launch the application at least once for it to receive notifications again. If the user restores backup data to a new device or reinstalls the operating system, the device token changes. Moreover, never cache a device token and give that to your provider; always get the token from the system whenever you need it.’ */
	this.register = function() {
		var config = {};

		// ANDROID PUSH NOTIFICATIONS
		if(ionic.Platform.isAndroid())
		{
			config = {
				"senderID": GCM_SENDER_ID
			};

			$cordovaPush.register(config).then(function(result) {
				// Success
				console.log("$cordovaPush.register Success");
				console.log(result);
			}, function(err) {
				// Error
				console.log("$cordovaPush.register Error");
				console.log(err);
			});

			$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
				console.log(JSON.stringify([notification]));
				switch(notification.event)
				{
					case 'registered':
						if (notification.regid.length > 0 ) {
							console.log('registration ID = ' + notification.regid);
							NodePushServer.storeDeviceToken("android", notification.regid);
						}
						break;

					case 'message':
						if(notification.foreground == "1")
						{
							console.log("Notification received when app was opened (foreground = true)");
						}
						else
						{
							if(notification.coldstart == "1")
							{
								console.log("Notification received when app was closed (not even in background, foreground = false, coldstart = true)");
							}
							else
							{
								console.log("Notification received when app was in background (started but not focused, foreground = false, coldstart = false)");
							}
						}

						// this is the actual push notification. its format depends on the data model from the push server
						console.log('message = ' + notification.message);
						break;

					case 'error':
						console.log('GCM error = ' + notification.msg);
						break;

					default:
						console.log('An unknown GCM event has occurred');
						break;
				}
			});

			// WARNING: dangerous to unregister (results in loss of tokenID)
			// $cordovaPush.unregister(options).then(function(result) {
			//   // Success!
			// }, function(err) {
			//   // Error
			// });
		}

		if(ionic.Platform.isIOS())
		{
			config = {
				"badge": true,
				"sound": true,
				"alert": true
			};

			$cordovaPush.register(config).then(function(result) {
				// Success -- send deviceToken to server, and store for future use
				console.log("result: " + result);
				NodePushServer.storeDeviceToken("ios", result);
			}, function(err) {
				console.log("Registration error: " + err);
			});

			$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
				console.log(notification.alert, "Push Notification Received");
			});
		}
	};
})


// BOOKMARKS FUNCTIONS
.service('BookMarkService', function (_, $rootScope){

	this.bookmarkFeedPost = function(bookmark_post){

		var user_bookmarks = !_.isUndefined(window.localStorage.enuomaApp_feed_bookmarks) ?
														JSON.parse(window.localStorage.enuomaApp_feed_bookmarks) : [];

		//check if this post is already saved

		var existing_post = _.find(user_bookmarks, function(post){ return post.link == bookmark_post.link; });

		if(!existing_post){
			user_bookmarks.push({
				link: bookmark_post.link,
				title : bookmark_post.title,
				date: bookmark_post.publishedDate,
				excerpt: bookmark_post.contentSnippet
			});
		}

		window.localStorage.enuomaApp_feed_bookmarks = JSON.stringify(user_bookmarks);
		$rootScope.$broadcast("new-bookmark");
	};

	this.bookmarkWordpressPost = function(bookmark_post){

		var user_bookmarks = !_.isUndefined(window.localStorage.enuomaApp_wordpress_bookmarks) ?
														JSON.parse(window.localStorage.enuomaApp_wordpress_bookmarks) : [];

		//check if this post is already saved

		var existing_post = _.find(user_bookmarks, function(post){ return post.id == bookmark_post.id; });

		if(!existing_post){
			user_bookmarks.push({
				id: bookmark_post.id,
				title : bookmark_post.title,
				date: bookmark_post.date,
				excerpt: bookmark_post.excerpt
			});
		}

		window.localStorage.enuomaApp_wordpress_bookmarks = JSON.stringify(user_bookmarks);
		$rootScope.$broadcast("new-bookmark");
	};

	this.getBookmarks = function(){
		return {
			feeds : JSON.parse(window.localStorage.enuomaApp_feed_bookmarks || '[]'),
			wordpress: JSON.parse(window.localStorage.enuomaApp_wordpress_bookmarks || '[]')
		};
	};
})


// WP POSTS RELATED FUNCTIONS
.service('PostService', function ($rootScope, $http, $q, ENUOMA_API_URL){

	this.getRecentPosts = function(page) {
		var deferred = $q.defer();
	
	$http.get(ENUOMA_API_URL +
		'?action=home&page='+ page +
		'&callback=JSON_CALLBACK')
            .success(function(data) {
			
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
		return deferred.promise;
	};
	
	// ADD ITEMS TO CART
	this.addToCart = function(itm) {
		
			var deferred = $q.defer();

	$http.get(ENUOMA_API_URL +
		'?action=cart&userid='+ itm.userid +
		'&token=' + itm.token +
		'&cartid=' + itm.cart +
		'&txtQty=' + itm.qty +
		'&productid=' + itm.id +
		'&product_option_id=' + itm.optid +
		'&callback=JSON_CALLBACK' )
            .success(function(data) {
		
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
		return deferred.promise;
			
	};
	
	// GET BASKET CONTENT
	this.getBasket = function(user) {
		var deferred = $q.defer();
	
	$http.get(ENUOMA_API_URL +
		'?action=basket&userid='+ user.userid +'&token='+ user.token +
		'&cartid=' + user.cartid + '&callback=JSON_CALLBACK')
            .success(function(data) {
			
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
	
		
		return deferred.promise;
	};
	
	
	this.gotoLink = function(links)
	{
		var ref = null;
		
		try
		{
			ref = cordova.InAppBrowser.open(links, '_blank', 'location=no');
		}catch(e)
		{
			ref = window.open(links, '_blank', 'location=no');
		}
		

	}
	
	// UPDATE BASKET CONTENT
	this.updateBasket = function(user) {
		var deferred = $q.defer();
	
	$http.get(ENUOMA_API_URL +
		'?action=basket&itemDelete=Delete&userid='+ user.userid +'&token='+ user.token +
		'&chkitem=' + user.itemcart + '&cartid=' + user.cartid + '&callback=JSON_CALLBACK')
            .success(function(data) {
			
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
	
		
		return deferred.promise;
	};
	
	// GET PRODUCTS IN CATEGORY	
	this.getCategoryProducts = function(categoryId,page) {
		var deferred = $q.defer();
	
	$http.get(ENUOMA_API_URL +
		'?action=category-details&catid='+ categoryId +'&page='+ page +
		'&callback=JSON_CALLBACK')
            .success(function(data) {
			
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
	
		
		return deferred.promise;
	};
	
	
	this.getSlider = function() {
		var deferred = $q.defer();

	 $http.jsonp(ENUOMA_API_URL +
		'?action=sliders&callback=JSON_CALLBACK')
		.success(function(data) {
			
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
		return deferred.promise;
	};

	
	// GET PRODUCT DETAILS BY PRODUCT ID
	this.getProduct = function(postId) {
		
			var deferred = $q.defer();

	$http.get(ENUOMA_API_URL +
		'?action=details&productid='+ postId +
		'&callback=JSON_CALLBACK')
            .success(function(data) {
		
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
		return deferred.promise;
			

	};
	
	// GET CATEGORY LIST BY CATEGORYID
	this.getCategoryList = function(categoryId) {
		
			var deferred = $q.defer();

	$http.get(ENUOMA_API_URL +
		'?action=category&categoryid='+ categoryId +
		'&callback=JSON_CALLBACK')
            .success(function(data) {
		
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
		return deferred.promise;
			

	};
	
	this.doLogin = function(userdata) {
		
			var deferred = $q.defer();
		
		  $http({
        url: ENUOMA_API_URL + '?action=login&callback=JSON_CALLBACK' ,
        method: "POST",
        data: userdata
    }).success(function (data) 
			{
				
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
		return deferred.promise;
			

	};
	
	this.doSearch = function(userdata) {
		
			var deferred = $q.defer();
		
		  $http({
        url: ENUOMA_API_URL + '?action=search&callback=JSON_CALLBACK' ,
        method: "POST",
        data: userdata
    }).success(function (data) 
			{
				
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
		return deferred.promise;
			

	};
	
	
	this.doSignup = function(userdata) {
		
			var deferred = $q.defer();
		
		  $http({
        url: ENUOMA_API_URL + '?action=signup&callback=JSON_CALLBACK' ,
        method: "POST",
        data: userdata
    }).success(function (data) 
			{
			deferred.resolve(data);
		})
		.error(function(data) {
			deferred.reject(data);
		});
		
		return deferred.promise;
			

	};
	
	

	this.sharePost = function(link){
		window.plugins.socialsharing.share('Check this post here: ', null, null, link);
	};

})

