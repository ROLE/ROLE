//insert your dojo requires, e.g. dojo.require("dojox.xmpp.xmppSession"); 

var prefs = new gadgets.Prefs();

function init() {
	
	contentElement = document.getElementById('content');
	contentElement.innerHTML += "Dojo want to use it?";

};

// IMPORTANT:
// A path to a copy of the file dojo/resources/blank.html (included in the dojo toolkit) 
// must be set as value of property djConfig.dojoBlankHtmlUrl, because we are using a 
// cross-domain build of dojo. Before any dojo-enabled gadget is deployed, blank.html
// must be copied to ${SOCIALSITE_HOME}/resources!
dojo.config.dojoBlankHtmlUrl = 'resources/blank.html';

gadgets.util.registerOnLoadHandler(function() {dojo.addOnLoad(init);});
