
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

function randomResponse(phraseList,userData1,userData2) {
    var phraseArray = phraseList.split("|");
    var message = phraseArray[ Math.floor(Math.random() * phraseArray.length)];
    message=message.replace("{0}",userData1 || ""); 
    return(message.replace("{1}",userData2 || ""));
}

function salvoMessages(session,messages,delayMin,delayMax) {
    var phraseArray = messages.split("|");
    var delay=0;
    session.sendTyping()
    phraseArray.forEach( function (m) {
        delay += Math.random()*(delayMax-delayMin)+delayMin;
        setTimeout( function(m) { session.send(m); },delay,m);
    })

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

// RegEx expressions can be entered as literals in the format /expression/flags
// Flags include i: ignore case and g:global

intents.matches(/.*(change|edit|enter).*[\s]name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);



intents.matches(/what.*[\s](kind|sort).*[\s]brexit*./mi, [
    function (session) {
        session.send(randomResponse("It will be a Brexit Brexit!|A glorious Brexit|A red, white and blue Brexit|A red, white and blue Brexit (but not in a French way)"));
    },
]);

intents.matches(/what.*[\s](colour|color).*[\s]brexit*./mi, [
    function (session) {
        session.send(randomResponse("A red, white and blue Brexit of course!|Red. White. Blue"));
    },
]);

intents.matches(/what.*[\s](flavour|flavor).*[\s]brexit*./mi, [
    function (session) {
        session.send(randomResponse("A Jam flavoured Brexit|A chocolate flavoured Brexit"));
    },
]);

intents.matches(/^(who|what)[\s]+(are|is)[\s]+you/i, [
    function (session) {
        session.send(randomResponse("I am the MayBot!|I am MayBot|I am your Leader MayBot"));
    },
]);
intents.matches(/nicky[\s]morgan/i, [
    function (session) {
        session.send(randomResponse("Don't mention that name to me!|I'll turn her and her handbag into a fine pair of trousers|Nicky who?"));
    },
]);
intents.matches(/(^|[\s])europe*./i, [
    function (session) {
        session.send(randomResponse("Let me tell you that the people have spoken very clearly on Europe and we will be leaving|Europe is so last year|We intend to stay in Europe when we leave"));
    },
]);

intents.matches(/(grammar[\s]+school|grammar[\s]+schools)/i, [
    function (session) {
        session.send(randomResponse("We have a long term project to use grammar schools to train our trade negotiators|For years, Europe has prevented us creating new grammar schools - and we intend to change that"));
    },
]);
intents.matches(/(boris johnson|boris jonson|bojo|boris)/i, [
    function (session) {
        var vsn=Math.random()
        if (vsn<0.5)
            salvoMessages(session,"Bawrees? Bo-rhis? Bo Bo Bo Ris|J J J J johnson|BO BO BO Jo Jo Jo|Bori Bori Bori|Error Error Error",200,1000);
        else
            salvoMessages(session,"That man, that man|Watch this space|My cunning plan will work|Wait and see...",200,1000);
    },
]);

intents.matches(/(how are you|how'*s it going|what'*s up)*./i,[
    function (session) {
        session.send(randomResponse());
    },
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
        var r=randomResponse("Brexit means Brexit|I'm waiting, citizen {0}|Let me tell you, {0} - Brexit means Brexit|I'm getting the best deal for Britain",session.userData.name);
        session.send(r);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Greetings Citizen - What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

