Glitch
======

A cross-browser JavaScript error handling micro-framework.



Motivation
----------

So you're writing a Web 2.0 / Ajax / HTML5 webapp; I'm sure it's gonna be awesome!



Introduction
------------

Based on ideas from http://blogs.cozi.com/tech/2008/04/javascript-error-tracking-why-windowonerror-is-not-enough.html



Getting started
---------------




API
---

Glitch adds one object to the global namespace, `Glitch`, with a number of methods:

*   `Glitch.wrap( function )`

*   `Glitch.bind( function(error) )`

*   `Glitch.unbind( function(error) )`

*   `Glitch.trigger( error )`

*   `Glitch.setTimeout( function, delay )`  
    `Glitch.setInterval( function, delay )`

*   `Glitch.noConflict( [removeAll] )`

`Glitch` is also a function:

*   `Glitch( function, [parameters] )`



Plugins for other libraries
---------------------------

jQuery plugin requires jQuery 1.3 or above


Todo
----

cross browser stack trace?

