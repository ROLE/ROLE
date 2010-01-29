function VocabularyTrainer(){
	// private properties
	this.lists = new Array();
	this.currentListViewItems = new Array();
	this.currentTrainingItems = new Array();
	
	this.currentTrainingBucketNumber = 0;
	this.currentTrainingItemPos = 0;
	this.currentTrainingItemLetter = 0;
	
	this.listSelectsToUpdate = new Array();
	
	this.sessionCorrectAnswers = 0;
	this.sessionWrongAnswers = 0;
	this.sessionSuccessRate = 0;
	
	//index of the different selects to choose the last one after an update
	this.listListSelectIndex = 0;
	this.addListSelectIndex = 0;
	this.trainListSelectIndex = 0;
	this.statsListSelectIndex = 0;
	
	
}

	
VocabularyTrainer.prototype = {	
	
	// public methods
	
	getNumberOfLists: function(){
		return this.lists.length;
	},
	
	getList : function(listPos){
		
		if(listPos<this.lists.length){			
			return this.lists[listPos];
		}else{
			return null;
		}
	},

	getSessionCorrectAnswers: function(){
		return this.sessionCorrectAnswers;
	},
	getSessionWrongAnswers: function(){
		return this.sessionWrongAnswers;
	},
	getSessionSuccessRate: function(){
		return Math.round(this.sessionSuccessRate*100);
	}, 	
	
	
	
	getCurrentTrainingBucketNumber : function(){
		return this.currentTrainingBucketNumber;
	},
	
	setCurrentTrainingBucketNumber : function(currentTrainingBucketNumber){
		this.currentTrainingBucketNumber = currentTrainingBucketNumber;
	},	
	
	getCurrentListViewItems : function(){
		return this.currentListViewItems;
	},
	
	setCurrentListViewItems : function(currentListViewItems){
		this.currentListViewItems = currentListViewItems;
	},	
	
	getCurrentTrainingItems : function(){
		return this.currentTrainingItems;
	},
	
	setCurrentTrainingItems : function(currentTrainingItems){
		this.currentTrainingItems = currentTrainingItems;
		this.currentTrainingItemPos = 0;
		this.sessionCorrectAnswers = 0;
		this.sessionWrongAnswers = 0;
		this.sessionSuccessRate = 0;
	},
	
	getNextTrainingItem : function(){
		
		this.currentTrainingItemLetter = 0;
		
		if(this.currentTrainingItemPos<this.currentTrainingItems[this.currentTrainingBucketNumber-1].length){
			
			return this.currentTrainingItems[this.currentTrainingBucketNumber-1][this.currentTrainingItemPos];
		}else{
			return null;
		}		
	},
	
	getNextTrainingItemLetters : function(){
		var item = this.currentTrainingItems[this.currentTrainingBucketNumber-1][this.currentTrainingItemPos];
		
		if(this.currentTrainingItemLetter<item.translations[0].translation.length){
			var letter =  item.translations[0].translation.substring(0,this.currentTrainingItemLetter+1);
			this.currentTrainingItemLetter++;
			return letter;
		}else{
			return item.translations[0].translation;
		}
	},
	
	isAnswerCorrectForTrainingItem : function (answer){
		var translations =
			this.currentTrainingItems[this.currentTrainingBucketNumber-1][this.currentTrainingItemPos].translations;
		
		var answerCorrect = false;
		
		for(var i=0;i<translations.length;i++){
			if(translations[i].translation == answer){
				answerCorrect = true;
			}
		}
		this.currentTrainingItemPos++;
		
		if(answerCorrect){
			this.sessionCorrectAnswers++;
		}else{
			this.sessionWrongAnswers++;
		}
		
		if(this.sessionCorrectAnswers+this.sessionWrongAnswers >0){
			this.sessionSuccessRate = this.sessionCorrectAnswers/(this.sessionCorrectAnswers+this.sessionWrongAnswers);
		}else{
			this.sessionSuccessRate = 0;
		}
		
		return answerCorrect;
	},
	
	setLists : function(listArray){
		//clear lists
		this.lists = new Array();
		
		//make a deep copy of each list 
		for(var i = 0;i<listArray.length;i++){
			var list = new Object();
			list.listName = listArray[i].listName;
			list.listId = listArray[i].listId;
			list.sourceLanguage = listArray[i].sourceLanguage;
			list.targetLanguage = listArray[i].targetLanguage;
			list.correctAnswers = listArray[i].correctAnswers;
			list.wrongAnswers = listArray[i].wrongAnswers;
			list.numberOfItems = listArray[i].numberOfItems;
			list.score = listArray[i].score;
			list.successRate = listArray[i].successRate;
			list.progress = listArray[i].progress;
			
			list.bucket1 = new Object();  
			list.bucket1.numberOfItems = listArray[i].bucket1.numberOfItems;
			list.bucket1.correctAnswers = listArray[i].bucket1.correctAnswers;
			list.bucket1.wrongAnswers = listArray[i].bucket1.wrongAnswers;
			list.bucket1.successRate = listArray[i].bucket1.successRate;
			
			list.bucket2 = new Object();  	
			list.bucket2.numberOfItems = listArray[i].bucket2.numberOfItems;
			list.bucket2.correctAnswers = listArray[i].bucket2.correctAnswers;
			list.bucket2.wrongAnswers = listArray[i].bucket2.wrongAnswers;
			list.bucket2.successRate = listArray[i].bucket2.successRate;
			
			list.bucket3 = new Object();  
			list.bucket3.numberOfItems = listArray[i].bucket3.numberOfItems;
			list.bucket3.correctAnswers = listArray[i].bucket3.correctAnswers;
			list.bucket3.wrongAnswers = listArray[i].bucket3.wrongAnswers;
			list.bucket3.successRate = listArray[i].bucket3.successRate;
			
			list.bucket4 = new Object();  
			list.bucket4.numberOfItems = listArray[i].bucket4.numberOfItems;
			list.bucket4.correctAnswers = listArray[i].bucket4.correctAnswers;
			list.bucket4.wrongAnswers = listArray[i].bucket4.wrongAnswers;
			list.bucket4.successRate = listArray[i].bucket4.successRate;
			
			list.bucket5 = new Object();  
			list.bucket5.numberOfItems = listArray[i].bucket5.numberOfItems;
			list.bucket5.correctAnswers = listArray[i].bucket5.correctAnswers;
			list.bucket5.wrongAnswers = listArray[i].bucket5.wrongAnswers;
			list.bucket5.successRate = listArray[i].bucket5.successRate;
	
			this.lists.push(list);
		}
	},
	
	
	
	updateListsSelects: function () {
		
		//clear all selects
		for(var j = 0;j<this.listSelectsToUpdate.length;j++){
			this.listSelectsToUpdate[j].innerHTML = "";
		}
		
		//update each select in the list
		for(var i = 0;i<this.lists.length;i++){			
			for(var j = 0;j<this.listSelectsToUpdate.length;j++){	
				//create an option for each list
				var option = document.createElement("OPTION");
						
				var text = this.lists[i].listName + " (items: " +this.lists[i].numberOfItems+", progress: "+Math.round(this.lists[i].progress*100)+"%)";
				
				var optionText=document.createTextNode(text);
					
				option.appendChild(optionText);
				option.setAttribute("value",i);
			
				this.listSelectsToUpdate[j].appendChild(option);
				
			}			
		}
		
		
	},
	
	registerListSelect: function (selectionId) {
		this.listSelectsToUpdate.push(document.getElementById(selectionId));
		this.updateListsSelects();
	},
		
	
	pushVItemsIntoTable: function (items, tableId, bucketPos, sourceLanguage, targetLanguage){
			
		//get table
		var table = document.getElementById(tableId);
		
		//clear table
		table.innerHTML = '<tr><th width="30"scope="col">&nbsp;</th><th width="92" scope="col">'+sourceLanguage+'</th><th width="112" scope="col">'+targetLanguage+'</th><th width="30" scope="col">&nbsp;</th><th width="30" scope="col">&nbsp;</th></tr>';
		
		switch (bucketPos) {
		  case 0:
			for(var i = 0;i<items.length;i++){
				this.pushBucketVItemsIntoTable(table,items[i]);
			}
			break;
		  case 1:
			this.pushBucketVItemsIntoTable(table,items[0]);
		    break;
		  case 2:
			this.pushBucketVItemsIntoTable(table,items[1]);
		    break;
		  case 3:
			this.pushBucketVItemsIntoTable(table,items[2]);
		    break;
		  case 4:
			this.pushBucketVItemsIntoTable(table,items[3]);
			break;
		  case 5:
			this.pushBucketVItemsIntoTable(table,items[4]);
			break;
		  default:
		    break;
		}
		
	},

	// public method
	pushBucketVItemsIntoTable : function (table,bucket) {
		
		for(var j = 0;j<bucket.length;j++){
			
			var tr = document.createElement("tr");	
			table.appendChild(tr);
			
			var checkboxCell = document.createElement("td");
			var cb = document.createElement("input"); // create input node
			cb.type = "checkbox"; // set type
			cb.name = "itemIds"; // set name if necessary
			cb.checked = cb.defaultChecked = false; // make it checked now and by default
			cb.value = bucket[j].itemId; 
			
			if(j==0){
				cb.id = "firstItemInList";	
			}
			
			
			checkboxCell.appendChild(cb);
			tr.appendChild(checkboxCell);
			
			//add term
			var sourceLanguageCell = document.createElement("td");
			var term = document.createTextNode(bucket[j].term);
			sourceLanguageCell.appendChild(term);
			tr.appendChild(sourceLanguageCell);
			
			//add translations
			var targetLanguageCell = document.createElement("td");
			var translations = "";
			
			for(var k = 0;k<bucket[j].translations.length;k++){
				translations += bucket[j].translations[k].translation;//bucket[j].translations[k].translation;
				
				if(k != bucket[j].translations.length-1){
					translations += ", ";
				}
			}
			
			var textNode = document.createTextNode(translations);
			targetLanguageCell.appendChild(textNode);
			tr.appendChild(targetLanguageCell);
			
			
			var sourceCell = document.createElement("td");
			tr.appendChild(sourceCell);
			//add source of the context if it exists
			if(bucket[j].contexts.length > 0 && bucket[j].contexts[0].source != ""){

				var newlink = document.createElement('a');
				newlink.setAttribute('href', bucket[j].contexts[0].source);
				sourceCell.appendChild(newlink);
				newlink.setAttribute("target","_blank");
				
				var txt = document.createTextNode("source");
				newlink.appendChild(txt);
				
			}
			
		}
	}

}