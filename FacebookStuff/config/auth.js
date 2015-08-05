// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '998701320140541', // your App ID
        'clientSecret'  : '2e711148de356026d7c0e967462cf5e5', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback' //'http://localhost:3000/auth/facebook/callback'
    }

	/*
    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }*/

};