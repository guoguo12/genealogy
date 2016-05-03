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

var main = function(entries) {
  var startTime = new Date();

  s = new sigma({
    renderer: {
      container: document.getElementById('graph'),
      type: 'canvas'
    },
    settings: {
      font: 'monospace',
      minEdgeSize: 3,
      maxEdgeSize: 3,
      defaultLabelSize: 14,
      labelThreshold: 6

    }
  });
  var graph = s.graph;

  // Add nodes
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    graph.addNode({
      id: entry.name,
      label: entry.name,
      x: Math.random(),  // Positions are refined below
      y: Math.random(),
      size: 5 + (entry.students ? entry.students.length : 0)
      // TODO: Assign node colors in some meaningful way
    });
  }

  // Add edges
  var inMap = {};
  var outMap = {};
  var edgesToColors = {};
  for (var i = 0; i < entries.length; i++) {
    var teacher = entries[i];
    if (teacher.students) {
      for (var j = 0; j < teacher.students.length; j++) {
        var student = teacher.students[j];
        var edgeId = teacher.name + ':' + student.name + ':' + student.class;
        var edgeColor = classToColor.hasOwnProperty(student.class) ? classToColor[student.class] : defaultClassColor;
        graph.addEdge({
          id: edgeId,
          source: teacher.name,
          target: student.name,
          type: 'arrow',
          size: 50,
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
      }
    }
  }

  s.bind('overNode', function(e) {
    var node = e.data.node;
    showPersonInfo(node.id, inMap, outMap);

    var edges = s.graph.edges();
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var idParts = edge.id.split(':');
      var teacher = idParts[0];
      var student = idParts[1];
      if (teacher != node.id && student != node.id) {
        edge.color = 'transparent';
      }
    }
    s.refresh();
  });

  s.bind('outNode', function(e) {
    $('#info').style.display = 'none';
    var edges = s.graph.edges();
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      edge.color = edgesToColors[edge.id];
    }
    s.refresh();
  });

  // Zoom out a tiny bit then render
  s.cameras[0].ratio *= 1.4;
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

var showPersonInfo = function(name, inMap, outMap) {
  var newHTML = '';
  newHTML += '<b>' + name + '</b>';
  if (inMap[name] && inMap[name].length) {
    newHTML += '<p>Teachers:<ul>';
    for (var i = 0; i < inMap[name].length; i++) {
      newHTML += '<li>' + inMap[name][i] + '</li>';
    }
    newHTML += '</ul>';
  }
  if (outMap[name] && outMap[name].length) {
    newHTML += '<p>Students:<ul>';
    for (var i = 0; i < outMap[name].length; i++) {
      newHTML += '<li>' + outMap[name][i] + '</li>';
    }
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