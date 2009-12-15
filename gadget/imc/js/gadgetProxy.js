			
	
	pmrpc.register( {
	  "publicProcedureName" : "HelloPMRPC",
	  "procedure" : function (alertText, pmrpcCallback) { 
		  alert("HelloPMRPC: Got Message from Server::" + alertText); 
		  pmrpcCallback(getSelectedText(alertText));}, 
	  "isAsynchronous" : true } );
	
	pmrpc.register( {
		  "publicProcedureName" : "fetchSelection",
		  "procedure" : function (proxyPrefix, pmrpcCallback) { 
			  alert("fetchSelection: Got Message from Server::" + proxyPrefix); 
			  pmrpcCallback(getSelectedText(proxyPrefix));}, 
		  "isAsynchronous" : true } );
	
	
	function getSelectedText(proxyPrefix){
		
		var selection = "No Selection";
		
		var currentLocation = window.location.href;
		
		//as this javascript is executed we are using the proxy
		//just check if its the right one
		if(currentLocation.substring(0,proxyPrefix.length) == proxyPrefix){
			currentLocation = currentLocation.substring(proxyPrefix.length);
		}
		
		//firefox
		if(window.getSelection){
			selection = window.getSelection().toString();
		}
		
		var returnvalue = {"selection": selection, "src": currentLocation};
		
		return returnvalue;
	}
