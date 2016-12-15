
// Bring in external requirements
// Everything is an object - including libraries
var restify = require('restify')
var builder = require('botbuilder')

// Set up the restify server
// 'restify is a node.js module built specifically to enable you to build correct REST web services'
// server created and given a callback function

var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

// Get my app environment vars
var myAppId = process.env.MY_APP_ID,
var myAppPassword = process.env.MY_APP_PASSWORD;

// Create chat bot
// The ChatConnector 'Connects a UniversalBot to multiple channels via the Bot Framework'
// more at https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.chatconnector.html
var connector = new builder.ChatConnector
({ appId: myAppId, appPassword: myAppPassword }); 
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create bot dialogs
bot.dialog('/', function (session) {
    session.send("Hello World");
});