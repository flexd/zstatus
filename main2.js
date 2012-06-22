

// Initialize the node storage variables.
var nodes = [];

$(document).ready(function() {
  // Handler for .ready() called.
  // Create the server object for zabbix, and check the version as required before logging in.
	server = new $.jqzabbix(options);
	server.getApiVersion(null, function(response){
		$('#version').html('API Version: ' + response.result);
		doAuth();
	});

	// Append a svg tag to #right with the correct width and height.
	d3.select("#right").append("svg:svg")
		.attr("width", w)
		.attr("height", h);

});


function doAuth() {

	server.userLogin(null, function(){
        loginSuccess();
    },
    errorMethod );
}

var loginSuccess = function() {
		
		updateData(); // First call

		// Start the loop to keep doing this!
		setInterval(function() {
			updateData();
		}, 3000);
};
function draw() {

	draw = Function(""); // This function can only be called once.
	
	// Draw circles!
	var svg = d3.select("#right svg");
	
	var force = d3.layout.force()
		.gravity(0.05)
		.charge(-120)//function(d, i) { return i ? 0 : -2000; })
		.nodes(nodes)
		.size([w, h]);

	if (nodes == null) return;
 	var root = nodes[0];
	root.radius = 0;
	root.fixed = true;

	force.start();

	

	var node = svg.selectAll("circle")
		.data(nodes)
		.enter().append("svg:circle")
		.attr("r", function(d) { return d.radius; })
		.style("fill", function(d, i) { return d.color; });

	// jQuery Tipsy tooltips.

	$('svg circle').tipsy({ 
		gravity: 'w', 
		html: true, 
		title: function() {
		var d = this.__data__;
		return d.host + ((!d.sstatus) ?( " : " + d.error) : ""); 
		}
	});

	force.on("tick", function(e) {
		var q = d3.geom.quadtree(nodes),
		  i = 0,
		  n = nodes.length;

		while (++i < n) {
		q.visit(collide(nodes[i]));
		}

		svg.selectAll("circle")
		  .attr("cx", function(d) { return d.x; })
		  .attr("cy", function(d) { return d.y; })
		  .style("fill", function(d, i) { return d.color; });
		});

	// svg.on("mousemove", function() {
	// var p1 = d3.svg.mouse(this);
	// root.px = p1[0];
	// root.py = p1[1];
	// force.resume();
	// });

	function collide(node) {
		var r = node.radius + 16,
		  nx1 = node.x - r,
		  nx2 = node.x + r,
		  ny1 = node.y - r,
		  ny2 = node.y + r;
		return function(quad, x1, y1, x2, y2) {
		if (quad.point && (quad.point !== node)) {
		  var x = node.x - quad.point.x,
			  y = node.y - quad.point.y,
			  l = Math.sqrt(x * x + y * y),
			  r = node.radius + quad.point.radius;
		  if (l < r) {
			l = (l - r) / l * .5;
			node.x -= x *= l;
			node.y -= y *= l;
			quad.point.x += x;
			quad.point.y += y;
		  }
		}
		return x1 > nx2
			|| x2 < nx1
			|| y1 > ny2
			|| y2 < ny1;
		};
	}
}

var updateData = function() {
	var params = {
		"output" : "extend",
		"sortfield" : "host"
	};
	server.sendAjaxRequest("host.get", params, function (resp) {
		var header = "<ul>";
		var footer = "</ul>";
		var content = "";
		console.log(resp);
		var servers = resp.result;
		nodes = [];
		for (var i in servers) {
			var s = servers[i];
			s.radius = 15;
			var status = true;
			if (s.available == 0) {
				s.color = d3.rgb("gray");
			}
			if (s.available == 1) {
				s.color = d3.rgb("green");
			}
			if (s.available == 2) {
				s.color = d3.rgb("red");
				status = false;
			}
			s.sstatus = status;
			content += "<li>" + s.host + " = " + ((status) ? "Oppe" : "Nede") + "</li>"; //+ ((s.available == 2) ? (" : " + s.error) : "") + 
			nodes.push(s);
		}
		$('#left').html(header + content + footer);
		draw();
	}, errorMethod);
}
// var updateData = function() {
// 	var params = {
// 		"search" : {"host" : "alp-spb1-*.prod-edb"},
// 		"groupids" : "30",
// 		"output" : "extend",
// 		"sortfield" : "host",
// 		"searchWildcardsEnabled" : 1
// 	};
// 	server.sendAjaxRequest("host.get", params, function (resp) {
// 		var header = "<ul>";
// 		var footer = "</ul>";
// 		var content = "";
// 		console.log(resp);
// 		var servers = resp.result;
// 		nodes = [];
// 		for (var i in servers) {
// 			var s = servers[i];
// 			s.radius = 15;
// 			var status = true;
// 			if (s.available == 0) {
// 				s.color = d3.rgb("gray");
// 			}
// 			if (s.available == 1) {
// 				s.color = d3.rgb("green");
// 			}
// 			if (s.available == 2) {
// 				s.color = d3.rgb("red");
// 				status = false;
// 			}
// 			s.sstatus = status;
// 			content += "<li>" + s.host + " = " + ((status) ? "Oppe" : "Nede") + "</li>"; //+ ((s.available == 2) ? (" : " + s.error) : "") + 
// 			nodes.push(s);
// 		}
// 		$('#left').html(header + content + footer);
// 		draw();
// 	}, errorMethod);
// }



var errorMethod = function() {

    var errormsg = '';

    $.each(server.isError(), function(key, value) {
        errormsg += '<li>' + key + ' : ' + value + '</li>';
    });

    $('#result').html('<ul>' + errormsg + '</ul>');
}

