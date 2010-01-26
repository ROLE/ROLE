/**
 * Test
 * This JavaScript file is for Canvas view.
 */

function init() {

	//alert('Are you sure you want to give us the deed to your house?')
	embedFlash('speak');
}

// TODO: Write the code for Canvas view.
//Play .swf file for specified trick.
function embedFlash(trick) {

  // The URL for the .swf file that shows the specified trick.
  var url = "http://localhost:8888/gadgets/ROLE/kul/MonitorWidget/flash/MonitorWidget.swf";

  // Play .swf file.
    gadgets.flash.embedFlash(url, "flashcontainer", {
    swf_version: 10,
    id: "flashid",
    width: "100%",
    height: "100%"
  });
    
  gadgets.window.adjustHeight(800);
  gadgets.window.adjustWidth(700);
}