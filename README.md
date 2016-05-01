# Genealogy of EECS GSIs

This project aims to compile a "family tree" of Berkeley EECS TAs (GSIs).

## How to Contribute

Are you or were you a Berkeley EECS TA? If so, great! We need your help!
Please send an email to allenguo@berkeley.edu containing the following information:

1. Your full name.
2. Your graduation year (or expected graduation year).
3. A list where each entry is of the form "[full name] was my TA for [class]".

Important: Don't worry if the people you list weren't your official instructor (according to Tele-BEARS or bCourses).
What matters is that you consider them to be your **primary TA or mentor figure** in that class, and that they were an official GSI for
that course during the semester you took it.

See the FAQ below for more clarifications.

### Contribution FAQ

* Can I make a pull request to submit my info instead of sending an email?
  * Sure! The file to edit is [data/data.yaml](https://github.com/guoguo12/genealogy/blob/gh-pages/data/data.yaml).
* Is it okay if my TA didn't know me personally?
  * Yes.
* Are tutors, readers, and lab assistants allowed?
  * Generally, no&mdash;unless they were so involved in the course that they were *de facto* TAs (which is rare).
* Does it matter if they were undergrads or grad students?
  * No, either is fine.
* Is this project officially affiliated with&mdash;
  * No.
* Isn't this really more of a graph instead of a tree?
  * Yes.

## Project To-Do

* Make it more clear what the edge colors mean.
* Find some way to use the "graduation year" data field. Maybe color nodes by age/generation?
* Add a brief explanation to accompany the graph.
* Collect more data.
* After more data: Only render a subgraph starting from a specified TA. ("Give me all children and grand-children of [name].")
* Long term: Find an official EECS organization (like HKN, UPE, etc.) to host this website.

## Credits

This project uses [Sigma](https://github.com/jacomyal/sigma.js) for graph drawing and [Bliss](https://github.com/LeaVerou/bliss) for cleaner JavaScript.
