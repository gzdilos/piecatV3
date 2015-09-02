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
		//Assume we have the access token
		//Only can pull 100 feed items apparently
		process.nextTick(function() {
			
			//Get User Likes
			//Wiki it
			
			var testFeed = false;
			var testInbox = false;
			var testLikes = false;
			var testWiki = false;
			
			if (testLikes) {
				var s = "/v2.3/me/likes";
				//var s = "/v2.3/me/likes";
				//var j = 0;
				//var processing = true;
				FB.api(s,  doSomething);
				
				function doSomething(response) {
					if (response && !response.error) {
						var i = 0;
						var str = "";
						//console.log("GOING through the response!!!");
						while(response.data[i]) {
							//var name = response.data[i].name + '\n';
							//console.log(i);
							var query = response.data[i].name;
							console.log(query);
							//console.log(response.data[i]);
							//console.log(i);
							// if you want to retrieve a full article set summaryOnly to false. 
							// Full article retrieval and parsing is still beta 
							
							if (testWiki) {
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
										
										console.log(split[0]);
										
										console.log("Found page");
										
										//Store in array for final
										fs.appendFile('./log/foundpagelikes.txt', split[0] + '\n', function (err) {
											if (err) {
												return console.log(err);
											}
										});
									} else {
										//console.log(query);
										console.log("No page found");
									}
								});
							}
							str = str + query + "\n";
							
							i++;
						}
						
						console.log("Writing file");
						fs.appendFile('./log/likesNamePaginated.txt', str, function (err) {
								if (err) {
									return console.log(err);
								}
						});
						
						//Go to next page
						//console.log(response.data);
						if (response["paging"] && response["paging"]["next"]) {
							//var url = response["paging"]["cursors"]["after"];
							//console.log(response.data);
							//console.log("FLASLSLDASFAS");
							var url = response["paging"]["next"].split("https://graph.facebook.com");
							//console.log(url[1]);
							//s = "/v2.3/me/likes?after=" + url;
							s = url[1];
							//console.log("Going to next page");
							//console.log(s);
							//FB.setAccessToken(token);
							process.nextTick(function() {
								FB.setAccessToken(refreshToken);
								FB.api(s, doSomething);
							});
							
						} else {
							//done = true;
						}
						
					} else {
						//Print out error message
						console.log(response);
					}
					
				}
			}
			
			if (testInbox) {
				
				var uniqueFriends = [];
				//Get User Inbox
				//Needed code
				FB.api('/v2.3/me/inbox', function (response) {
				
					if (response && !response.error) {
						
						var friends = [];
						//console.log(response);
						var i = 0;
						var str = "";
						var prevTo = "";
						var prevFrom = "";
						
						while(response.data[i]) {
							
							var to = response.data[i]['to']['data'][0]['name'];
							var from = response.data[i]['to']['data'][1]['name'];
							
							friends.push(to);
							friends.push(from);
							//prevTo = to;
							//prevFrom = from;
							
							i++;
						}
						
						i = 0;
						
						console.log("Friends list");
						
						friends.sort();
						var x = friends.push("");
						x--;
						var prev = friends[0];
						
						while (i != x) {
							
							if (prev == friends[i+1]) {
								
							} else {
								
								uniqueFriends.push(friends[i]);
							}
							
							//console.log(friends[i]);
							
							prev = friends[i];
							
							i++;
						}
						
						x = uniqueFriends.push("");
						x--;
						i = 0;
						
						while (i != x) {
							console.log(uniqueFriends[i]);
							str = str + uniqueFriends[i] + "\n";
							i++;
						}
						//console.log(JSON.stringify(to));
						//console.log(JSON.stringify(from));
						//var p = JSON.stringify(response);
						
						//console.log(p.length);
						
						fs.writeFile('./log/messages.txt', str, function (err) {
							if (err) {
								return console.log(err);
							}
						});
					} else {
						//Print out error message
						console.log(response);
					}
				});
			}
			
			//return done(null, newUser);
		
			if (testFeed) {
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
				function setStruct(name, category, message, picture, link, type, createdtime) {
					
					//var values = str.split(' ');
					// count = values.length;
					//function constructor() {
					var item = [];
					
					//makeStruct("Name Category Message Picture Link Type CreatedTime Score");
					item['Name'] = name;
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
				
				var allFeed = [];
				//Since last logged in
				//since : 'yesterday', 
				FB.api('/v2.3/me/home' , {'limit' : '100'}, function (response) {
				
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
							var category = response.data[i]['from']['category'];
							var message = response.data[i]['message'];
							var picture = response.data[i]['picture'];
							var link = response.data[i]['link'];
							var type = response.data[i]['type'];
							var createdTime = response.data[i]['created_time'];
							
							var newFeedItem = setStruct(name, category, message, picture, link, type, createdTime, 0);
							//alert(row.speaker); // displays: john
							
							//console.log("--------------------------------");
							//console.log("Name is " + newFeedItem['Name']);
							//console.log("Category is " + newFeedItem['Category']);
							//console.log("message is " + newFeedItem['Message']);
							//console.log("picture is " + newFeedItem['Picture']);
							//console.log("link is " + newFeedItem['Link']);
							//console.log("type is " + newFeedItem['Type']);
							//console.log("createdTime is " + newFeedItem['CreatedTime']);
							
							allFeed.push(newFeedItem);
							
							//str = str + JSON.stringify(response.data[i], null, 2);
							i++;
						}
						
						allFeed.sort(function (a, b) {
							var date1 = new Date(a['CreatedTime']);
							var date2 = new Date(b['CreatedTime']);
							
							if (date1 < date2) {
								return 1;
							} else {
								return -1;
							}
						});
						
						console.log("There are " + i + " feed items");
						var initialScore = 2*i;
						
						i = 0;
						
						var x = allFeed.push();
						
						while (i < x) {
							//console.log("--------------------------------");
							allFeed[i]['Score'] = initialScore - i;
							//console.log("Name is " + allFeed[i]['Name']);
							//console.log("Category is " + allFeed[i]['Category']);
							//console.log("message is " + allFeed[i]['Message']);
							//console.log("picture is " + allFeed[i]['Picture']);
							//console.log("link is " + allFeed[i]['Link']);
							//console.log("type is " + allFeed[i]['Type']);
							//.log("createdTime is " + allFeed[i]['CreatedTime']);
							i++;
						}
						
						i = 0;
						
						while (i < x) {
							console.log("--------------------------------");
							//allFeed[i]['Score'] = initialScore - 1;
							console.log("Name is " + allFeed[i]['Name']);
							console.log("Category is " + allFeed[i]['Category']);
							//console.log("message is " + allFeed[i]['Message']);
							console.log("picture is " + allFeed[i]['Picture']);
							console.log("link is " + allFeed[i]['Link']);
							console.log("type is " + allFeed[i]['Type']);
							console.log("createdTime is " + allFeed[i]['CreatedTime']);
							console.log("score is " + allFeed[i]['Score']);
							i++;
						}
						
						//Consider storing in an array
						/*
						fs.writeFile('./log/feed.txt', str, function (err) {
							if (err) {
								return console.log(err);
							}
							
							console.log("done");
						});*/
						
					
					} else {
						//Print out error message
						console.log(response);
					}
					
				});
				//return done(null, newUser);*/
			}
		});

		return done(null, newUser);
        // asynchronous
        //process.nextTick(function() {

            // find the user in the database based on their facebook id
			/*
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }
				
				//return done(null, newUser);
            });*/
			
			
			//return done(null, newUser);
        //});

    }));
};