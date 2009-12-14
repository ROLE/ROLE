function submitToGoogleDictTranslation(value,src,dest){
		var params = {};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
		
		//var host = "www.google.com";
		//var get  = "/dictionary/feeds?client=ig&restrict=pr&langpair=en|de&hl=en&q="+value;
		
		//var url = "http://"+host+get;
		
		var url = createGoogleDictURL(value, "en", "de");
		
		gadgets.io.makeRequest(url, googleDictTranslationHandler, params);		
	}
	
	function createGoogleDictURL(term, lang1, lang2) {
		
		lang1 = lang1 + _esc("|") + lang2;
		var urlArray = [];
		
		urlArray.push("http://www.google.com/dictionary/feeds?",
				"client=ig&restrict=pr,al&langpair=", 
				lang1 + "&q=" + _esc(term),
				"&hl=" + "x");
		
	
		return urlArray.join("")
	}
	
	
	function googleDictTranslationHandler(obj){
	
		//get dictionaryPage node			
		var dictionaryPage = obj.data.childNodes[0];
	
		//get result node
		var result;
		for(var i=0;i<dictionaryPage.childNodes.length;i++){
			if(dictionaryPage.childNodes[i].nodeName == "result")
					result = dictionaryPage.childNodes[i];
		}
	
		//get primary node and sourceLanguage
		var primary;
		for(var i=0;i<result.childNodes.length;i++){
			if(result.childNodes[i].nodeName == "primary")
					primary = result.childNodes[i];
		}
		
		if(result.childNodes.length == 0){
			return false;
		}
		
		// get source language( en  = 0)
		var source_language = primary.attributes[0].nodeValue;
		var query = "";
			
		for(var i=0;i<primary.childNodes.length && i<15 ;i++){
	
			var tmpNode = primary.childNodes[i];
			
			if(tmpNode.nodeName == "term"){
										
				if(tmpNode.attributes[0].nodeValue == source_language){
					//no Pronunciation needed
					/*
					var definition = new Object();
					definition.text = query;
					definition.description= "";
					definition.url= "";
					definition.imageUrl = "";
					
					var isPronunciation = false;
					
					for(var j=0;j<tmpNode.childNodes.length;j++){
						if(tmpNode.childNodes[j].nodeName == "text")
							definition.text = tmpNode.childNodes[j].firstChild.nodeValue;
							
						if(tmpNode.childNodes[j].nodeName == "PronunciationGroup"){
							for(var l=0;l<tmpNode.childNodes[j].childNodes.length;l++){
								if(tmpNode.childNodes[j].childNodes[l].nodeName == "text"){
								
									definition.description = tmpNode.childNodes[j].childNodes[l].firstChild.nodeValue;
									isPronunciation = true;
									
								}
							}
						}
					}	
					
					if(isPronunciation){		
						addResultToPronunciation("GoogleDict", definition.text, 
							definition.description, definition.url, definition.imageUrl);
							
						query = definition.text;
					}else{
						
						addResultToDefinition("GoogleDict", definition.text, 
							definition.description, definition.url, definition.imageUrl);
					}					
					*/										
				// else it will be a translation
				}else{
					var definition = new Object();
					definition.text = query;
					definition.description= "";
					definition.url= "";
					definition.imageUrl = "";
					
					
					for(var j=0;j<tmpNode.childNodes.length;j++){
						if(tmpNode.childNodes[j].nodeName == "text")
							definition.description = tmpNode.childNodes[j].firstChild.nodeValue;
					}
						
					addResultToTranslation("GoogleDict", definition.text, 
						definition.description, definition.url, definition.imageUrl);				
				}
			}
		}		
	}
	

	
	function submitChangeToGoogleTranslation(value,src,dest){
	  google.language.translate(value, src, dest, googleTranslationHandler);		
	}
	
	function googleTranslationHandler(result){
	  var str;
	  
	  if (result.translation) {
		str = result.translation.replace('>', '&gt;').replace('<', '&lt;');
	  } else {	  	
		str = '<span style=\"color:red\">Error Translating</span>';
	  }		
	  
	  addResultToTranslation("Google translation", "", str, "", "");
	}	
	