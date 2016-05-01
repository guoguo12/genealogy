var classToColor = {
  'CS 61A':  '#4DD0E1',
  'CS 61AS': '#7986CB',
  'CS 61B':  '#E57373',
  'CS 61C':  '#4DB6AC',
  'CS 70':   '#BA68C8'
}

var main = function(entries) {
  var s = new sigma({
    renderer: {
      container: document.getElementById('graph'),
      type: 'canvas'
    },
    settings: {
      font: 'monospace',
      minEdgeSize: 4,
      maxEdgeSize: 4,
      defaultLabelSize: 14,
      labelThreshold: 6

    }
  });
  var graph = s.graph;

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

  for (var i = 0; i < entries.length; i++) {
    var teacher = entries[i];
    if (teacher.students) {
      for (var j = 0; j < teacher.students.length; j++) {
        var student = teacher.students[j];
        graph.addEdge({
          id: teacher.name + ':' + student.name,
          source: teacher.name,
          target: student.name,
          type: 'arrow',
          size: 50,
          color: classToColor.hasOwnProperty(student.class) ? classToColor[student.class] : '#D0D0D0'
        });

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

  s.cameras[0].ratio *= 1.4; // Zoom out a tiny bit
  s.refresh();

  s.configNoverlap({
    gridSize: 75
  });
  s.startNoverlap();
}

$.ready().then(function() {
  $.fetch('data/data.yaml').then(function(data) {
    main(jsyaml.load(data.responseText));
  })
});