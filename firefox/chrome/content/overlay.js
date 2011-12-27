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
	  
	/* The domain names Facebook phones home with, lowercased. */
	DOMAINS : ['twimg.com', 'twitter.com'],
			
	/* The XPCOM interfaces. */
	INTERFACES : Components.interfaces,
	
	/*
	  Determines whether any of a bucket of domains is part of a URL, regex free.
	*/
	isMatching: function(url, domains) {
	  const DOMAIN_COUNT = domains.length;
	  for (var i = 0; i < DOMAIN_COUNT; i++)
		  if (url.toLowerCase().indexOf(domains[i], 2) >= 2) return true;
			  // A valid URL has at least two characters ("//"), then the domain.
	},
	
	/* Initialization */	  
    init : function() {  

		/* Traps and selectively cancels a request. */
        Twdc.obsService =  Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);  
		Twdc.obsService.addObserver({observe: function(subject) {
			Twdc.NOTIFICATION_CALLBACKS =
				subject.QueryInterface(Twdc.INTERFACES.nsIHttpChannel).notificationCallbacks
					|| subject.loadGroup.notificationCallbacks;
			Twdc.BROWSER =
				Twdc.NOTIFICATION_CALLBACKS &&
					gBrowser.getBrowserForDocument(
					  Twdc.NOTIFICATION_CALLBACKS
						.getInterface(Twdc.INTERFACES.nsIDOMWindow).top.document
					);
			subject.referrer.ref;
				// HACK: The URL read otherwise outraces the window unload.
			Twdc.BROWSER && !Twdc.isMatching(Twdc.BROWSER.currentURI.spec, Twdc.DOMAINS) &&
				Twdc.isMatching(subject.URI.spec, Twdc.DOMAINS) &&
					subject.cancel(Components.results.NS_ERROR_ABORT);
		  }}, 'http-on-modify-request', false);
	}
  }
}

/* Initialization of Fbdc object on load */
window.addEventListener("load", function() { Twdc.init(); }, false);  
