// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
	/*
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));*/

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
	/*
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

	// process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));*/

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs')
		, {
            user : req.user // get the user out of session and pass to template
        } 
    });
	
	// app.get('/profile', function(req, res) {
        // res.render('profile.ejs');
    // });

	// =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
	//console.log ("Auth1");
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'user_about_me, read_stream, user_likes, read_mailbox' })); //'read_stream, 
	//console.log ("Auth2");
    //handle the callback after facebook has authenticated the user
    // app.get('/auth/facebook/callback',
        // passport.authenticate('facebook', {
            // successRedirect : '/profile',
            // failureRedirect : '/'
        // }));
		
	app.get('/auth/facebook/callback', function(req, res) {
		passport.authenticate('facebook', function(err, user, info) {
				console.log("Going to redirect");
				return res.redirect('/profile');
				console.log("Finish redirect");
		})(req, res);
	});

	//console.log ("Auth3");
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
	
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	return next();
	console.log("Calling isLoggedIn");
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        console.log("Authentication successful");
		return next();
	}
	console.log(req.isAuthenticated());
    // if they aren't redirect them to the home page
    res.redirect('/');
	console.log("Authentication failed");
}