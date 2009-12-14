function getPhotosFromFlickr(searchTerm, numberOfPhotos){
			
	var apiKey = "4ff5a72e24176cda16f9e35914d2f9e8";
	
	var url = "http://api.flickr.com/services/rest/?method=flickr.photos.search"+
		"&api_key="+apiKey+
		"&text="+_esc(searchTerm)+
		"&content_type=1"+
		"&extras=url_t%2C+url_s%2C+url_m"+
		"&per_page="+numberOfPhotos+
		"&page=1"+
		"&accuracy=1"+
		"&sort=relevance";
	
	var params = {};
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;	
		
	gadgets.io.makeRequest(url, getPhotosFromFlickrHandler, params);	
}
	
function getPhotosFromFlickrHandler(obj){	
	
	var ul = document.getElementById('flickrPhotoList');
	
	//get root
	var rsp = obj.data.childNodes[0];
	
	//check if answer is ok
	if(rsp.attributes[0].nodeValue != "ok"){
		alert(obj.text);
	}else{
		ul.innerHTML = "";
	}		
	
	//get photos element	
	var photos = null;
	for(var i=0;i<rsp.childNodes.length && i < 3;i++){
		if(rsp.childNodes[i].nodeName == "photos"){
			photos = rsp.childNodes[i];
		}
	}
	
	//get Photos
	var photoArray = new Array();
	for(var i=0;i<photos.childNodes.length;i++){
		
		
		if(photos.childNodes[i].nodeName == "photo"){
			var photo = photos.childNodes[i];
			photo.title = "";
			photo.url = "";
			photo.height = "";
			photo.width = "";
			
			for(var j=0;j<photo.attributes.length;j++){
				
			
				if(photo.attributes[j].nodeName == "title"){
					photo.title = photo.attributes[j].nodeValue
				}
				if(photo.attributes[j].nodeName == "url_s"){
					photo.url = photo.attributes[j].nodeValue
				}
				if(photo.attributes[j].nodeName == "height_s"){
					photo.height = photo.attributes[j].nodeValue
				}
				if(photo.attributes[j].nodeName == "width_s"){
					photo.width = photo.attributes[j].nodeValue
				}
			}
			
			photoArray.push(photo);
		}
	}
	
	//display the photos
	for(var i=0;i<photoArray.length;i++){
		
		var photo = photoArray[i];
		
		var li = document.createElement("li");
		ul.appendChild(li);
		
		var input = document.createElement("input");
		input.name = "suggestedImages";
		input.type = "checkbox";
		input.setAttribute("value",photo.url);
		li.appendChild(input);
		
		var img = document.createElement("img");
		img.src = photo.url;
		img.alt = photo.title;
		img.style.height = "60px";
		li.appendChild(img);
		
	}
}