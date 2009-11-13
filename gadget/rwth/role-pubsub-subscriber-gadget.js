var acount = new Array();
var lastaccess = new Array();


function callback(sender, message) {
  tbl = document.getElementById("table");
  if(acount[message.from] == null) {acount[message.from] = 1;}
  else {acount[message.from] += 1;}
  lastaccess[message.from] = new Date(); 
  newtbl = document.createElement("table"); 
  newtbl.setAttribute("id","table");
  for (x in acount)
  {
	newentry = document.createElement("tr");
	
	newentry_jid = document.createElement("td");
	newentry_jid_value = document.createTextNode(x);
	newentry_jid.appendChild(newentry_jid_value);

	newentry_act = document.createElement("td");
	newentry_act_value = document.createTextNode(acount[x]+"");
	newentry_act.appendChild(newentry_act_value);
	
	newentry_lac = document.createElement("td");
	newentry_lac_value = document.createTextNode(lastaccess[x]+"");
	newentry_lac.appendChild(newentry_lac_value);

	newentry.appendChild(newentry_jid);
	newentry.appendChild(newentry_act);
	newentry.appendChild(newentry_lac);
	
	newtbl.appendChild(newentry);

  }
  document.getElementById("output").replaceChild(newtbl,tbl);
}

function subscribe() {
  gadgets.pubsub.subscribe("xmpp-message", callback);
}

function unsubscribe() {
  gadgets.pubsub.unsubscribe("xmpp-message");
  document.getElementById("output").innerHTML = "";
}