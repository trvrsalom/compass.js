if(typeof compass == "undefined") compass = {};
(function(){
	var routes = [];
	var lastURL = null;
	this.current = {};
	this.onLoad = function() {};
	this.beforeLoad = function() {}
	this.resourceLoadCallback = function(data) {
		compass.beforeLoad();
		document.getElementsByTagName("compassBody")[0].innerHTML = data;
		compass.onLoad();
	}
	var get = function(url, callback) {
	    var xmlHttp = new XMLHttpRequest();
	    xmlHttp.onreadystatechange = function() { 
	        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
	            callback(xmlHttp.responseText);
	    }
	    xmlHttp.open("GET", url, true);
	    xmlHttp.send(null);
	};
	var route = function(match, resource) {
		compass.current.params = match;
		compass.current.url = compass.getHash();
		if(typeof resource == "string") {
			if(window.location.protocol.indexOf("http") < 0) console.error("Unable to retrieve resource " + resource + " on a local file system. Try running your code on a webserver.");
			var url = window.location.origin + "/" + resource;
			get(url, compass.resourceLoadCallback);
		}
		else if(typeof resource == "function") {
			resource(match);
		}
	};
	this.render = function(resource) {
		var url = window.location.origin + "/" + resource;
		get(url, compass.resourceLoadCallback);
	}
	this.map = function(routemap) {
		var keys = Object.keys(routemap);
		var newRoute = [];
		for(key in keys) {
			key = keys[key];
			var variableNames = [];
			nkey = key.replace(/([:*])(\w+)/g, function (full, dots, name) {
			  variableNames.push(name);
			  return '([^\/]+)';
			}) + '(?:\/|$)'.replace(/\*/g, '(?:.*)');
			newRoute.push({"route": nkey, "resource": routemap[key], "paramaters": variableNames})
		}
		routes = newRoute;
	};
	this.getHash = function() {
		var hash = window.location.href.split('#')[1] || '';
		return hash == "" ? "/" : hash;
	};
	this.getRoutes = function() {
		return routes; 
	};
	var _404 = null;
	var checkSlug = function() {
		var currURL = compass.getHash();
		if(currURL == lastURL) return;
		else {
			var found = false;
			for(var i = 0; i < compass.getRoutes().length; i++) {
				var _route = routes[i];
				var match = currURL.match(new RegExp(_route.route));
				if(_404 == null && _route.route == "404(?:/|$)") {
					_404 = _route.resource;
					continue;
				}
				if(match != null) {
					var params = match.slice(1, match.length).reduce((params, value, index) => {
						if (params === null) params = {};
						params[_route.paramaters[index]] = value;
						return params;
					}, null);
					found = true;
					route(params, _route.resource);
				}
			}
			console.error("URL route not defined");
			if(_404 != null && !found) route(params, _404);
		}
	};
	window.onhashchange = checkSlug;
	this.update = function() {
		checkSlug();
	}
	
}).call(compass);
compass.update();

