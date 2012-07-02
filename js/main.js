

// Initialize the node storage variables.


// Append a svg tag to #right with the correct width and height.

var svg = d3.select("#right").append("svg:svg").attr("width", w).attr("height", h);




var force = d3.layout.force().gravity(.09)
    						 .distance(30)
    						 .charge(-50)
			                 .size([w, h])
			                 .start();

var nodes = force.nodes();

// jQuery Tipsy tooltips.
$('g.node').tipsy({ 
	gravity: 'w', 
	html: true, 
	title: function() {
	return d.host + ((!d.sstatus) ?( " : " + d.error) : ""); 
	}
});

force.on("tick", function() {
  svg.selectAll("g.node")
      .attr("transform", function(d) {
        if (d.available == 0) {
          d.x -= 0.3;
        }
        if (d.available == 1) {
          d.x += 0.3;
        }
        if (d.available == 2) { 
          d.y -= 0.3;
        }
        return "translate(" + d.x + "," + d.y + ")"; 
      });
  var q = d3.geom.quadtree(nodes),
      i = 0,
      n = nodes.length;

  while (++i < n) {
    q.visit(collide(nodes[i]));
  } 
  // svg.selectAll("line.link")
  //     .attr("x1", function(d) { return d.source.x; })
  //     .attr("y1", function(d) { return d.source.y; })
  //     .attr("x2", function(d) { return d.target.x; })
  //     .attr("y2", function(d) { return d.target.y; });
});

function collide(node) {
	var r = node.radius + 16,
	  nx1 = node.x - r,
	  nx2 = node.x + r,
	  ny1 = node.y - r,
	  ny2 = node.y + r;
	return function (quad, x1, y1, x2, y2) {
	if (quad.point && (quad.point !== node)) {
	  var x = node.x - quad.point.x,
		  y = node.y - quad.point.y,
		  l = Math.sqrt(x * x + y * y),
		  r = node.radius + quad.point.radius;
	  if (l < r) {
		l = (l - r) / l * 0.5;
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

$(document).ready(function () {
  server = new $.jqzabbix(options);
  server.getApiVersion(null, function(response){
    $('#version').html('API Version: ' + response.result);
    authenticate();
  });

	// Start the loop to keep doing this!
});

function authenticate() {

  server.userLogin(null, function(){
        updateLoop();
    }, errorMethod );
}

var updateLoop = function() {

    updateData(); // First call

    // Start the loop to keep doing this!
    setInterval(function() {
      updateData();
    }, 30000);
};

function draw () {
	//$('#left').html(header + content + footer);
	console.log(nodes);
	var node = svg.selectAll("g.node").data(nodes, function (d) { return d.hostid;});

	var nodeEnter = node.enter().append("svg:g")
		.attr("class", "node");
	nodeEnter.append("svg:circle")
		.attr("r", function(d) { return d.radius; })
		.style("fill", function(d, i) { return d.color; });

	nodeEnter.append("svg:text")
		.attr("class", "nodetext")
		.attr("dx", function(d) { return d.radius + 4})
		.attr("dy", ".35em")
		.text(function(d) { return d.error });
	nodeEnter.call(force.drag);
	node.exit().remove();

	force.start();
}
var updateData = function () {
	var params = {
 		"search" : {"host" : "alp-spb1-*.prod-edb"},
 		"groupids" : "30",
 		"output" : "extend",
 		"sortfield" : "host",
 		"searchWildcardsEnabled" : 1
 	};
	//d3.json("servers.json", function (resp) {
  server.sendAjaxRequest("host.get", params, function (resp) {
    var header = "<ul>";
		var footer = "</ul>";
		var content = "";
		
		var servers = resp.result;
		
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
        s.radius = 40;
			}
			s.sstatus = status;
			content += "<li>" + s.host + " = " + ((status) ? "Oppe" : "Nede") + "</li>";
			if (containsObject(s, nodes)) {
        var index = getKey(s, nodes);
        var old = nodes[index];
        var newserver = $.extend({}, old, s);
        //var newserver = d3.merge(old, s);
				nodes[index] = newserver;
			}
			else {
				nodes.push(s);
			}
		}
	}, errorMethod, draw);
}
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].hostid === obj.hostid) {
            return true;
        }
    }

    return false;
}
function getKey(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].hostid === obj.hostid) {
            return i;
        }
    }

    return -1;
}
var errorMethod = function() {

    var errormsg = '';

    $.each(server.isError(), function(key, value) {
        errormsg += value;
    });

    $('#left').html(errormsg);
}

