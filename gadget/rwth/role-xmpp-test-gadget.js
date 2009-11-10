dojo.require("dojox.encoding.digests.MD5");
dojo.require("dojox.xmpp.xmppSession");


var prefs = new gadgets.Prefs();

var username = prefs.getString('login');
var password = prefs.getString('password');
var resource = prefs.getString('resource');
var domain = prefs.getString('domain');

function sessionLoginSucceeded() {
	infoElement = document.getElementById('content');
        infoElement.innerHTML += "logged in <br/>(keeping connection for 5s)";
 
        session.presenceService.publish({show: dojox.xmpp.presence.STATUS_AWAY});
        // log out after 10 seconds of being connected.
        setTimeout("infoElement.innerHTML += '<br/>Closing session now.<br/><br/>Test successful.'",5000);
        session.close();
}

function sessionLoginFailed(msg) {
	infoElement = document.getElementById('content');
	infoElement.innerHTML += "Login failed:" + msg;
}

function login() {
	
	var jid = username + "@" + domain + "/" + resource;
	infoElement = document.getElementById('content');
	infoElement.innerHTML += "Connecting " + jid + "...";
	
	var bindUrl = "http://" + domain + ":7070/http-bind/";
	
	var useScriptSrcTransport = true;
	
	var options =  {
		serviceUrl: bindUrl,
		hold: 1,
		secure: false,
		useScriptSrcTransport: useScriptSrcTransport,
		wait: 60,
		lang: 'en',
		retryCount: 2,
		domain: domain
	};

	session = new dojox.xmpp.xmppSession(options);	
	session.open(username, password, resource);

	dojo.connect(session, "onLogin", sessionLoginSucceeded);
	dojo.connect(session, "onLoginFailure", sessionLoginFailed);
};

dojo.config.dojoBlankHtmlUrl = 'resources/blank.html';
gadgets.util.registerOnLoadHandler(function() {dojo.addOnLoad(login);});
