dojo.require("dojox.xmpp.xmppSession");

var prefs = new gadgets.Prefs();


function login() {
	
	var username = prefs.getString('login');
	var password = prefs.getString('password');
	var resource = prefs.getString('resource');
	var domain = prefs.getString('domain');

	var jid = username + "@" + domain + "/" + resource;
	var infoElement = document.getElementById('content');
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
	session.open(username, password,resource);

	dojo.connect(session, "onLogin", sessionLoginSucceeded);
	dojo.connect(session, "onLoginFailure", sessionLoginFailed);	
			
};
			
function sessionLoginSucceeded() {
	var infoElement = document.getElementById('content');
	infoElement.innerHTML += "<br/>Connected to " + domain + ".";
	session.presenceService.publish({show: dojox.xmpp.presence.STATUS_AWAY});
	// log out after 10 seconds of being connected.
	setTimeout("infoElement.innerHTML += '<br/>Closing XMPP Session now.'",10000);
	session.close();
};

function sessionLoginFailed(msg){
	var infoElement = document.getElementById('content');
	infoElement.innerHTML += "Login Failed! " + msg ;
};

gadgets.util.registerOnLoadHandler(function() {dojo.addOnLoad(login);});