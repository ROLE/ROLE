function VocabularyTrainerService(restWebserviceUrl){
		
	this.restWebserviceUrl = restWebserviceUrl;	
	this.authString = "";	
}


	
VocabularyTrainerService.prototype = {
		
	setAuthString : function(authString){
		this.authString = authString;
	},

	login : function(requestHandler){
			
		//prepare parameter
		var params = {}; 
		params[gadgets.io.RequestParameters.HEADERS] = {
		  "Authorization" : this.authString
		};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] =0;	
		
		//add salt vs caching
		url= this.restWebserviceUrl+"login"+"#"+(new Date()).getTime();
		
		gadgets.io.makeRequest(url, requestHandler, params);
	}, 
	
	fetchUserLists : function(user,requestHandler) {
		
		//prepare parameter
		var params = {};
		params[gadgets.io.RequestParameters.HEADERS] = {
		  "Authorization" : this.authString
		};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] =0;	

		//add salt vs caching
		var url= this.restWebserviceUrl + "userLists/"+user+"#"+(new Date()).getTime();
		
		
		gadgets.io.makeRequest(url, requestHandler, params); 		
	},
	
	fetchUserItems : function(user,listId,requestHandler){
		
		//prepare parameter
		var params = {}; 
		params[gadgets.io.RequestParameters.HEADERS] = {
		  "Authorization" : this.authString
		};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] =0;	
	
		//add salt vs caching
		url=  this.restWebserviceUrl +"userItems/"+user+"/"+listId+"#"+(new Date()).getTime();
		
		gadgets.io.makeRequest(url, requestHandler, params);
	},
	
	addItem : function(listId,itemString,requestHandler){
		
		//prepare parameter
		var params = {}; 
		params[gadgets.io.RequestParameters.HEADERS] = {
		  "Authorization" : this.authString
		};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;
		params[gadgets.io.RequestParameters.POST_DATA] = itemString;
	
		//add salt vs caching
		url= this.restWebserviceUrl +"item/"+listId+"#"+(new Date()).getTime();		
				
		gadgets.io.makeRequest(url, requestHandler, params);
	},
	
	deleteItem : function(listId,itemId,requestHandler){
		
		//prepare parameter
		var params = {}; 
		params[gadgets.io.RequestParameters.HEADERS] = {
		  "Authorization" : this.authString
		};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.DELETE;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;
	
		//add salt vs caching
		url= this.restWebserviceUrl +"item/"+listId+"/"+itemId+"#"+(new Date()).getTime();		
				
		gadgets.io.makeRequest(url, requestHandler, params);
	},
	
	fetchUserScore : function(user,requestHandler){
	
		var params = {}; 
		params[gadgets.io.RequestParameters.HEADERS] = {
		  "Authorization" : this.authString
		}
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;
	
		//add salt vs caching
		url= REST_WEB_SERVICE_URL+"score/"+user+"#"+(new Date()).getTime();		
				
		gadgets.io.makeRequest(url, requestHandler, params);	
	
	},
	
	deleteList : function(listId ,requestHandler){
		
		//prepare parameter
		var params = {}; 
		params[gadgets.io.RequestParameters.HEADERS] = {
		  "Authorization" : this.authString
		};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.DELETE;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] =0;	
		
		//add salt vs caching
		url= this.restWebserviceUrl+"list/"+listId+"#"+(new Date()).getTime();
		
		gadgets.io.makeRequest(url, requestHandler, params);
	},
	
	transmitTrainedItem:function(user,itemId,answerCorrect,requestHandler){
		var postData;
		
		if(answerCorrect){
			postData = "{'answerCorrect':'true'}";
		}else{
			postData = "{'answerCorrect':'false'}";
		}
		//prepare parameter
		var params = {}; 
		params[gadgets.io.RequestParameters.HEADERS] = {
		  "Authorization" : this.authString
		};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] =0;
		params[gadgets.io.RequestParameters.POST_DATA] = postData;
		
		//add salt vs caching
		url= this.restWebserviceUrl+"train/"+user+"/"+itemId+"#"+(new Date()).getTime();
		
		gadgets.io.makeRequest(url, requestHandler, params);
		
	},

	registerUser:function(newUserName,newEmail,newPassword,requestHandler){
		
		var postData = "userName="+newUserName+"&email="+newEmail+"&password="+newPassword;

		alert(postData);	

		//prepare parameter
		var params = {}; 
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] =0;
		params[gadgets.io.RequestParameters.POST_DATA] = gadgets.io.encodeValues({
			userName : newUserName,
			email : newEmail,
			password : newPassword
			});
		
		//add salt vs caching
		var url= this.restWebserviceUrl+"user#"+(new Date()).getTime();
		
		gadgets.io.makeRequest(url, requestHandler, params);
		
	},
	
	createNewList:function(userName,listString,requestHandler){
		
		var postData = listString;

		//prepare parameter
		var params = {}; 
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
		params[gadgets.io.RequestParameters.REFRESH_INTERVAL] =0;
		params[gadgets.io.RequestParameters.POST_DATA] = postData;
		
		//add salt vs caching
		var url= this.restWebserviceUrl+"list/0/"+userName+"#"+(new Date()).getTime();
		
		gadgets.io.makeRequest(url, requestHandler, params);
		
	}
	
	
	
}