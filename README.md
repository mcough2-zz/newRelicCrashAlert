# newRelicCrashAlert
This New Relic Synthetics script is meant to run every 30 minutes and look for any new crashes. If it finds a new crash it sends a slack message with a link to that particular crash! It also does this for specific app. So, if you have several apps in your account you can get new crash alerts sent to slack for just the particular you care about. 

## Step 1: 
Create a Incoming Webhook in you slack account
## Step 2: 
find the slackWebhookUri variable in the script and paste your webhook uri into the script as below
varslackWebhookUri = 'YOUR Webhook URI HERE'
 
## Step 3: 
Add the other variables needed for this to run
//Your Rest API Key
var myQueryKey = [QueryKey];
//The Insights API Query Key for the account of the mobile app your concerned with
var insightsQueryKey = 'INSIGHTS QUERY KEY'
//The Account ID that contain the mobile app your concerned with
var accountId = YOUR ACCOUNT ID;
//This should look like it would in a Insights 'where' statement for a specific app
var appName = "YOUR APP NAME"; 
//This should be the ID of your mobile app 
var mobileAppID = "YOUR MOBILE APP ID"
 
## Step 4:
Format the slack message by changing the payload variable - the default is:
var payload={"channel": "#crashalert", "username": "newrelic","text": "A new crash has occurred. It has a crash location of " + newCrashLocation + "\n <" + crashUrl +"|  Click here> for details!"};
 
*Note - Make sure you have a channel created, according to the payload variable, before you run the script*
 
## Step 5: 
Run the script of a 30 minutes schedule from one location 
