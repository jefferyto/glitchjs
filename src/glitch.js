/*
 * Glitch JavaScript Library v@VERSION
 * https://github.com/jefferyto/glitchjs
 *
 * Copyright 2011, Jeffery To
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: @DATE
 */

(function( window, _Glitch, _onerror, undefined ) {

// main function / namespace
// wraps and executes the given function
var Glitch = function( fn, args ) { return Glitch.wrap( fn ).apply( this, args || [] ); },

	// functions to be notified when an error occurs
	listeners = [],

	// whether we should keep quiet and not tell the browser about our troubles
	muted = false,

	// a flag to indicate when we re-throw an error so it bubbles up to the browser
	handled = false;

extend( Glitch, {
	wrap: function( fn ) {
		var wrapped = fn;
		if ( isFunction( fn ) && !fn.originalFunction ) {
			wrapped = function() {
				var ret;
				try {
					ret = fn.apply( this, arguments );
				} catch ( error ) {
					if ( Glitch.trigger( error ) !== false && !muted ) {
						handled = true;
						window.setTimeout( function() { handled = false; }, 5000 ); // XXX hack
						throw error;
					}
				}
				return ret;
			};
			wrapped.originalFunction = fn;
		}
		return wrapped;
	},

	bind: function( fn ) {
		listeners.push( fn );
		return this;
	},

	unbind: function( fn ) {
		var i, l;
		if ( fn ) {
			for ( i = 0, l = listeners.length; i < l; i++ ) {
				if ( listeners[i] === fn ) {
					listeners.splice( i, 1 );
					i--;
					l--;
				}
			}
		} else {
			listeners = [];
		}
		return this;
	},

	trigger: function( error ) {
		var message =
				( error && error.message ) ||
				( error !== undefined && !isObject( error ) && !isFunction( error ) && String( error ) ) ||
				"",
			url = ( error && error.fileName ) || "",
			lineNumber = ( error && error.lineNumber ) || 0,
			ret = true;

		each( listeners, function( i, listener ) {
			if ( listener( error ) === false ) {
				ret = false;
			}
		} );

		if ( _onerror && _onerror.call( window, message, url, lineNumber, error ) === true ) {
			ret = false;
		}

		return ret;
	},

	setTimeout: function( fn, delay ) {
		return window.setTimeout( this.wrap( fn ), delay );
	},

	setInterval: function( fn, delay ) {
		return window.setInterval( this.wrap( fn ), delay );
	},

	mute: function() {
		muted = true;
		return this;
	},

	unmute: function() {
		muted = false;
		return this;
	},

	noConflict: function( removeAll ) {
		window.Glitch = _Glitch;
		if ( removeAll ) {
			window.onerror = _onerror;
		}
		return this;
	}
} );

window.Glitch = Glitch;
window.onerror = onerror;



/*
 * window.onerror handler
 * dispatches errors to listeners
 * we (try to) respond only to calls from the browser for uncaught errors, or to calls from Glitch.trigger()
 */

function onerror( message, url, lineNumber, error ) {
	if ( isString( message ) && isString( url ) && isNumber( lineNumber ) && !handled ) {
		if ( arguments.length < 4 ) {
			// XXX create a "real" error object?
			error = {
				message: message || "",
				fileName: url || "",
				lineNumber: lineNumber || 0
			};
		}

		// XXX traditionally, window.onerror returns true to signal it has "handled" the error
		// but the HTML5 spec (and Chrome 10+) says to return false (?!?)
		// we'll keep returning true to prevent IE from reporting errors
		return ( !Glitch.trigger( error ) && !muted ) || undefined;
	}
}



/*
 * helper functions
 */

function isObject( object ) { return typeof object === "object"; }
function isFunction( object ) { return typeof object === "function"; }
function isString( object ) { return typeof object === "string"; }
function isNumber( object ) { return typeof object === "number"; }

function each( object, fn ) {
	var length = object.length, i;
	if (typeof length === "number" && !isFunction( object ) ) {
		for ( i = 0; i < length && fn.call( object[ i ], i, object[ i ] ) !== false; i++ ) {}
	} else {
		for ( i in object ) {
			if ( fn.call( object[ i ], i, object[ i ] ) === false ) {
				break;
			}
		}
	}
}

function extend( target ) {
	var length = arguments.length, source, prop, i;
	for ( i = 1; i < length; i++ ) {
		source = arguments[ i ];
		for ( prop in source ) {
			target[ prop ] = source[ prop ];
		}
	}
	return target;
}

})( window, window.Glitch, window.onerror );

