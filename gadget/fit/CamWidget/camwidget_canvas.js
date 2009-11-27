/**
 * Cam Widget
 * This JavaScript file is for Canvas view.
 */

function init() {
    // TODO: Write the code for initializing.
}


// TODO: Use correct CAM Schema
// TODO: unterscheide: local remote speichern
function store(storagemode)
{
	if (storagemode == 'local') {
		var db = google.gears.factory.create('beta.database');
		db.open('database-test');
		db.execute('create table if not exists TestCam' + ' (Event text, Timestamp int)');
		var date = new Date();
		db.execute('insert into TestCam values (?, ?)', [storagemode, date.getTime()]); 
		rs.close();	
	}
	else if (storagemode == 'remote') {
		var date = new Date();
		var p1 = storagemode;
		var p2 = new Date().getTime();
		var params = 'p1=' + encodeURIComponent(p1) + '&p2=' + encodeURIComponent(p2); 
		var url = 'http://duccio.informatik.rwth-aachen.de:9080/axis2/services/Main/storeCamToDB';
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
	var rs = db.execute('select * from TestCam order by Timestamp desc limit ' + limit);
	var result = "";
	while (rs.isValidRow()) {
	  var wert = "" +  rs.fieldByName("Event") + " " + rs.fieldByName("Timestamp") + "\n";
	  result = result + wert;
	  rs.next();
	}
	rs.close();
	alert(result);
}

