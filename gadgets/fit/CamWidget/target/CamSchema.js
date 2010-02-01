/**
 * JavaScript representation of the CAM Schema
 * Root Element: Group
 */

function Group(title, feeds)
{
	this.groupId = null; // (Integer) auto generated 
    this.title = title; // (String) required
    this.feeds = feeds; // (Feed) required
}

function Feed(title, url, type, items) 
{
	this.feedId = null; // (Integer) auto generated
	this.altUrls = new Array(); // (String)
	this.dateAdded = null; // (Date)
	this.dateRemoved = null; // (Date)
	this.lastRead = null; // (Date)
	this.lastUpdated = null; // (String)
	this.readTimes = new Array(); // (String)
	this.title = title; // (String) required
	this.type = type; // (String) required
	this.url = url; // (String) required
	this.userFeed = null; // (String)
	this.userProfile = null; // (String)
	this.items = items; // (Item) required
}

function AltUrl(url)
{
	this.urlId = null; // (Integer) auto generated
	this.url = url; // (String)  
}

function ReadTime(readTime)
{
	this.readTimeId = null; // (Integer) auto generated
	this.readTime = readTime; // (String)  
}

function Item(title, guid, events)
{
	this.itemId = null; // (Integer) auto generated
	this.guid = guid; // (String) required
	this.title = title; // (String) required
	this.type = null; // (String)
	this.events = events; // (Event) required
	
}

function Event(actionType, dateTime, relatedData) 
{
	this.eventId = null; // (Integer) auto generated
	this.actionType = actionType; // (String) required
	this.contextValue = null; // (String)
	this.contextValueType = null; // (String)
	this.dateTime = dateTime; // (Date) required
	this.description = null; // (String) 
	this.duration = null; // (Double)
	this.followedLink = null; // (String)
	this.ipAddress = null; // (String)
	this.other = null; // (String)
	this.sessionId = null; // (String)
	this.tags = null; // (String)
	this.userDiscipline = null; // (String)
	this.userEmail = null; // (String)
	this.userName = null; // (String)
	this.voteLink = null; // (String)
	this.xfn = null; // (String)
	this.relatedData = relatedData; // (RelatedData Array) required
}

function RelatedData(name, content)
{
	this.relatedDataId = null; // (Integer) auto generated
	this.content = content; // (String) 
	this.describingSchema = null; // (String)
	this.name = name; // (String)	 
}

// --------------------------------------------------------

/**
 * converts a date object into the correct format to convert the object to JSON
 */
function dateToJson(date) {
	var day = date.getDate();
	if (day < 10){
		day = "0" + day;
	}
	var month = date.getMonth()+1;
	if (month < 10){
		month = "0" + month;
	}
	var year = date.getFullYear();
	var hours = date.getHours();
	if (hours < 10){
		hours = "0" + hours;
	}
	var minutes = date.getMinutes();
	if (minutes < 10){
		minutes = "0" + minutes;
	}
  	var seconds = date.getSeconds();
	if (seconds < 10){
		seconds = "0" + seconds;
	}

	return day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
}

/************************************
 * 
 * STORAGE
 *
 ************************************/

/**
 * create all tables needed to store CAM
 */
function createLocalTables(db) {
	db.execute('create table if not exists grouptable ( groupId integer primary key autoincrement, title varchar(255) not null)');
	db.execute('create table if not exists feed ( feedId integer not null primary key autoincrement, dateAdded datetime default null, dateRemoved datetime default null, lastRead datetime default null, lastUpdated varchar(255) default null, title varchar(255) not null, type varchar(255) not null, url varchar(255) not null, userFeed varchar(255) default null, userProfile varchar(255) default null, groupId integer not null constraint groupId references grouptable(groupId) on delete cascade )');
	db.execute('create table if not exists alturl ( urlId integer not null primary key autoincrement, url varchar(255) default null, feedId integer not null constraint feedId references feed(feedId) on delete cascade )');
	db.execute('create table if not exists readtime ( readTimeId integer not null primary key autoincrement, readTime varchar(255) default null, feedId integer not null constraint feedId references feed(feedId) on delete cascade )');
	db.execute('create table if not exists item ( itemId integer not null primary key autoincrement, guid varchar(255) not null, title varchar(255) not null, type varchar(255) default null, feedId integer not null constraint feedId references feed(feedId) on delete cascade )');	
	db.execute('create table if not exists event ( eventId integer not null primary key autoincrement, actionType varchar(255) not null, contextValue varchar(255) default null, contextValueType varchar(255) default null, dateTime datetime not null, description varchar(255) default null, duration double default null, followedLink varchar(255) default null, ipAddress varchar(255) default null, other varchar(255) default null, sessionId varchar(255) default null, tags varchar(255) default null, userDiscipline varchar(255) default null, userEmail varchar(255) default null, userName varchar(255) default null, voteLink varchar(255) default null, xfn varchar(255) default null, itemId integer not null constraint itemId references item(itemId) on delete cascade ) ');
	db.execute('create table if not exists relateddata ( relatedDataId integer not null primary key autoincrement, content varchar(255) default null, describingSchema varchar(255) default null, name varchar(255) default null, eventId integer not null constraint eventId references event(eventId) on delete cascade )');
}

/**
 * stores a Group element and returns the element including the ids
 */
function storeCamLocal(db, group) {
	var storedGroup = storeGroup(db, group);
	return storedGroup;
}

function storeGroup(db, group) {
	var rs = null;
	var groupId = null;

	try {
		rs = db.execute('select groupId from grouptable where title = ?', [group.title]);
		groupId = rs.field(0);
		if (groupId == null) {
			db.execute('insert into grouptable values (?, ?)', [null, group.title]);
			rs = db.execute('select groupId from grouptable where title = ?', [group.title]);
			groupId = rs.field(0);
		}
	} catch (e) {
		alert(e);
	}	
	
	// store feeds
	group.groupId = groupId;
	group.feeds = storeFeeds(db, group.feeds, groupId);	
	return group;
}

/**
 * stores feeds and returns feedIds (array)
 */
function storeFeeds(db, feeds, groupId) {
	var rs = null;

	try {
		var countFeeds=0;
		for (countFeeds=0; countFeeds<feeds.length; ++countFeeds) {
			var feed = feeds[countFeeds];
			rs = db.execute('select feedId from feed where title = ? and url = ? and type = ? and groupId = ?', [feed.title, feed.url, feed.type, groupId]);
			var feedId = rs.field(0);
			if (feedId == null) {
				db.execute('insert into feed values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [null, feed.dateAdded, feed.dateRemoved, feed.lastRead, feed.lastUpdated, feed.title, feed.type, feed.url, feed.userFeed, feed.userProfile, groupId]);
				rs = db.execute('select feedId from feed where title = ? and url = ? and type = ? and groupId = ?', [feed.title, feed.url, feed.type, groupId]);
				feedId = rs.field(0);
			}
			feeds[countFeeds].feedId = feedId;			
			// store altUrls
			feeds[countFeeds].altUrls = storeAltUrls(db, feed.altUrls, feedId);
			// store readTimes
			feeds[countFeeds].readTimes = storeReadTimes(db, feed.readTimes, feedId);
			// store Items
			feeds[countFeeds].items = storeItems(db, feed.items, feedId);
		}
	} catch (e) {
		alert(e);
	}
		
	return feeds;
}

function storeItems(db, items, feedId) {
	var rs = null;
	
	try {
		var countItems = 0;
		for (countItems=0; countItems<items.length; ++countItems) {
			var item = items[countItems];
			rs = db.execute('select itemId from item where title = ? and guid = ? and feedId = ?', [item.title, item.guid, feedId]);
			var itemId = rs.field(0);
			if (itemId == null) {
				db.execute('insert into item values (?, ?, ?, ?, ?)', [null, item.guid, item.title, item.type, feedId]);
				rs = db.execute('select itemId from item where title = ? and guid = ? and feedId = ?', [item.title, item.guid, feedId]);
				itemId = rs.field(0);
			}
			// store events
			items[countItems].itemId = itemId;
			items[countItems].events = storeEvents(db, item.events, itemId);
		}		
	} catch (e) {
		alert(e);
	}
	
	return items;	
}

function storeEvents(db, events, itemId) {
	var rs = null;
	try {
		var countEvents=0;
		for (countEvent=0; countEvents < events.length; ++countEvents) {
			var event = events[countEvents];
			rs = db.execute('select eventId from event where actionType = ? and dateTime = ? and itemId = ?', [event.actionType, event.dateTime, itemId]);
			var eventId = rs.field(0);
			if (eventId == null) {
				db.execute('insert into event values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
				[null, event.actionType, event.contextValue, event.contextValueType, event.dateTime, event.description, event.duration, 
				event.followedLink, event.ipAddress, event.other, event.sessionId, event.tags, event.userDiscipline, event.userEmail, event.userName, 
				event.voteLink, event.xfn, itemId]);
				rs = db.execute('select eventId from event where actionType = ? and dateTime = ? and itemId = ?', [event.actionType, event.dateTime, itemId]);
				eventId = rs.field(0);
			}
			
			// store relatedData
			events[countEvents].eventId = eventId;
			events[countEvents].relatedData = storeRelatedData(db, event.relatedData, eventId);
		}
	} catch (e) {
		alert(e);
	}
	return events;
}

function storeRelatedData(db, relatedData, eventId) {
	var rs = null;
	try {
		var countRelatedData = 0;
		for (countRelatedData=0; countRelatedData < relatedData.length; ++countRelatedData) {
			var relatedDate = relatedData[countRelatedData];
			rs = db.execute('select relatedDataId from relateddata where name = ? and content = ? and eventId = ?', [relatedDate.name, relatedDate.content, eventId]);
			var relatedDataId = rs.field(0); 
			if (relatedDataId == null) {
				db.execute('insert into relateddata values (?, ?, ?, ?, ?)', [null, relatedDate.content, relatedDate.describingSchema, relatedDate.name, eventId]);
				rs = db.execute('select relatedDataId from relateddata where name = ? and content = ? and eventId = ?', [relatedDate.name, relatedDate.content, eventId]);
				relatedDataId = rs.field(0); 
			}
			relatedData[countRelatedData].relatedDataId = relatedDataId;
		}
	} catch (e) {
		alertr(e);
	}
	return relatedData;
}


function storeAltUrls(db, altUrls, feedId) {
	var rs = null;
	
	try {
		var countUrls=0;
		for (countUrls=0; countUrls<altUrls.length; ++countUrls) {
			urlIds = new Array();
			var altUrl = altUrls[countUrls];
			rs = db.execute('select urlId from alturl where url = ? and feedId = ?', [altUrl.url, feedId]);
			var urlId = rs.field(0);
			if (urlId == null) {
				db.execute('insert into alturl values (?, ?, ?)', [null, altUrl.url, feedId]);
				rs = db.execute('select urlId from alturl where url = ? and feedId = ?', [altUrl.url, feedId]);
				urlId = rs.field(0);
			}
			altUrls[countUrls].urlId = urlId;
		}
	} catch (e) {
		alert(e);
	}
	return altUrls;
}

function storeReadTimes(db, readTimes, feedId) {
	var rs = null;
	
	try {
		var countReadTimes=0;
		for (countReadTimes=0; countReadTimes<readTimes.length; ++countReadTimes) {
			readTimeIds = new Array();
			var readTime = readTimes[countReadTimes];
			rs = db.execute('select readTimeId from readtime where readTime = ? and feedId = ?', [readTime.readTime, feedId]);
			var readTimeId = rs.field(0);
			if (readTimeId == null) {
				db.execute('insert into readtime values (?, ?, ?)', [null, readTime.readTime, feedId]);
				rs = db.execute('select readTimeId from readtime where readTime = ? and feedId = ?', [readTime.readTime, feedId]);
				readTimeId = rs.field(0);
			}
			readTimes[countReadTimes].readTimeId = readTimeId;
		}
	} catch (e) {
		alert(e);
	}
	return readTimes;
}

/************************************
 * 
 * QUERY
 *
 ************************************/

function getLastEntryLocal(databaseName) {
	var db = google.gears.factory.create('beta.database');
	db.open(databaseName);
	var event = getLastEvent(db);
	event.relatedData = getRelatedData(db, event.eventId);
	var item = getItem(db, event.itemId);
	item.events = new Array(event);
	// feed
	var feed = getFeed(db, item.feedId);
	feed.items = new Array(item);

	// group	
	var group = getGroup(db, feed.groupId);
	group.feeds = new Array(feed);
	return group;
}

function getGroup(db, groupId) {
	var rs = db.execute('select * from grouptable where groupId = ?', [groupId]);
	// ein feed-entry kann nur zu einer Group gehören (hat eine groupId)
	var group = new Group(rs.fieldByName("title"), null);
	group.groupId = rs.fieldByName("groupId");
	rs.close();
	return group;
}

function getFeed(db, feedId) {
	var rs = db.execute('select * from feed where feedId = ?', [feedId]);
	// ein item-entry kann nur zu einem Feed gehören (hat eine feedId)
	var feed = new Feed(rs.fieldByName("title"), rs.fieldByName("url"), rs.fieldByName("type"), null);
	feed.dateAdded = rs.fieldByName("dateAdded");
	feed.dateRemoved = rs.fieldByName("dateRemoved");
	feed.lastRead = rs.fieldByName("lastRead");
	feed.lastUpdated = rs.fieldByName("lastUpdated");
	feed.userFeed = rs.fieldByName("userFeed");
	feed.userProfile = rs.fieldByName("userProfile");
	feed.feedId = rs.fieldByName("feedId");
	feed.groupId = rs.fieldByName("groupId");
	// altUrl
	feed.altUrls = getAltUrls(db, feedId);
	// readTime
	feed.readTime = getReadTimes(db, feedId);	
	
	rs.close();
	return feed;
}

function getAltUrls(db, feedId) {
	var rs = db.execute('select * from alturl where feedId = ?', [feedId]);
	var altUrls = new Array();
	while (rs.isValidRow()) {
		var altUrl = new AltUrl(rs.fieldByName("url"));
		altUrl.urlId = rs.fieldByName("urlId");
		altUrl.feedId = rs.fieldByName("feedId");
		altUrls.push(altUrl);
		rs.next();		
	}
	rs.close();
	return altUrls;
}

function getReadTimes(db, feedId) {
	var rs = db.execute('select * from readtime where feedId = ?', [feedId]);
	var readTimes = new Array();
	while (rs.isValidRow()) {
		var readTime = new ReadTime(rs.fieldByName("readTime"));
		readTime.readTimeId = rs.fieldByName("readTimeId");
		readTime.feedId = rs.fieldByName("feedId");
		readTimes.push(readTime);
		rs.next();		
	}
	rs.close();
	return readTimes;
}

function getItem(db, itemId) {
	var rs = db.execute('select * from item where itemId = ?', [itemId]);
	// ein event gehört immer nut zu einem item!
	var item = new Item(rs.fieldByName("title"), rs.fieldByName("guid"), null);
	item.type = rs.fieldByName("type");
	item.itemId = rs.fieldByName("itemId");
	item.feedId = rs.fieldByName("feedId");
	rs.close();
	return item;
}


function getLastEvent(db) {
	var rs = db.execute('select * from event order by dateTime desc limit 1');
	var event = new Event(rs.fieldByName("actionType"), rs.fieldByName("dateTime"));
	event.eventId = rs.fieldByName("eventId");
	event.contextValue = rs.fieldByName("contextValue");
	event.contextValueType = rs.fieldByName("contextValueType");
	event.description = rs.fieldByName("description");
	event.duration = rs.fieldByName("duration");
	event.followedLink = rs.fieldByName("followedLink");
	event.ipAddress = rs.fieldByName("ipAddress");
	event.other = rs.fieldByName("other");
	event.sessionId = rs.fieldByName("sessionId");
	event.tags = rs.fieldByName("tags");
	event.userDiscipline = rs.fieldByName("userDiscipline");
	event.userEmail = rs.fieldByName("userName");
	event.voteLink = rs.fieldByName("voteLink");
	event.xfn = rs.fieldByName("xfn");
	event.itemId = rs.fieldByName("itemId");
	rs.close();
	return event;
}

function getRelatedData(db, eventId) {
	var rs = db.execute('select * from relateddata where eventId = ?', [eventId]);
	var relatedData = new Array();
	while (rs.isValidRow()) {
		var relatedDate = new RelatedData(rs.fieldByName("name"), rs.fieldByName("content"));
		relatedDate.describingSchema = rs.fieldByName("describingSchema");
		relatedDate.relatedDataId = rs.fieldByName("relatedDataId");
		relatedDate.eventId = rs.fieldByName("eventId");
		relatedData.push(relatedDate);
		rs.next();		
	}
	rs.close();
	return relatedData;
}