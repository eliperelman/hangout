// Description
//   Generate a Google Hangout Link
//
// Dependencies:
//   "googleclientlogin": "",
//   "moment": ""
//
// Commands:
//   hubot hangout - create a link to a newly-generated Google Hangout
//
// Author:
//   eliperelman

var moment = require('moment');
var googleapis = require('./hangout-core/googleapis');
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var OAuth2Client = googleapis.OAuth2Client;

var getHangoutLink = function (callback) {
	var googleAuth = new GoogleClientLogin({
		email: '******************',
		password: '*****************',
		service: 'calendar',
		accountType: GoogleClientLogin.accountTypes.hostedOrGoogle
	});

	googleAuth.on(GoogleClientLogin.events.login, function () {

		googleapis.load('calendar', 'v3', function (err, client) {
			var token = googleAuth.getAuthId();

			var oauthClient = new OAuth2Client('', '', '', {}, {
				access_token: token
			}, 'GoogleLogin auth=' + token);

			var now = moment().format();

			client.withApiKey('***************************');

			client
				.calendar
				.events
				.insert({
					calendarId: 'primary',
					resource: {
						summary: 'hangout',
						description: 'hangout',
						reminders: {
							overrides: {
								method: 'popup',
								minutes: 0
							}
						},
						start: {
							dateTime: now
						},
						end: {
							dateTime: now
						},
						attendees: [{
							email: '*******************'
						}]
					}
				})
				.withAuthClient(oauthClient)
				.execute(function (err, event) {
					if (err) {
						callback(err, null);
					} else {
						callback(null, event.hangoutLink);
					}
				});
		});
	});

	googleAuth.on(GoogleClientLogin.events.error, function (e) {
		callback(e, null);
	});

	googleAuth.login();
};

module.exports = function (hubot) {

	hubot.respond(/hangout/i, function (msg) {
		getHangoutLink(function (err, link) {
			if (err) {
				hubot.reply('An error occurred while trying to create the Google Hangout. :/');
				return;
			}

			hubot.send('Hangout started: ' + link);
		});
	});

};
