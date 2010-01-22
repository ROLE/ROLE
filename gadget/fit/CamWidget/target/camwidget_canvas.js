/**
 * Cam Widget
 * This JavaScript file is for Canvas view.
 */

function init() {
    // TODO: Write the code for initializing.
}

/**
 * selection of the user (Remote, Local, Off
 */
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

function getLastEntry() {
	var storagemode = getSelection();
	var resultEntry = null;
	var storeLive = false;
	if (storagemode == 'local') {
		if (storeLive) {
			resultEntry = getLastEntryLocal('database-RoleCam');
		} else {
			resultEntry = getLastEntryLocal('database-RoleCamTest');
		}		
		alert(Object.toJSON(resultEntry));
	}
	else if (storagemode == 'remote') {
		var params  = {};
	   	var postdata = {
	   		storeLive : storeLive
	   	};
	   	
	   	params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
	   	params[gadgets.io.RequestParameters.POST_DATA]= gadgets.io.encodeValues(postdata);	   	
	   	params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.Text;
		var url = "http://duccio.informatik.rwth-aachen.de:9080/axis2/services/CamQueryService/getLastEntry";
	   	gadgets.io.makeRequest(url, getLastEntryCallback, params);
	}
	return resultEntry;	
}
// handles the result of the WebService Method
function getLastEntryCallback(obj){
	var camRequestResult = obj.data;
	alert(camRequestResult);
}


// TODO how do i access envelope.date?
function camWidgetCallback(envelope, message) {
	// Filter out select events
	var messageLabel = message["http://www.role-project.eu/rdf/words/label"];
	if (Object.isUndefined(messageLabel)) {
		// hack to make pubsub sample running
		messageLabel = message[gadgets.openapp.RDF + "label"];
		if (Object.isUndefined(messageLabel)) {
			messageLabel = "noMessageLabelAvailable";
		}
	}
	var messageTerm = message["http://www.role-project.eu/rdf/words/term"];
	if (Object.isUndefined(messageTerm)) {
		messageTerm = "noMessageTermAvailable";
	}
	var messageContext = message["http://www.role-project.eu/rdf/words/context"];
	if (Object.isUndefined(messageContext)) {
		messageContext = "noMessageTermContext";
	}
	var messageSrc = message["http://www.role-project.eu/rdf/words/source"];
	if (Object.isUndefined(messageSrc)) {
		messageSrc = "noMessageSrcAvailable";
	}
	var timestamp = new Date();
	var actionType = envelope.event;
	
	// minimum relatedData
	var relatedData1 = new RelatedData("messageTerm", messageTerm);
	var relatedData2 = new RelatedData("messageContext", messageContext);
	// minimum event
	var event = new Event(actionType, dateToJson(timestamp), new Array(relatedData1, relatedData2));
	// minimal item
	var item = new Item(messageLabel, messageSrc, new Array(event));
	// minimal feed
	var feed  = new Feed(messageLabel, messageSrc, "feedType_json", new Array(item));
	/*
	// readTimes
	var rt1 = new ReadTime("rt1");
	feed.readTimes.push(rt1);
	var rt2 = new ReadTime("rt2");
	feed.readTimes.push(rt2);
	// altUrls	
	var altUrl1 = new AltUrl("altUrl1");
	feed.altUrls.push(altUrl1);
	var altUrl2 = new AltUrl("altUrl2");
	feed.altUrls.push(altUrl2);
	*/
	// Group
	var group = new Group("testUser", new Array(feed, feed));
		  	
	storeJsonGroup(group, false);
}
 	
function storeJsonGroup(group, storeLive) {
	var storagemode = getSelection();
	if (storagemode == 'local') {
		var db = google.gears.factory.create('beta.database');
		if (storeLive) {
			db.open('database-RoleCam');
		} else {
			db.open('database-RoleCamTest');
		}
		
		// create Tables
		createLocalTables(db);
		// store
		storeCamLocal(db, group);
		
		// close db
		db.close();			
	}
	else if (storagemode == 'remote') {
		var jsonGroup = Object.toJSON(group);
		var params  = {};
	   	var postdata = {
	   		jsonGroup : jsonGroup,
	   		storeLive : storeLive
	   	};
	   	
	   	params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
	   	params[gadgets.io.RequestParameters.POST_DATA]= gadgets.io.encodeValues(postdata);	   	
	   	params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.Text;
		var url = "http://duccio.informatik.rwth-aachen.de:9080/axis2/services/CamStoreService/storeCam";
	   	gadgets.io.makeRequest(url, storeCamCallback, params);
	}
} 

// handles the result of the WebService Method
function storeCamCallback(obj){
	var x = obj.data;
	// wenn speichern nicht geklappt -> alert
	if (x.indexOf("false") != -1) {
		alert("x: " + x);
	}
}
