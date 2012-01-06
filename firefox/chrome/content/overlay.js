/*
  An overlay script that stops Twitter from tracking the webpages you go to.

  Copyright 2010, 2011 Disconnect, Inc.

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see <http://www.gnu.org/licenses/>.

  Authors (one per line):

    Brian Kennish <byoogle@gmail.com>
*/


if (typeof Twdc == "undefined") {  

  var Twdc = {
	  
	/* The inclusion of the jQuery library*/
	jQuery : jQuery.noConflict(),
	  
	/*
	  Determines whether any of a bucket of domains is part of a URL, regex free.
	*/
	isMatching: function(url, domains) {
	  const DOMAIN_COUNT = domains.length;
	  for (var i = 0; i < DOMAIN_COUNT; i++)
		  if (url.toLowerCase().indexOf(domains[i], 2) >= 2) return true;
			  // A valid URL has at least two characters ("//"), then the domain.
	},
	
	/* updates the menu icon with the number of blocks */
	updateCount: function(){

		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						   .getInterface(Components.interfaces.nsIWebNavigation)
						   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
						   .rootTreeItem
						   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						   .getInterface(Components.interfaces.nsIDOMWindow);		
				
		//alert(mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount);
		if(typeof mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount == "undefined"){
			mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount= 0;
		}
		
		if(	mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount > 0 ){
			Twdc.jQuery("#TwdcBlockingIcon").attr("src", "chrome://twdc/content/google-blocked.png" );
		}
		else{
			Twdc.jQuery("#TwdcBlockingIcon").attr("src", "chrome://twdc/content/google-activated.png" );			
		}
		
		if(window.content.localStorage.getItem('TwdcStatus')=="unblock"){
			Twdc.jQuery("#TwdcBlock").attr("value","Block");			
			Twdc.jQuery("#TwdcUnblock").attr("value",mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount+" unblocked");						
		}
		else{
			Twdc.jQuery("#TwdcBlock").attr("value",mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount+" blocked");			
			Twdc.jQuery("#TwdcUnblock").attr("value","Unblock");						
		}		


	},
	
	/* show Xpcom status */
	showXpcom: function(){
		var myComponent = Cc['@disconnect.me/twdc/contentpolicy;1'].getService().wrappedJSObject;;
    	alert(myComponent.showStatus()); 			
	},

	/* Lifts international trade embargo on Facebook */
	unblock: function(){

		if(window.content.localStorage.getItem('TwdcStatus')=="unblock"){		
			return;
		}
		window.content.localStorage.setItem('TwdcStatus', "unblock");	
		window.content.location.reload();

	},
	
	/* Enforce international trade embargo on Facebook */
	block: function(){
		if(window.content.localStorage.getItem('TwdcStatus')!="unblock"){		
			return;
		}		
		window.content.localStorage.setItem('TwdcStatus', "block");	
		window.content.location.reload();		
	},
	
	/* Switches the image displayed by the Url Bar icon */
	iconAnimation : function(){

		Twdc.jQuery("#twdc-image-urlbar").mouseover(function(){												 
			Twdc.jQuery("#twdc-image-urlbar").attr("src", "chrome://twdc/content/icon_urlbar.png");
		});	
		Twdc.jQuery("#twdc-image-urlbar").mouseout(function(){
			if(window.content.localStorage.getItem('TwdcStatus')=="unblock"){
				Twdc.jQuery("#twdc-image-urlbar").attr("src", "chrome://twdc/content/icon_urlbar_inactive.png");								
			}
			else{
				Twdc.jQuery("#twdc-image-urlbar").attr("src", "chrome://twdc/content/icon_urlbar_active.png");
			}
		});			

		if(window.content.localStorage.getItem('TwdcStatus')=="unblock"){
			Twdc.jQuery("#twdc-image-urlbar").attr("src", "chrome://twdc/content/icon_urlbar_inactive.png");								
		}
		else{
			Twdc.jQuery("#twdc-image-urlbar").attr("src", "chrome://twdc/content/icon_urlbar_active.png");
		}
		
		
	},
	
	/* Initialization */	  
    init : function() {  

		/* handles the url bar icon animation */
		Twdc.iconAnimation();	

		if(gBrowser){
			gBrowser.addEventListener("DOMContentLoaded", Twdc.onPageLoad, false);  
			gBrowser.tabContainer.addEventListener("TabAttrModified", Twdc.onTabChanged, false);  		
		}
	},
	
	/* called when another tab is clicked */
	onTabChanged: function(aEvent){
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						   .getInterface(Components.interfaces.nsIWebNavigation)
						   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
						   .rootTreeItem
						   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						   .getInterface(Components.interfaces.nsIDOMWindow);
						   
		//alert(mainWindow.getBrowser().selectedBrowser.contentWindow.document.DcTwdcCount);
		
		if(typeof mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount == "undefined"){
			mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount = 0;			
			Twdc.jQuery("#twdc-image-urlbar").hide();			
		}
		else if(mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount == 0){
			Twdc.jQuery("#twdc-image-urlbar").hide();			
		}
		else{
			Twdc.jQuery("#twdc-image-urlbar").show();						
		}
		if(window.content.localStorage.getItem('TwdcStatus')=="unblock"){
			Twdc.jQuery("#twdc-image-urlbar").attr("src", "chrome://twdc/content/icon_urlbar_inactive.png");								

		}
		else{
			Twdc.jQuery("#twdc-image-urlbar").attr("src", "chrome://twdc/content/icon_urlbar_active.png");
		}		
	},
	
	/* called when page is loaded */	
    onPageLoad: function(aEvent) {  
        //var doc = aEvent.originalTarget; // doc is document that triggered the event  
        //var win = doc.defaultView; // win is the window for the doc  
        // test desired conditions and do something  
        // if (doc.nodeName == "#document") return; // only documents  
        // if (win != win.top) return; //only top window.  
        // if (win.frameElement) return; // skip iframes/frames  
        //alert("Number of Facebook Widgets : " +doc.DcTwdcCount); 
		
		window.setTimeout(function() {				
			var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
							   .getInterface(Components.interfaces.nsIWebNavigation)
							   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
							   .rootTreeItem
							   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
							   .getInterface(Components.interfaces.nsIDOMWindow);
							   
			//alert(mainWindow.getBrowser().selectedBrowser.contentWindow.document.DcTwdcCount);
			
			if(typeof mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount == "undefined"){
				mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount = 0;			
				Twdc.jQuery("#twdc-image-urlbar").hide();			
			}
			else if(mainWindow.getBrowser().selectedBrowser.contentWindow.document.TwdcCount == 0){
				Twdc.jQuery("#twdc-image-urlbar").hide();			
			}
			else{
				Twdc.jQuery("#twdc-image-urlbar").show();						
			}
		}, 500);			
    },
	
	/* Returns all attributes in any javascript/DOM Object in a string */
	getAllAttrInObj: function(obj){
		status = "";	
		status += "<p>";
		Twdc.jQuery.each(obj , function(name, value) {
			status += name + ": " + value+"<br>";
		});	
		status += "</p>";	
		return status;
	},	
	
	
  }
}

/* Initialization of Twdc object on load */
window.addEventListener("load", function() { Twdc.init(); }, false);  
