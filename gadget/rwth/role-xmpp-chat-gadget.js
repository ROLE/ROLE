dojo.require("dojox.encoding.digests.MD5");
dojo.require('dijit.layout.LayoutContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.Menu");
dojo.require("dijit.Dialog");
dojo.require("dijit.Toolbar");
dojo.require("dijit.TitlePane");

dojo.require("dojox.xmpp.xmppSession");
dojo.require("dojox.xmpp.widget.ChatSession");
		
dojo.require("dojo.date");
dojo.require("dojo.date.locale");
dojo.require("dojo.parser");


//We want to know which chat instance is selected, so we can associate
			//the <input> area with it
			var selectedTab = "";
			var chatTabs = {};
			var chatTabContainer = null;
			var chatInstances = {};
			
			/*Local copy of the user's roster*/
			var roster = {}; 
			var groups = {};
			var rosterPresence = {};
			var selectedJID = null;

			function init() {
						dijit.byId("loginDialog").show();
					var buddyList = dojo.byId("buddyList");
						dojo.connect(buddyList, "ondblclick",function(evt){
									var target = findTargetContact(evt);
									if(target) {
										openChat(target.jid);
									}
						});
						
						
						dojo.connect(buddyList, "oncontextmenu",function(evt){
								selectedJID = null;
								var target = findTargetContact(evt);
								if(target) {
											selectedJID = target.jid;
											dojo.stopEvent(evt);
										var pop = dijit.popup.open({
											popup: dijit.byId("buddyMenu"),
											around: target.target,
											onExecute: function(){
													dijit.popup.close( dijit.byId("buddyMenu"));
											},
											onCancel: function(){
													dijit.popup.close( dijit.byId("buddyMenu"));
											}
										});
									
								}
						});
						
					
						
			};
			
		   	function findTargetContact(evt) {
				var buddyList = dojo.byId("buddyList");
					var jid = null;
					var target = evt.target;
					while(!jid && target != buddyList) {
						jid = target.getAttribute("imContactId");
						if(!jid) {
							target = target.parentNode;
						}
					}
					return jid ? {jid:jid, target:target} : null;
			}

			function login() {
					prefs = new gadgets.Prefs();		
					username = prefs.getString('username');
                                        resource = prefs.getString('resource');
                                        domain = prefs.getString('domain');
					
					jid = username + "@" + domain;
					jidElement = document.getElementById("jid-display");
					jidElement.innerHTML = jid;
					bindUrl = "http://" + domain + ":7070/http-bind/";
					password = dijit.byId("loginPassword").attr("value");
				
					var useScriptSrcTransport = false;
					if(bindUrl.indexOf("http") == 0) {
						useScriptSrcTransport = true;
					}
					var options =  {
							serviceUrl:bindUrl,// "http://other.host.local/http-bind/",
							hold: 1,
							secure: true,
							useScriptSrcTransport: useScriptSrcTransport,
							wait: 60,
							lang: 'en',
							retryCount: 2,
							domain: domain
						};

					session = new dojox.xmpp.xmppSession(options);
					//TESTUSER
					
					//currently svc.openSession doesn't accept any params
					//so the iwc.userPrefs stuff above setup the user id, dont' forget it!		
					session.open(username, password, resource);

					buddyList = dojo.byId("buddyList");
					chatTabContainer = dijit.byId("chatTabs");
					//sendInput = dojo.byId("sendInput");

					//When the session becomes active, get the buddy list and populate it
					dojo.connect(session, "onActive", function(){
						session.presenceService.publish({});
					});
					
					dojo.connect(this.session, 'onRosterAdded',  buddyAdded);
					
					dojo.connect(this.session, 'onRosterChanged',  function(rosterItem, previousCopy) { 
						var presence = rosterPresence[rosterItem.id];
						buddyRemoved(previousCopy);
						buddyAdded(rosterItem);
						if(presence) {
							updateBuddyPresence(presence);
						}	
					});
					dojo.connect(this.session, 'onRosterRemoved',  buddyRemoved);
				

					dojo.connect(session, "onRosterUpdated", function() {
							for(var i=0;i<session.roster.length;i++){
								var buddy = session.roster[i];
								roster[buddy.jid] = buddy;
								if(buddy.groups.length == 0 ) {
									addBuddyToGroup(buddy, "buddies");
								} else {
									for(var j= 0; j < buddy.groups.length; j++) {
										addBuddyToGroup(buddy, buddy.groups[j]);
									}
								}	
							}
							for(groupName in groups) {
								createGroup(groupName);
							}
					});
					
					

					//subscribe to presence notifications
					dojo.connect(session, 'onPresenceUpdate', updateBuddyPresence);


					//subscribe to onSubscriptionRequest.  For this test, we'll just
					//automatically accept any susbscription request
					dojo.connect(session, "onSubscriptionRequest", function(from){
						session.presenceService.approveSubscription(from);
					});



					dojo.connect(session, "onRegisterChatInstance", function(instance, message){

						//in the case of we are creating a new chat instance, defer the tab creation
						//until the invite has occurred and the contact's uid has been added
						if (instance.uid){
							if(!chatInstances[instance.uid] || chatInstances[instance.uid].chatid != instance.chatid){
								newMessage(instance, instance.uid, message);
							}
							chatInstances[instance.uid] = instance;		
						}

						dojo.connect(instance, "onInvite", dojo.hitch(this,function(contact){
							chatInstances[contact] = instance;
							newMessage(instance, contact, null);
						}));	


						//do something when we get a new message from this chat instance
						dojo.connect(instance, "onNewMessage", dojo.hitch(this, function(msg){
							newMessage(instance, instance.uid, msg);		
						}));		

						//I'm not going to wire this up for this example, but this
						//is the event that would signal whether a person is writing,
						//idle, etc (ie, the little pencil in adium)
						dojo.connect(instance, "setState", function(state){
							console.log("IM: ",  instance.uid, " is now ", state);
						});
					});

			}
			
			function createGroup(groupName) {
				var div = document.createElement("div");
				buddyList.appendChild(div);
				var groupItems = groups[groupName].items;
				 var buffer = new dojox.string.Builder();
				for(var i=0;i<groupItems.length;i++){
					var buddy = groupItems[i];
					renderBuddy(buffer, buddy);
				}
				div.innerHTML = buffer.toString();
				var titlePane = new dijit.TitlePane({title: groupName}, div);
				
				 groups[groupName].container = titlePane;
				return titlePane;
			}
			
			function updateBuddyPresence(p){
				rosterPresence[p.from] = p;
				dojo.query('div[imContactId="'+p.from+'"]', buddyList).forEach(function(contact) { 
					contact.firstChild.className = "dijitInline presence "  + p.show;
				 });
			
			}
			
			function buddyRemoved(buddy){
				delete roster[buddy.id];
				delete rosterPresence[buddy.id];
				dojo.query('div[imContactId="'+buddy.id+'"]', buddyList).forEach(function(contact) { 
						contact.parentNode.removeChild(contact);
				 });
			}
			
			function buddyAdded(buddy) {
					roster[buddy.id] =buddy
					if(buddy) {
						var div  = null;
						if(buddy.groups.length == 0 ) {
							addBuddyToGroup(buddy, "buddies");
							var container = groups["buddies"].container;
							if(container) {
								div = container.containerNode;
								var buffer = new dojox.string.Builder();
								buffer.append(div.innerHTML);
								renderBuddy(buffer, buddy);
								div.innerHTML = buffer;
							} else {
								div =  createGroup("buddies").containerNode;
							}
						
						} else {
							for(var j= 0; j < buddy.groups.length; j++) {
								var groupName = buddy.groups[j];
								addBuddyToGroup(buddy, groupName);
								var container = groups[groupName].container;
								if(container) {
									div = container.containerNode;
									var buffer = new dojox.string.Builder();
									buffer.append(div.innerHTML);
									renderBuddy(buffer, buddy);
									div.innerHTML = buffer;
								} else {
									div =  createGroup(groupName).containerNode;
								}
								
							}
						}
					}
					
			}
			
			
			function renderBuddy(buffer, buddy) {
				buffer.append('<div imContactId="');
				buffer.append(buddy.jid);
				buffer.append('"><div class="dijitInline presence"></div><div class="dijitInline ">');
				buffer.append(buddy.name?buddy.name:buddy.jid);
				buffer.append('</div></div>');
			}
			
			function addBuddyToGroup(buddy, groupName) {
				var group = groups[groupName];
				if(!group) {
					group = {name:groupName, items: []};
					groups[groupName] =group;
				}
				group.items.push(buddy);
			}

			function newMessage(instance, jid, message) {
				var tab = chatTabs[jid];
				if(!tab) {
					var div = document.createElement("div");
					var buddy = roster[jid];
					var chatWith = jid;
					if(buddy && buddy.name) {
						chatWith = buddy.name;
					}
				 	tab = new dojox.xmpp.widget.ChatSession({title: jid, chatWith: chatWith, instance: instance, closable: true}, div);
					dojo.connect(tab, "onClose", function() {
						delete chatTabs[jid];
					});
					chatTabContainer.addChild(tab);
					chatTabContainer.selectChild(tab);	
					chatTabContainer.layout();
					chatTabs[jid] = tab;
				}
				tab.displayMessage(message);
				
			}

			function openChat(jid){
				var tab = chatTabs[jid];
				if(tab) {
				  chatTabContainer.selectChild(tab);	
				}

				var chatInstance = new dojox.xmpp.ChatService();
				session.registerChatInstance(chatInstance);
				chatInstance.invite(jid);
				
			}


			function updatePresence(p){
				//since the filtering select wants to call its onChange
				//at startup and the svc isn't started up yet, we just ignore it 
				//for this test case
				if (session && session.presenceService) {
					session.presenceService.publish({show:p});
				}
			}
			
			
			function addUser() {
			    var userJID = dijit.byId("userJID").attr("value");
				var userAlias = dijit.byId("userAlias").attr("value");
				var userGroups = dijit.byId("userGroups").attr("value");
				
				var groups = userGroups.split(",");
				session.rosterService.addRosterItem(userJID, userAlias, groups);
			}
			
			function showAddBuddy() {
				dijit.byId("userJID").setValue("");
				dijit.byId("userJID").setDisabled(false);
				
				dijit.byId("userAlias").setValue("");
				dijit.byId("userGroups").setValue("");
				dijit.byId('addUser').show();
			}
			
			function showEditBuddy() {
				var buddy = roster[selectedJID];
				if(buddy) { 
					dijit.byId("userJID").setValue(selectedJID);
					dijit.byId("userJID").setDisabled(true);

					dijit.byId("userAlias").setValue(buddy.name? buddy.name : "");
					dijit.byId("userGroups").setValue(buddy.groups? buddy.groups.join(",") : "");
					dijit.byId('addUser').show();
				}
			}
			
			function subscribeBuddy(){
				session.presenceService.subscribe(selectedJID);
			}
			
			
			function deleteBuddy(){
				if(confirm("Sure you want to delete "  + selectedJID + " ?")) {
					session.rosterService.removeRosterItem(selectedJID);
				}
			}

dojo.config.parseOnLoad = true;
dojo.config.dojoBlankHtmlUrl = 'resources/blank.html';
gadgets.util.registerOnLoadHandler(function() {dojo.addOnLoad(init);});
