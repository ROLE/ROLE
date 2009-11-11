/**
 * Cam Widget
 * This JavaScript file is for Canvas view.
 */

function init() {
    // TODO: Write the code for initializing.
}


// TODO: Use correct CAM Schema
function store(storagemode)
{
	var db = google.gears.factory.create('beta.database');
	db.open('database-test');
	db.execute('create table if not exists TestCam' + ' (Event text, Timestamp int)');
	var date = new Date();
	db.execute('insert into TestCam values (?, ?)', [storagemode, date.getTime()]); 
	rs.close();	
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

