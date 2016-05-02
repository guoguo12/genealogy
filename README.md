# Genealogy of EECS GSIs

This project aims to compile a "family tree" of Berkeley EECS TAs (GSIs).

## How to Contribute

Are you or were you a Berkeley EECS TA? If so, great! We need your help!
Please send an email to allenguo@berkeley.edu containing the following information:

1. Your full name.
2. Your graduation year (or expected graduation year).
3. A list where each entry is of the form "[full name] was my TA for [class]".

Important: Don't worry if the people you list weren't your official instructor (according to Tele-BEARS or bCourses).
What matters is that they were your **primary TA or mentor figure** for that course, and that they were an official GSI for
that course during the semester you took it.

See the FAQ below for more clarifications.

### Contribution FAQ

* What if I never went to class?
  * The golden rule is that you must have considered them to be your "primary TA or mentor figure" when you took their course. If they didn't make much of an impact on your life, don't include them. If you didn't go to their discussion but they helped you a ton in office hours, include them. Use your best judgement.
* Is it okay if my TA didn't know me personally?
  * Yes. They'll be excited to see that they made a difference even when they weren't aware of it!
* What if I had multiple "primary TAs" for a single class?
  * That's fine, include them all!
* Can I add students of mine?
  * Only if they were/are also TAs *and* you're confident that they considered you to be their "primary TA or mentor figure" when they took your course.
* Are tutors, readers, and lab assistants allowed?
  * Generally, no&mdash;unless they were so involved in the course that they were *de facto* TAs (which is rare).
* Does it matter if they were undergrads or grad students?
  * Either is fine.
* Can I make a pull request to submit my info instead of sending an email?
  * Sure! The file to edit is [data/data.yaml](https://github.com/guoguo12/genealogy/blob/gh-pages/data/data.yaml). You can debug your contributions by cloning your fork onto your computer and starting a server (e.g. Python's [SimpleHTTPServer](https://docs.python.org/2/library/simplehttpserver.html)) in the root project directory (`genealogy/`). Then view the page in your web browser. Make sure there are no JavaScript errors!

## General FAQ

These are questions about the project as a whole.

* Where do I send suggestions, comments, and bug reports?
  * Please [make an issue](https://github.com/guoguo12/genealogy/issues/new). Thanks!
* Is this project officially affiliated with&mdash;
  * No.
* Isn't this really more of a graph instead of a tree?
  * Yes.

## Project To-Do

* Find some way to use the "graduation year" data field. Maybe color nodes by age/generation?
* Collect more data.
* After more data: Only render a subgraph starting from a specified TA. ("Give me all children and grand-children of [name].")
* Long term: Find an official EECS organization (like HKN, UPE, etc.) to host this website.

## Privacy Policy and Credits

This project uses Google Analytics to better understand user behavior. Learn more or opt out [here](https://support.google.com/analytics/answer/6004245).

This project uses [Sigma](https://github.com/jacomyal/sigma.js) for graph drawing and [Bliss](https://github.com/LeaVerou/bliss) for cleaner JavaScript.
