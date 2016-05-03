#!/usr/bin/env python

"""
Parses files where each line is of the form
    [full name] was my TA for [class] during [semester]
Prints YAML results to stdout.

Usage:
    python parse.py [inputFile] [student]
"""

import re
import sys


ADD_SPACE_AFTER_DEPT = True


if len(sys.argv) != 3:
    print 'Usage: python parse.py [inputFile] [student]'
    sys.exit(1)

student = sys.argv[2]
with open(sys.argv[1]) as f:
    lines = [line.strip() for line in f.readlines()]
    for line in lines:
        if not line:
            continue
        m = re.match('(.*) was my TA for (.*) during (.*)', line, re.IGNORECASE)
        if m:
            name, course, semester = [m.group(i).strip() for i in xrange(1, 4)]
            semester = semester.replace('Spring ', 'sp')
            semester = semester.replace('Summer ', 'su')
            semester = semester.replace('Fall ', 'fa')
            semester = semester.replace('20', '')
            if ADD_SPACE_AFTER_DEPT:
                course = course.replace('CS', 'CS ')
                course = course.replace('EE', 'EE ')
            print '- name: %s\n  students:\n    - name: %s\n      class: %s\n      semester: %s' \
                % (name, student, course, semester)
