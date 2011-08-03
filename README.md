Glitch
======

A cross-browser JavaScript error handling micro-framework.



Introduction
------------

### Error handling?

It seems like almost anything can happen in the user's browser, for example:

*   Bug in an obscure browser
*   [JavaScript blocked by a corporate firewall][intro_1]
*   Third-party data feed goes down unexpectedly
*   Coding mistake that got through testing

To catch these runtime errors, most would suggest setting [`window.onerror`][intro_2] to an error handling and/or reporting function, though there are issues with this approach:

*   While browser support for `window.onerror` is good ([Firefox][intro_2], [Internet Explorer][intro_3], [Chrome 10+][intro_4], [Safari 5.1+][intro_5], [iOS 5+][intro_6]), it is not perfect. Most notably, `window.onerror` isn't supported in Opera and older WebKit-based browsers.

*   A `window.onerror` handler does not have access to the `Error` object. Some browsers (Firefox, Chrome, Opera 9+) include a stack trace on the `Error` object and so the handler isn't able to access this information.

### Hello Glitch

Rather than relying on `window.onerror`, Glitch wraps functions in a `try` / `catch` block to catch errors. Error listeners can be registered with Glitch, which are called when an error occurs and passed the `Error` object or value that was thrown.

Which functions to wrap

jQuery plugin

Glitch also assigns a listener to `window.onerror` so that uncaught errors are also handled, although this is effective only in browsers that support `window.onerror`.

Based on ideas from the [Cozi Tech Blog][intro_7]

[intro_1]: http://www.webstandards.org/2006/04/03/script-blockers-breaking-apps/
    "Blogger &#8211; Can I get in please? - The Web Standards Project"
[intro_2]: https://developer.mozilla.org/en/DOM/window.onerror
    "window.onerror - MDN Docs"
[intro_3]: http://msdn.microsoft.com/en-us/library/cc197053.aspx
    "onerror Event (A, ABBR, ACRONYM, ...)"
[intro_4]: http://code.google.com/p/chromium/issues/detail?id=7771
    "Issue 7771 - chromium - Event window.onerror doesn't work - An open-source browser project to help move the web forward. - Google Project Hosting"
[intro_5]: http://support.apple.com/kb/DL1070
    "Safari 5.1"
[intro_6]: http://twitter.com/badass_js/status/84445644676272128
    "Twitter / @badass_js: Safari on iOS 5 has Webkit ..."
[intro_7]: http://blogs.cozi.com/tech/2008/04/javascript-error-tracking-why-windowonerror-is-not-enough.html
    "Cozi Tech Blog - JavaScript Error Tracking: Why window.onerror Is Not Enough | Cozi"



Getting started
---------------

### Using Glitch directly

1.  Include Glitch in your HTML:

        <script src="glitch.min.js"></script>

2.  Wrap your functions so that Glitch can catch any errors:

    *   Event handlers (including Ajax handlers): Use `Glitch.wrap()` to wrap your handlers:

            window.onload = Glitch.wrap( function() {
                document.body.onclick = Glitch.wrap( function() {
                    alert( "Why did you click my body?" );
                } );
            } );

    *   Functions called asynchronously with `window.setTimeout()` or `window.setInterval()`: Use `Glitch.wrap()` to wrap your functions, or use `Glitch.setTimeout()` and `Glitch.setInterval()` to save some typing:

            Glitch.setTimeout( function() {
                alert( "I hope you haven't been waiting for too long" );
            }, 5000 );

    *   "Top-level / main" functions

3.  Add an error handler with `Glitch.bind()` to do something (send an error report to your server, show a message to the user, etc.) if an error occurs:

        Glitch.bind( function( error ) {
        	alert( "Oops, that wasn't support to happen :-(" );
        } );

### Using Glitch with jQuery





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

    Convenience method that wraps the given function (with `Glitch.wrap()`) and calls `window.setTimeout()`.

    Returns the timeout ID from `window.setTimeout()`.

*   `Glitch.setInterval( function, delay )`

    Convenience method that wraps the given function (see `Glitch.wrap()`) and calls `window.setInterval()`.

    Returns the timeout ID from `window.setInterval()`.

*   `Glitch.mute()`

    Prevent all errors from being reported to the browser. Best used in production code so that the browser does not prompt the end user with error messages.

    Returns the `Glitch` object.

*   `Glitch.unmute()`

    Allow errors to be reported to the browser. (This is the default.) Error handlers can still prevent errors from reaching the browser by returning `false`.

    Returns the `Glitch` object.

*   `Glitch.noConflict( [removeAll] )`

    Restore `window.Glitch` to its original value, before we took it over. If called with `true`, `window.onerror` is also restored; this stops Glitch from handling uncaught errors in browsers that support `window.onerror`.

    Returns the `Glitch` object.

`Glitch` is also a function:

*   `Glitch( function, [parameters] )`

    Wrap (see `Glitch.wrap()`) and call the given function. Arguments for the function can be passed in the `parameters` array.

    This is primarily a convenience function to wrap immediate / self-executing functions. For example, we can wrap this immediate function:

        (function( $ ) {
            $.fn.awesomePlugin = function() { ... };
        })( jQuery );

	with `Glitch.wrap()`:

        Glitch.wrap(function( $ ) {
            $.fn.awesomePlugin = function() { ... };
        })( jQuery );

    or we can use `Glitch()` directly:

        Glitch(function( $ ) {
            $.fn.awesomePlugin = function() { ... };
        }, [ jQuery ] );

    Returns the value (if any) returned by the given function.



Plugins for other libraries
---------------------------

jQuery plugin requires jQuery 1.3 or above



Ideas for features
------------------

*   Cross browser stack trace
*   Integrate with Google Analytics event tracking
*   Resolve traditional (return true) vs html5 (return false)



License
-------

Copyright 2011, Jeffery To  
Dual licensed under the MIT or GPL Version 2 licenses.

