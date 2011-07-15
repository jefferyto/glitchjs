Glitch
======

A cross-browser JavaScript error handling micro-framework.



Introduction
------------

_Errors happen_, to borrow a phrase: bug in an obscure browser; unexpected downtime for a third-party data feed; or just plain old programming mistake. The question is, how can we discover and handle these runtime errors before the complaints start arriving, by which time our users / customers may already be gone?

The most obvious solution is to set [`window.onerror`][1] to an error handling and/or reporting function, although there are two issues with this approach:

1.  Safari and Opera do not support `window.onerror`. (WebKit [added][2] support in January 2011 and so future versions of Safari should also have support.)

2.  The `window.onerror` handler does not have access to the `Error` object or value that was thrown. Some browsers (Firefox, Chrome, Opera 9+) include a stack trace on the `Error` object and so the handler isn't able to access this information.

Based on ideas from http://blogs.cozi.com/tech/2008/04/javascript-error-tracking-why-windowonerror-is-not-enough.html

[1]: https://developer.mozilla.org/en/DOM/window.onerror
     "window.onerror - MDN Docs"
[2]: https://bugs.webkit.org/show_bug.cgi?id=8519
     "Bug 8519 &ndash; WebCore doesn't fire window.onerror event when uncaught JavaScript exceptions are thrown"



Getting started
---------------




API
---

Glitch adds one object to the global namespace, `Glitch`, with a number of methods:

*   `Glitch.wrap( function )`

*   `Glitch.bind( function(error) )`

    Attach a handler to the error event. If an error occurs, the given function is called with the thrown `Error` object or value.

    If the handler returns `false`, the error will not be reported to the browser ("prevent default"). (To prevent all errors from reaching the browser, use `Glitch.mute()`.)

    Returns the `Glitch` object.

*   `Glitch.unbind( [function(error)] )`

    Remove a previously-attached handler. If called with no arguments, all handlers are removed.

    Returns the `Glitch` object.

*   `Glitch.trigger( error )`

*   `Glitch.setTimeout( function, delay )`

    Convenience method that wraps the given function (with `Glitch.wrap()`) before calling `window.setTimeout()`.

    Returns the timeout id from `window.setTimeout()`.

*   `Glitch.setInterval( function, delay )`

    Convenience method that wraps the given function (see `Glitch.wrap()`) before calling `window.setInterval()`.

    Returns the timeout id from `window.setInterval()`.

*   `Glitch.mute()`

    Prevent all errors from being reported to the browser. Best used in production code so that the browser does not prompt the end user with error messages.

    Returns the `Glitch` object.

*   `Glitch.unmute()`

    Allow errors to be reported to the browser. (This is the default.) Error handlers can still prevent errors from reaching the browser by returning `false`.

    Returns the `Glitch` object.

*   `Glitch.noConflict( [removeAll] )`

`Glitch` is also a function:

*   `Glitch( function, [parameters] )`

    Wrap (see `Glitch.wrap()`) and call the given function. Arguments for the function can be passed in the `parameters` array.

    This is primarily a convenience function to wrap immediate / self-executing functions, for example:

        (function( $ ) {
            $.fn.awesomePlugin = function() { ... };
        })( jQuery );

    can be substituted with

        Glitch(function( $ ) {
            $.fn.awesomePlugin = function() { ... };
        }, [ jQuery ] );

    Returns the value (if any) returned by the given function.


Plugins for other libraries
---------------------------

jQuery plugin requires jQuery 1.3 or above



Todo
----

*   cross browser stack trace?

*   integrate with Google Analytics event tracking?

*   resolve traditional (return true) vs html5 (return false)


License
-------

Copyright 2011, Jeffery To  
Dual licensed under the MIT or GPL Version 2 licenses.

