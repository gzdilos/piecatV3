// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var FB = require('fb');
var fs = require('fs');
var wiki = require('wikipedia-js');
var async = require('async');

// load up the user model
var User            = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));
	
	// =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

	// =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },
	 // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

		var newUser            = new User();

		// set all of the facebook information in our user model
		//newUser.facebook.id    = profile.id; // set the users facebook id                   
		//newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
		//newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
		//newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
		
		//console.log("Token is ");
		//console.log(token);
		FB.setAccessToken(token);
		
		var likesList = [];
		var uniqueFriends = [];
		var allFeed = [];
		var finishedLikes = false;
		var finishedFeed = false;
		var finishedFriends = false;
		//Assume we have the access token
		//Only can pull 100 feed items apparently
		process.nextTick(function() {
			
			//Get User Likes
			//Wiki it
			
			// var testFeed = true;
			// var testInbox = true;
			// var testLikes = true;
			// var testWiki = true;
			
			console.log("Getting likes");
			//if (testLikes) {
				var s = "/v2.3/me/likes";
				FB.api(s, getLikes);		
			//}
			
					
			 // waitLikes();
			 // FB.setAccessToken(refreshToken);
			 // getFriends();
			
			// waitFriends();	
			// FB.setAccessToken(refreshToken);
			// getFeed();
			
			// waitFeed();
			// doEverything();
			
			function getLikes(response) {
				console.log("getting likes...");
					if (response && !response.error) {
						var i = 0;
						var str = "";
						//console.log("GOING through the response!!!");
						while(response.data[i]) {

							var query = response.data[i].name;

							// if you want to retrieve a full article set summaryOnly to false. 
							// Full article retrieval and parsing is still beta 
							
							//if (testWiki) {
								var options = {query: query, format: "json", summaryOnly: true};
							
								wiki.searchArticle(options, function(err, htmlWikiText){
									if (err) {
										console.log("An error occurred[query=%s, error=%s]", query, err);
										return;
									}
									//console.log("Query successful[query=%s, html-formatted-wiki-text=%s]", query, htmlWikiText);
									//console.log(typeof htmlWikiText);
									
									//var parse = JSON.parse(htmlWikiText);

									if (htmlWikiText.indexOf('pageid') > -1) {
										//console.log(query);
										
										
										var titleIndex = htmlWikiText.indexOf('title') + 8;
										//console.log(htmlWikiText.indexOf('title'));
										
										var title = htmlWikiText.slice(titleIndex);
										
										var split = title.split('"');
										
										//console.log(split[0]);
										
										//console.log("Found page");
										
										likesList.push(split[0]);
										
										//Store in array for final
										fs.appendFile('./log/foundpagelikes.txt', split[0] + '\n', function (err) {
											if (err) {
												return console.log(err);
											}else {

											}
										});
									} else {
										//console.log(query);
										//console.log("No page found");
									}
								});
							//}
							str = str + query + "\n";
							
							i++;
						}
						
						//console.log("Writing file");
						fs.appendFile('./log/likesNamePaginated.txt', str, function (err) {
								if (err) {
									return console.log(err);
								}else if ( !(response["paging"] && response["paging"]["next"]) &&
											!(response.data[i+1]) ) {
									finishedLikes = true;
									console.log("finished getting likes...");
									//FB.setAccessToken(refreshToken);
									getFriends();
								}
						});
						
						//Go to next page
						//console.log(response.data);
						if (response["paging"] && response["paging"]["next"]) {

							var url = response["paging"]["next"].split("https://graph.facebook.com");

							s = url[1];
							//Change
							process.nextTick(function() {
								FB.setAccessToken(refreshToken);
								FB.api(s, getLikes);
							});
							
						} else {
							//done = true;
						}
						
					} else {
						//Print out error message
						console.log(response);
					}
					
				}
				
				
			function getFriends() {
			console.log("getting friends...");
				//if (testInbox) {
					
					//var uniqueFriends = [];
					//Get User Inbox
					//Needed code
					FB.setAccessToken(refreshToken);
					FB.api('/v2.3/me/inbox', function (response) {
					
						if (response && !response.error) {
							
							var friends = [];
							//console.log(response);
							var i = 0;
							var str = "";
							var prevTo = "";
							var prevFrom = "";
							
							while(response.data[i]) {
								
								var to = "";
								var from = "";
								
								if (response.data[i]['to']['data'][0]) {
									to = response.data[i]['to']['data'][0]['id'];
									friends.push(to);
								}
								
								if (response.data[i]['to']['data'][1]) {
									to = response.data[i]['to']['data'][1]['id'];
									friends.push(from);
								}
								
								//friends.push(to);
								//friends.push(from);
								//prevTo = to;
								//prevFrom = from;
								
								i++;
							}
							
							i = 0;
							
							//console.log("Friends list");
							
							friends.sort();
							var x = friends.length;
							//x--;
							var prev = friends[0];
							
							while (i < x-1) {
								
								if (prev.indexOf(friends[i+1]) > -1)  {
									
								} else {
									
									uniqueFriends.push(friends[i]);
								}
								
								//console.log(friends[i]);
								
								prev = friends[i];
								
								i++;
							}
							
							x = uniqueFriends.length;
							//x--;
							i = 0;
							
							while (i != x) {
								//console.log(uniqueFriends[i]);
								str = str + uniqueFriends[i] + "\n";
								i++;
							}
							//console.log(JSON.stringify(to));
							//console.log(JSON.stringify(from));
							//var p = JSON.stringify(response);
							
							console.log(uniqueFriends.length);
							
							fs.writeFile('./log/messages.txt', str, function (err) {
								if (err) {
									return console.log(err);
								}
								finishedFriends = true;
								console.log("finished getting friends...");
								//getFeed();
							});
						} else {
							//Print out error message
							console.log(response);
						}
					}, {access_token: token});
				//}
			}
			
			//Paginate
			var count = 0;
			var finished = false;
			s = "/v2.3/me/home";
			FB.api(s, getFeed);
			
			function getFeed() {
				console.log("Getting feed");
				//if (testFeed) {
					//Get feed
					//By session basis
					//Makes a struct
					//Name
					//Category
					//Message
					//Picture
					//Link
					//Type
					
					//CreatedTime
					//Scores
					
					//Since last logged in
					//since : 'yesterday', 
					FB.setAccessToken(refreshToken);
					FB.api('/v2.3/me/home', function (response) {
						if (response && !response.error) {
							
							//console.log(typeof response.data);
							//var size = 100;
							var i = 0;
							var str = "";
							
							while (response.data[i]) {
								//Get information from each individual feed items
								//Name
								//Category
								//Message
								//Picture
								//Link
								//Type
								//Created Time
								//console.log("Stuff");
								var name = response.data[i]['from']['name'];
								var id = response.data[i]['from']['id'];
								var category = response.data[i]['from']['category'];
								var message = response.data[i]['message'];
								var picture = response.data[i]['picture'];
								var link = response.data[i]['link'];
								var type = response.data[i]['type'];
								if (type == null) {
									console.log("received null type");
								}
								var createdTime = response.data[i]['created_time'];
								
								var newFeedItem = setStruct(name, id, category, message, picture, link, type, createdTime, 0);
								
								allFeed.push(newFeedItem);
								
								//str = str + JSON.stringify(response.data[i], null, 2);
								i++;
							}
							
							//Go to next page
							//console.log(response.data);
							//finished = false;
							
							if (response["paging"] && response["paging"]["next"] && count < 3) {

								var url = response["paging"]["next"].split("https://graph.facebook.com");

								s = url[1];
								
								//Change
								process.nextTick(function() {
									count++;
									//if (count < 1) {
										FB.setAccessToken(refreshToken);
										FB.api(s, getFeed);
										//finished = true;
									//}
								});
								
							} else {
								//done = true;
								//finsihedFeed = true;
								console.log("finished getting feed...");
								doEverything();
							}
							//console.log("finished getting feed...");
							//	doEverything();
						} else {
							//Print out error message
							console.log(response);
						}
						//finished = true;
					}, {access_token: token});
					//return done(null, newUser);*/
				//}
			}
			
			
			function doEverything() {
			//Add score from friends to feed
			//var done = false;
			//while (!done) {
				console.log("adding everything together!!!!");
				console.log("Feed is " + allFeed.length);
				console.log("Likes is " + likesList.length);
				console.log("Inbox is " + uniqueFriends.length);
				
				var feedSize = allFeed.length;
				//Sort and get freshness
				allFeed.sort(function (a, b) {
								var date1 = new Date(a['CreatedTime']);
								var date2 = new Date(b['CreatedTime']);
								
								if (date1 < date2) {
									return 1;
								} else {
									return -1;
								}
							});
							
				var initialScore = 2*feedSize;
							
				var i = 0;
				
				var x = allFeed.length;
				
				while (i != x) {
					allFeed[i]['Score'] = initialScore - i;
					i++;
				}
				
				i = 0;
				var friendScore = 45;
				
				while (i != allFeed.length) {
					
					var j = 0;
					
					while (j != uniqueFriends.length) {
						var feedItem = allFeed[i];
						
						if (feedItem['ID'].indexOf(uniqueFriends[j]) > -1) {
							feedItem['Score'] = feedItem['Score'] + friendScore;
						}
						j++;
					}
					i++;
				}
				
				//Add score from likes to feed
				i = 0;
				
				var likesScore = 25;
				while (i != allFeed.length) {
					
					var j = 0;
					
					while (j != likesList.length) {
						var feedItem = allFeed[i];
						
						if (feedItem['Message'] && feedItem['Message'].indexOf(likesList[j]) > -1) {
							feedItem['Score'] = feedItem['Score'] + likesScore;
						}
						
						if (feedItem['Name'] && feedItem['Name'].indexOf(likesList[j]) > -1) {
							feedItem['Score'] = feedItem['Score'] + likesScore;
						}
						
						if (feedItem['Category'] && feedItem['Category'].indexOf(likesList[j]) > -1) {
							feedItem['Score'] = feedItem['Score'] + likesScore;
						}
						
						if (feedItem['Type'] && feedItem['Type'].indexOf(likesList[j]) > -1) {
							feedItem['Score'] = feedItem['Score'] + likesScore;
						}
						
						j++;
					}
					i++;
				}
				
				//Sort by scores
				allFeed.sort(function (a, b) {
					var score1 = a['Score'];
					var score2 = b['Score'];
					
					if (score1 < score2) {
						return 1;
					} else {
						return -1;
					}
				});
				
				//Subtract score for diversity
				i = 0;
				var diversityScore = 80;
				while (i != allFeed.length - 1) {
					var feedItem1 = allFeed[i];
					var feedItem2 = allFeed[i+1];
						
					//console.log(feedItem['Type']);
					if (feedItem1['Type'] && feedItem2['Type'] && feedItem1['Type'].indexOf(feedItem2['Type']) > -1) {
						feedItem2['Score'] = feedItem2['Score'] - diversityScore;
					} else if (feedItem1['Category'] && feedItem2['Category'] && feedItem1['Category'].indexOf(feedItem2['Category']) > -1) {
						feedItem2['Score'] = feedItem2['Score'] - diversityScore;
					} 
					
					i++;
				}
				
				//Sort by scores
				allFeed.sort(function (a, b) {
					var score1 = a['Score'];
					var score2 = b['Score'];
					
					if (score1 < score2) {
						return 1;
					} else {
						return -1;
					}
				});
				
				//Print output
				i = 0;
			
				var feedText = "";
				
				console.log("Printing ranked list");
				while (i < allFeed.length) {
					/*
					console.log("--------------------------------");
					//allFeed[i]['Score'] = initialScore - 1;
					console.log("Name is " + allFeed[i]['Name']);
					console.log("ID is " + allFeed[i]['ID']);
					console.log("Category is " + allFeed[i]['Category']);
					//console.log("message is " + allFeed[i]['Message']);
					console.log("picture is " + allFeed[i]['Picture']);
					console.log("link is " + allFeed[i]['Link']);
					console.log("type is " + allFeed[i]['Type']);
					console.log("createdTime is " + allFeed[i]['CreatedTime']);
					console.log("score is " + allFeed[i]['Score']);*/
					feedText = feedText + "-------------------------\n";
					feedText = feedText + "Name: " + allFeed[i]['Name'] + "\n";
					feedText = feedText + "Category: " + allFeed[i]['Category'] + "\n";
					feedText = feedText + "Message: " + allFeed[i]['Message'] + "\n";
					feedText = feedText + "Picture: " + allFeed[i]['Picture'] + "\n";
					feedText = feedText + "Link: " + allFeed[i]['Link'] + "\n";
					feedText = feedText + "Type: " + allFeed[i]['Type'] + "\n";
					feedText = feedText + "CreatedTime: " + allFeed[i]['CreatedTime'] + "\n";
					feedText = feedText + "Score: " + allFeed[i]['Score'] + "\n";
					i++;
				}
				
				fs.writeFile('./log/properFeed.txt', feedText, function (err) {
								if (err) {
									return console.log(err);
								}
						});
						
				console.log("We done bois!!");
				done = true;
		}
			
		});
		
		function waitFriends() {
				if (!finishedFriends) {
						//console.log("waiting osis");
							setTimeout(function(){
								waitFriends();
							},
							100);
					}
				}
		
		function waitLikes() {
				if (!finishedLikes) {
						//console.log("waiting osis");
							setTimeout(function(){
								waitLikes();
							},
							100);
					}
			}
		
		function waitFeed() {
				if (!finishedFeed) {
						//console.log("waiting osis");
							setTimeout(function(){
								waitFeed();
							},
							100);
					}
				}
		
		function setStruct(name, id, category, message, picture, link, type, createdtime) {
					
					//var values = str.split(' ');
					// count = values.length;
					//function constructor() {
					var item = [];
					
					//makeStruct("Name Category Message Picture Link Type CreatedTime Score");
					item['Name'] = name;
					item['ID'] = id;
					item['Category'] = category;
					item['Message'] = message;
					item['Picture'] = picture;
					item['Link'] = link;
					item['Type'] = type;
					item['CreatedTime'] = createdtime;
					item['Score'] = 0;
					
					//for (var i = 0; i < count; i++) {
						//item[names[i]] = arguments[i];
					//}
					//}
					return item;
		}
		//}
		
		return done(null, newUser);

    }));
};