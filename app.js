
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


function helloResponse(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}



// Create chat bot
// The ChatConnector 'Connects a UniversalBot to multiple channels via the Bot Framework'
// more at https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.chatconnector.html
var connector = new builder.ChatConnector
                    ({ appId: process.env.MY_APP_ID, 
                       appPassword: process.env.MY_APP_PASSWORD
                    }); 

// Set up handling for basic URLs

server.post('/api/messages', connector.listen());

server.get('/hello/:name', helloResponse)

// serve up index.html at root
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));


var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();



// Create bot dialogs
bot.dialog('/', intents)

intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

