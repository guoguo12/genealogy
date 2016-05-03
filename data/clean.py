#!/usr/bin/env python

"""
Reads the data file (YAML) and combines entries with the same name.
Also reformats concisely and orders alphabetically by name.

Requires PyYAML (`pip install pyyaml`).

Usage:
    python clean.py [dataFile]
"""

import operator
import sys
import yaml

if len(sys.argv) != 2:
    print 'Usage: python clean.py [dataFile]'
    sys.exit(1)

new_y = []
with open(sys.argv[1], 'r') as f:
    y = yaml.load(f)

    names = set([entry['name'] for entry in y])
    for name in names:
        new_entry = {'name': name, 'students': []}
        matching = [entry for entry in y if entry['name'] == name]
        for entry in matching:
            if 'year' in entry:
                if 'year' in new_entry:
                    assert new_entry['year'] == entry['year']
                else:
                    new_entry['year'] = entry['year']
            if 'students' in entry:
                new_entry['students'] += entry['students']
        new_y.append(new_entry)

new_y = sorted(new_y, key=operator.itemgetter('name'))
new_yaml = yaml.dump(new_y)
print new_yaml

yes = set(['yes','y', 'ye', ''])
no = set(['no','n'])

choice = raw_input('Does this look right? ').lower()
if choice in yes:
    pass
elif choice in no:
   sys.exit(1)
else:
   sys.stdout.write("Please respond with 'yes' or 'no'")

with open(sys.argv[1], 'w') as f:
    f.write(new_yaml)