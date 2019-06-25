/**
 * Feel free to explore, or check out the full documentation
 * https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/writing-api-tests
 * for details.
 */
var fs = require('fs');
var assert = require('assert');
//Your Rest API Key
var myQueryKey = 'YOUR REST API KEY';
//The Insights API Query Key for the account of the mobile app your concerned with
var insightsQueryKey = 'INSIGHTS QUERY KEY'
//The Account ID that contain the mobile app your concerned with
var accountId = YOUR ACCOUNT ID;
var crashArr = [];
//This should look like it would in a Insights 'where' statement for a specific app
var appName = "YOUR APP NAME";
var mobileAppID = "YOUR MOBILE APP ID"


//Send Slack alert about new crash
function slackNewCrashalert(currentFingerprint,newCrashLocation) {
	var crashUrl = 'https://rpm.newrelic.com/accounts/'+ accountId +'/mobile/' + mobileAppID + '/crash_analysis#/fingerprint/' + currentFingerprint;
var payload={"channel": "#crashalert", "username": "newrelic","text": "A new crash has occurred. It has a crash location of " + newCrashLocation + "\n <" + crashUrl +"|  Click here> for details!"};
//Paste your slack wekhook uri below
	var slackWebhookUri = 'YOUR Webhook URI HERE'
		var slackWebhookOps = {
		uri: slackWebhookUri,
		headers: {'Accept': 'application/json'},
		json: payload
	 };

		$http.post(slackWebhookOps, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		console.log('Message Post Success');
	} else {
		console.log(body);
			console.log('Bad thigs happen >> ' + response.statusCode);
		}
	});
}

//Get the New Crash Details to be Sent to Slack
function 	  getNewCrashDetails(currentCrash) {
var crashHistoryNrql = "SELECT * FROM MobileCrash WHERE appName = '" + appName + "' and crashLocation = '" + currentCrash + "' SINCE 40 minutes ago";
	var uri = 'https://insights-api.newrelic.com/v1/accounts/';
	uri += accountId;
	uri += '/query';
	var options = {
	'uri': uri,
	'qs': {'nrql': crashHistoryNrql},
	'headers': {'X-Query-Key': insightsQueryKey},
	'json': true
	};
	$http.get(options, function(error, response, body) {
	if (!error && response.statusCode == 200) {
		var result = body.results;
		var currentFingerprint = result[0].events[0].crashFingerprint;
		console.log(currentFingerprint);
		var newCrashLocation = result[0].events[0].crashLocation;
		//Send a Slack Alert about new Crash details
			slackNewCrashalert(currentFingerprint,newCrashLocation);

	} else {
		console.log('Query Application List error: ' + error);
		console.log(response.statusCode);
	}
	});


}

//this checks all new crashes to see if they have happened in the last month
function checkCrashHistory2 (currentCrash) {
var crashHistoryNrql = "SELECT count(crashLocation) FROM MobileCrash WHERE appName = '" + appName + "' and crashLocation = '" + currentCrash + "' SINCE 1 month ago UNTIL 40 minutes ago";
	var uri = 'https://insights-api.newrelic.com/v1/accounts/';
	uri += accountId;
	uri += '/query';
	var options = {
	'uri': uri,
	'qs': {'nrql': crashHistoryNrql},
	'headers': {'X-Query-Key': insightsQueryKey},
	'json': true
	};
	$http.get(options, function(error, response, body) {
	if (!error && response.statusCode == 200) {
		var result = body.results;
		console.log(currentCrash + ' happened ' + result[0].count + ' in the lasst month');
		//If the currentCrash hasn't happened in the last month we consider it a new crash and do getNewCrashDetails
    if (result[0].count == 0) {
      console.log(currentCrash + ' is a new crash');
	  getNewCrashDetails(currentCrash);
    }
	} else {
		console.log('Query Application List error: ' + error);
		console.log(response.statusCode);
	}
	});

}


function 	checkCrashHistory1(crashArr) {
  for (var j=0; j < crashArr.length; j++) {
		var currentCrash = crashArr[j].crashLocal;
		checkCrashHistory2(currentCrash);
  }//end of for loop
}

//This runs first and check for all crashes by crash location in the last 35 minutes (insights api limit 1000 unique crashes)
function 	checkForCrashes() {
	var latestCrashesNrql = "SELECT uniqueCount(crashLocation) FROM MobileCrash WHERE appName = '" + appName  + "' SINCE 35 minutes ago FACET crashLocation limit 1000";
	var uri = 'https://insights-api.newrelic.com/v1/accounts/';
	uri += accountId;
	uri += '/query';
	var options = {
	'uri': uri,
	'qs': {'nrql': latestCrashesNrql},
	'headers': {'X-Query-Key': insightsQueryKey},
	'json': true
	};
	$http.get(options, function(error, response, body) {
	if (!error && response.statusCode == 200) {
		var facets = body.facets;
		for (var i=0; i<facets.length; i++) {
      					crashArr.push({
						'appName': appName,
						'crashLocal': facets[i].name,
					});
          	}
            checkCrashHistory1(crashArr);
	} else {
		console.log('Query Application List error: ' + error);
		console.log(response.statusCode);
	}
	});
}

checkForCrashes();
