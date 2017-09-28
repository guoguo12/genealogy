// All colors are from https://www.google.com/design/spec/style/color.html#color-color-palette
var classToColorMap = {
  'CS 61A':  '#4DD0E1',
  'CS 61B':  '#F06292',
  'CS 61C':  '#BA68C8',
  'CS 70':   '#81C784',
  'CS 170':  '#E57373',
  'CS 188':  '#7986CB'
};
var defaultClassColor = '#616161';

var classToColor = function(course) {
  return classToColorMap.hasOwnProperty(course) ? classToColorMap[course] : defaultClassColor;
}

var activeFilter = '';
var activeSearchHit = '';

var main = function(entries) {
  var startTime = new Date();
  var layout = $('#layout').value;

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
  yearMap = {};
  entries.forEach(function(entry) {
    graph.addNode({
      id: entry.name,
      label: entry.name,
      x: entry.name.charCodeAt(0),  // Positions are refined below
      y: entry.name.charCodeAt(1),
      size: 5 + Math.pow(entry.students ? entry.students.length : 0, 0.8)
      // TODO: Assign node colors in some meaningful way
    });
    if (Object.keys(entry).indexOf('year') !== -1) {
      yearMap[entry.name] = "'" + ('' + entry.year).substring(2);
    }
  });

  // Add edges
  var inMap = {};
  var outMap = {};
  var edgesToColors = {};
  var seenCourses = {};
  entries.forEach(function(teacher) {
    if (teacher.students) {
      teacher.students.forEach(function(student) {
        var edgeId = teacher.name + ':' + student.name + ':' + student.class;
        var edgeColor = classToColor(student.class);
        graph.addEdge({
          id: edgeId,
          source: teacher.name,
          target: student.name,
          type: 'arrow',
          size: 1,
          color: edgeColor
        });
        edgesToColors[edgeId] = edgeColor;

        if (Object.keys(seenCourses).indexOf(student.class) === -1) {
          seenCourses[student.class] = true;
        }

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
        if (layout !== 'forceDirected') {
          var teacherNode = graph.nodes(teacher.name);
          var studentNode = graph.nodes(student.name);
          if (studentNode.y < teacherNode.y) {
            var tmp = studentNode.y;
            studentNode.y = teacherNode.y;
            teacherNode.y = tmp;
          }
        }
      });
    }
  });

  // Fill in filtering dropdown
  var seenCoursesList = Object.keys(seenCourses);
  seenCoursesList.sort();
  seenCoursesList.forEach(function(course) {
    $('#filter').innerHTML += '<option value="' + course + '">' + course + '</option>';
  });

  // Bind node hover handler
  s.bind('overNode', function(e) {
    if (activeSearchHit) {
      return;
    }

    var node = e.data.node;
    showPersonInfo(node, inMap, outMap);

    var edges = s.graph.edges();
    edges.forEach(function(edge) {
      var idParts = edge.id.split(':');
      var teacher = idParts[0];
      var student = idParts[1];
      if (teacher != node.id && student != node.id) {
        edge.color = 'transparent';
      } else {
        edge.size = 3;
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
    if (activeFilter) { // Hack to reapply filter
      var activeFilterCopy = activeFilter;
      activeFilter = '';
      filterByCourse(activeFilterCopy);
    } else {
      var edges = s.graph.edges();
      edges.forEach(function(edge) {
        edge.color = edgesToColors[edge.id];
        edge.size = 1;
      });
      s.refresh();
    }
  });

  // Bind search handler
  $('#search').onkeydown = function(e) {
    if (e.keyCode == 13) {
      if (highlightSearchHit($('#search').value)) {
        $('#layout-wrapper').style.display = 'none';
        $('#filter-wrapper').style.display = 'none';
        $('#search-wrapper').style.display = 'none';
        $('#search-cancel').style.display = 'inline';
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
    minChars: 1,
    autoFirst: true
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

  if (!layout || layout === 'forceDirected') {
    s.startForceAtlas2({
      gravity: 0.5,
      linLogMode: true
    });
    window.setTimeout(function() { s.killForceAtlas2(); }, 5000);
  } else {
    // Make sure no nodes overlap
    s.configNoverlap({
      gridSize: 50,
      nodeMargin: 20
    });
    s.startNoverlap();
  }

  var elapsedTime = ((new Date()) - startTime) / 1000;
  console.log('main() finished in ' + elapsedTime + 's')
};

var showColorLegend = function() {
  var newHTML = '';
  $.each(classToColorMap, function(className, color) {
    newHTML += '<span style="color: ' + color + '" onclick="filterByCourse(\'' + className + '\')"><br>' + className + '</span>';
  });
  newHTML += '<span style="color: ' + defaultClassColor + '" onclick="filterByCourse(\'\')"><br>Other</span>';
  $('#legend').innerHTML = newHTML;
};

var highlightSearchHit = function(name) {
  cancelSearchHit();
  node = s.graph.nodes(name);
  if (node) {
    $('#search').value = '';
    s.dispatchEvent('overNode', { node: node });
    s.cameras[0].goTo(defaultCameraSettings);
    activeSearchHit = node.id;
    node.color = '#FFA726';
    s.refresh();
    return true;
  }
  return false;
};

var cancelSearchHit = function() {
  if (activeSearchHit) {
    activeSearchHit = '';
    $('#layout-wrapper').style.display = 'inline';
    $('#filter-wrapper').style.display = 'inline';
    $('#search-wrapper').style.display = 'inline';
    $('#search-cancel').style.display = 'none';
    $('#search').focus();
    s.dispatchEvent('outNode', { node: node });
    s.graph.nodes().forEach(function(node) {
      node.color = 'black';
    });
    s.refresh();
  }
};

var showPersonInfo = function(node, inMap, outMap) {
  var name = node.id;
  var newHTML = '';
  newHTML += '<b>' + name + (Object.keys(yearMap).indexOf(name) !== -1 ? ' (' + yearMap[name]  + ')' : '') + '</b>';
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

var filterByCourse = function(course) {
  if ($('#filter').value !== course) {
    $('#filter').value = course;
  }
  if (course) {
    activeFilter = course;
    s.graph.edges().forEach(function(edge) {
      var idParts = edge.id.split(':');
      if (idParts[2] !== course) {
        edge.color = 'transparent';
        edge.size = 1;
      } else {
        edge.color = classToColor(idParts[2]);
        edge.size = 1;
      }
    });
    s.refresh();
    $('#layout-wrapper').style.display = 'none';
    $('#search-wrapper').style.display = 'none';
  } else {
    activeFilter = '';
    s.graph.edges().forEach(function(edge) {
      var idParts = edge.id.split(':');
      edge.color = classToColor(idParts[2]);
      edge.size = 1;
    });
    s.refresh();
    $('#layout-wrapper').style.display = 'inline';
    $('#search-wrapper').style.display = 'inline';
  }
}

var goToLayout = function(layoutName) {
  window.location.href = window.location.href.split('?')[0] + '?layout=' + layoutName;
}

var computeLongest = function() {
  entries.forEach(function(e) { longestPath(e, []); });
  var sortedKeys = Object.keys(memo).sort(function(a, b){ return memo[a] - memo[b] });
  sortedKeys.forEach(function(k) { console.log(k, memo[k], longest[k]); });
};

memo = {}
longest = {}
var longestPath = function(e, seen) {
  if (Object.keys(memo).indexOf(e.name) !== -1) {
    return memo[e.name];
  }
  if (!e.students || e.students.length === 0) {
    memo[e.name] = 1;
    longest[e.name] = [e.name];
  } else {
    var children = e.students.map(function(s) { return s.name; });
    var childrenEntries = entries.filter(function(e) {
      return children.indexOf(e.name) !== -1 && seen.indexOf(e.name) === -1;
    });
    var childrenLengths = childrenEntries.map(function(e) { return longestPath(e, [e.name].concat(seen)); });
    var maxLength = -1;
    var bestIndex = -1;
    for (var i = 0; i < childrenEntries.length; i++) {
      if (childrenLengths[i] > maxLength) {
        maxLength = childrenLengths[i];
        bestIndex = i;
      }
    }
    memo[e.name] = maxLength + 1;
    longest[e.name] = [e.name].concat(longest[childrenEntries[bestIndex].name]);
  }
  return memo[e.name];
};

var topClasses = function() {
  var courses = s.graph.edges().map(function(e) { return e.id.split(':')[2]; });
  var counter = {};
  courses.forEach(function(c) {
    if (Object.keys(counter).indexOf(c) !== -1) {
      counter[c]++;
    } else {
      counter[c] = 1;
    }
  });
  var sortedKeys = Object.keys(counter).sort(function(a, b){ return counter[a] - counter[b] });
  sortedKeys.forEach(function(k) { console.log(k, counter[k]); });
};

// Modified from http://gomakethings.com/how-to-get-the-value-of-a-querystring-with-native-javascript/
var getQueryString = function(field) {
    var href = window.location.href;
    if (href[href.length - 1] === '/') {
      href = href.substring(0, href.length - 1);
    }
    var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    var string = reg.exec(href);
    return string ? string[1] : null;
};

var parseOptions = function() {
  $('#layout').value = getQueryString('layout') || 'forceDirected';
  $('#layout-wrapper').style.display = 'inline';
}

$.ready().then(function() {
  if (/Mobi/.test(navigator.userAgent)) {
    if (!confirm('Notice: This website is not optimized for mobile view, and may cause your browser to crash or become unresponsive.')) {
      window.history.back();
      return;
    }
  }
  var time = new Date().getTime()G
  $.fetch('data/data.yaml?t=' + time).then(function(data) {
    entries = jsyaml.load(data.responseText);
    parseOptions();
    main(entries);
  });
  showColorLegend();
  $('#about')._.transition({ opacity: 0.9 });
});
