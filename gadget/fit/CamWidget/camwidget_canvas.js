/**
 * Cam Widget
 * This JavaScript file is for Canvas view.
 */

function init() {
    // TODO: Write the code for initializing.
}

function getSelection() {
	var selection;
	if(document.camform.selection[0].checked == true) {
    	selection = document.camform.selection[0].value;
  	}
  	else if(document.camform.selection[1].checked == true) {
    	selection = document.camform.selection[1].value;
    }
  	else if(document.camform.selection[2].checked == true) {
    	selection = document.camform.selection[2].value;
    }			
	return selection;
}

// TODO how do i access envelope.date?
function callback(envelope, message) {
	// Filter out select events
	var storagemode = getSelection();
	var messageLabel = message["http://www.role-project.eu/rdf/words/label"];
	var messageTerm = message["http://www.role-project.eu/rdf/words/term"];
	var messageContext = message["http://www.role-project.eu/rdf/words/context"];
	var messageSrc = message["http://www.role-project.eu/rdf/words/source"];
	var timestamp = new Date().getTime();
	var actionType = envelope.event;
	javascript:store(actionType, storagemode,  messageLabel, messageTerm, messageContext, messageSrc, timestamp);
}

//function callback(envelope, message) {
	// Filter out select events
	//var envelopeString = gadgets.json.stringify(envelope);
	//var envelopeObject = eval('(' + test + ')');
	//alert(myObject.event);
	//alert(myObject.message[gadgets.openapp.RDF + "label"]);
	
	
	//if (envelope.event === "select") {
		// Require namespaced-properties
		//if (envelope.type === "namespaced-properties") {
			// Require rdf:type to be a word
			//if (message[gadgets.openapp.RDF + "type"] === "http://example.com/rdf/Word") {
				//var item = document.createElement("div");
				//item.appendChild(document.createTextNode(message[gadgets.openapp.RDF + "label"]));
				//document.getElementById("output").appendChild(item);
				//var storagemode = getSelection();
				//var mes = envelope.message[gadgets.openapp.RDF + "label"];
				//var sender = "";
				//var timestamp = new Date().getTime();
				//var actionType = envelope.event;
				//javascript:store(actionType, storagemode, mes, sender, timestamp);
			//}
		//}
	//}
//}

// TODO: Use correct CAM Schema
function store(actionType, storagemode,  messageLabel, messageTerm, messageContext, messageSrc, timestamp)
{
	if (storagemode == 'local') {
		var db = google.gears.factory.create('beta.database');
		db.open('database-test');
		db.execute('create table if not exists TestCamVoc (Storagemode text, MessageLabel text, MessageTerm text, MessageContext text, MessageSrc text, ActionType text, Timestamp int)');
		db.execute('insert into TestCamVoc values (?, ?, ?, ?, ?, ?, ?)', [storagemode, messageLabel, messageTerm, messageContext, messageSrc, actionType, timestamp]); 
		db.close();	
	}
	else if (storagemode == 'remote') {
		
		var groupTitle = "TestUser";
		var feedTitle = "TestFeedTitle";
		var feedUrl = messageSrc;
		var feedType = storagemode;
		var itemGuid = messageLabel;
		var eventTimestamp = timestamp;
		var eventActiontype = actionType;
		var eventContextValue = messageContext;
		var eventDescription = messageTerm;
		
		var params = '';
		params += 'groupTitle=' + groupTitle;
		params += '&feedTitle=' + feedTitle;
		params += '&feedUrl=' + feedUrl;
		params += '&feedType=' + feedType;
		params += '&itemGuid=' + itemGuid;
		params += '&eventTimestamp=' + eventTimestamp;
		params += '&eventActiontype=' + eventActiontype;
		
		params += '&eventContextValue=' + eventContextValue;
		params += '&eventDescription=' + eventDescription;
		
		
		//var url = 'http://duccio.informatik.rwth-aachen.de:9080/axis2/services/RemoteCamStorageService/storeCamToDB';
		var url = 'http://duccio.informatik.rwth-aachen.de:9080/RemoteCamStorage/services/RemoteCamStorage/storeCamToDB';
		var xmlHttp = null;
		try {
		      // Mozilla, Opera, Safari sowie Internet Explorer (ab v7)
		      xmlHttp = new XMLHttpRequest();
		} catch(e) {
			alert('request failed' + e);
		}
		xmlHttp.open("GET", url + '?' + params, true); 
		xmlHttp.send(null);
	}
} 

function query(limit)
{
	var db = google.gears.factory.create('beta.database');
	db.open('database-test');
	var rs = db.execute('select * from TestCamVoc order by Timestamp desc limit ' + limit);
	var result = "";
	while (rs.isValidRow()) {
	  var wert = "" +  rs.fieldByName("Storagemode") + " " + rs.fieldByName("MessageLabel") + " " + rs.fieldByName("MessageTerm") + " " + rs.fieldByName("MessageContext") + " " + rs.fieldByName("MessageSrc") + " " + rs.fieldByName("ActionType") + " " + rs.fieldByName("Timestamp") + "\n";
	  result = result + wert;
	  rs.next();
	}
	rs.close();
	alert(result);
}

