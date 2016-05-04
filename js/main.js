// All colors are from https://www.google.com/design/spec/style/color.html#color-color-palette
var classToColor = {
  'CS 61A':  '#4DD0E1',
  'CS 61AS': '#7986CB',
  'CS 61B':  '#F06292',
  'CS 61BL': '#E57373',
  'CS 61C':  '#BA68C8',
  'CS 70':   '#81C784'
};
var defaultClassColor = '#616161';

var activeSearchHit = '';

var main = function(entries) {
  var startTime = new Date();

  s = new sigma({
    renderer: {
      container: document.getElementById('graph'),
      type: 'canvas'
    },
    settings: {
      font: 'monospace',
      minEdgeSize: 0,
      maxEdgeSize: 0,
      defaultLabelSize: 14,
      labelThreshold: 5

    }
  });
  var graph = s.graph;

  // Add nodes
  entries.forEach(function(entry) {
    graph.addNode({
      id: entry.name,
      label: entry.name,
      x: entry.name.charCodeAt(0),  // Positions are refined below
      y: entry.name.charCodeAt(1),
      size: 5 + Math.pow(entry.students ? entry.students.length : 0, 0.8)
      // TODO: Assign node colors in some meaningful way
    });
  });

  // Add edges
  var inMap = {};
  var outMap = {};
  var edgesToColors = {};
  entries.forEach(function(teacher) {
    if (teacher.students) {
      teacher.students.forEach(function(student) {
        var edgeId = teacher.name + ':' + student.name + ':' + student.class;
        var edgeColor = classToColor.hasOwnProperty(student.class) ? classToColor[student.class] : defaultClassColor;
        graph.addEdge({
          id: edgeId,
          source: teacher.name,
          target: student.name,
          type: 'line',
          size: 1,
          color: edgeColor
        });
        edgesToColors[edgeId] = edgeColor;

        // Save in/out info for detailed "info" view (on node hover)
        if (!inMap[student.name]) {
          inMap[student.name] = [];
        }
        if (!outMap[teacher.name]) {
          outMap[teacher.name] = [];
        }
        inMap[student.name].push(teacher.name + ' (' + student.class + (student.semester ? ', ' + student.semester : '') + ')');
        outMap[teacher.name].push(student.name + ' (' + student.class + (student.semester ? ', ' + student.semester : '') + ')');

        // Approximate tree-forming: if student is above teacher, swap their y-coordinates
        // TODO: Make this better
        var teacherNode = graph.nodes(teacher.name);
        var studentNode = graph.nodes(student.name);
        if (studentNode.y < teacherNode.y) {
          var tmp = studentNode.y;
          studentNode.y = teacherNode.y;
          teacherNode.y = tmp;
        }
      });
    }
  });

  // Bind node hover handler
  s.bind('overNode', function(e) {
    if (activeSearchHit) {
      return;
    }

    var node = e.data.node;
    showPersonInfo(node.id, inMap, outMap);

    var edges = s.graph.edges();
    edges.forEach(function(edge) {
      var idParts = edge.id.split(':');
      var teacher = idParts[0];
      var student = idParts[1];
      if (teacher != node.id && student != node.id) {
        edge.color = 'transparent';
      } else {
        edge.size = 3;
        edge.type = 'arrow';
      }
    });
    s.refresh();
  });

  // Bind node un-hover handler
  s.bind('outNode', function(e) {
    if (activeSearchHit) {
      return;
    }
    $('#info').style.display = 'none';
    var edges = s.graph.edges();
    edges.forEach(function(edge) {
      edge.color = edgesToColors[edge.id];
      edge.size = 1;
      edge.type = 'line';
    });
    s.refresh();
  });

  // Bind search handler
  $('#search').onkeydown = function(e) {
    if (e.keyCode == 13) {
      highlightSearchHit($('#search').value);
      $('body').onmousedown = function(e) {
        console.log(e);
        if (!(e.target.children.length > 0 && e.target.children[0].tagName.toLowerCase() === 'mark')) { // If not clicking on autocomplete result
          cancelSearchHit();
          delete $('body').onmousedown;
        }
      }
    }
  };
  // $('body').onkeydown = function(e) {
    // if (e.keyCode == 27) {
      // cancelSearchHit();
    // }
  // };

  // Set up autocomplete for search
  var names = entries.map(function(e) { return e.name; });
  names.sort();
  new Awesomplete($('#search'), {
    list: names,
    minChars: 1
  });
  $('body').addEventListener('awesomplete-selectcomplete', function(e) {
    $('#search').onkeydown({ keyCode: 13 });  // trigger search handler
  });

  // Zoom out a tiny bit then render
  var c = s.cameras[0];
  c.ratio *= 1.2;
  defaultCameraSettings = {
    x: c.x,
    y: c.y,
    ratio: c.ratio,
    angle: c.angle
  };
  s.refresh();

  // Make sure no nodes overlap
  s.configNoverlap({
    gridSize: 50,
    nodeMargin: 20
  });
  s.startNoverlap();

  var elapsedTime = ((new Date()) - startTime) / 1000;
  console.log('main() finished in ' + elapsedTime + 's')
};

var showColorLegend = function() {
  var newHTML = '';
  $.each(classToColor, function(className, color) {
    newHTML += '<span style="color: ' + color + '"><br>' + className + '</span>';
  });
  newHTML += '<span style="color: ' + defaultClassColor + '"><br>Other</span>';
  $('#legend').innerHTML = newHTML;
};

var highlightSearchHit = function(name) {
  cancelSearchHit();
  node = s.graph.nodes(name);
  if (node) {
    s.dispatchEvent('overNode', { node: node });
    s.cameras[0].goTo(defaultCameraSettings);
    activeSearchHit = node.id;
    node.color = 'gold';
    s.refresh();
  }
};

var cancelSearchHit = function() {
  if (activeSearchHit) {
    activeSearchHit = '';
    s.dispatchEvent('outNode', { node: node });
    s.graph.nodes().forEach(function(node) {
      node.color = 'black';
    });
    s.refresh();
  }
};

var showPersonInfo = function(name, inMap, outMap) {
  var newHTML = '';
  newHTML += '<b>' + name + '</b>';
  if (inMap[name] && inMap[name].length) {
    newHTML += '<p>Teachers:<ul>';
    inMap[name].forEach(function(teacher) {
      newHTML += '<li>' + teacher + '</li>';
    });
    newHTML += '</ul>';
  }
  if (outMap[name] && outMap[name].length) {
    newHTML += '<p>Students:<ul>';
    outMap[name].forEach(function(student) {
      newHTML += '<li>' + student + '</li>';
    });
    newHTML += '</ul>';
  }
  $('#info').innerHTML = newHTML;
  $('#info').style.display = 'block';
};

$.ready().then(function() {
  if (/Mobi/.test(navigator.userAgent)) {
    if (!confirm('Notice: This website is not optimized for mobile view, and may cause your browser to crash or become unresponsive.')) {
      window.history.back();
      return;
    }
  }
  $.fetch('data/data.yaml').then(function(data) {
    main(jsyaml.load(data.responseText));
  });
  showColorLegend();
  $('#about')._.transition({ opacity: 0.9 });
});