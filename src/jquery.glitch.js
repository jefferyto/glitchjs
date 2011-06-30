/*
 * Glitch Plugin for jQuery v@VERSION
 * https://github.com/jefferyto/glitchjs
 *
 * Copyright 2011, Jeffery To
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: @DATE
 */

(function(
	jQuery,
	isWindow,
	_ready,
	_live,
	_ajax,
	_ajaxSetup,
	_animate,
	_queue,
	__Deferred,
	Glitch,
	window,
	undefined
) {

// onerror listener
var listener = function( error ) {
		var event = jQuery.Event( "error" );

		event.error = error;
		event.stopPropagation();
		jQuery.event.trigger( event, undefined, window );

		return !event.isDefaultPrevented();
	},

	// wrap event handlers to catch errors
	wrapHandler = function( fn ) {
		var wrapped = Glitch.wrap( fn );

		if ( wrapped && wrapped.originalFunction === fn ) {
			wrapped.guid = fn.guid = fn.guid || wrapped.guid || ( typeof jQuery.guid === "number" && jQuery.guid++ ) || jQuery.event.guid++;
		}

		return wrapped;
	},

	// wrap options objects
	wrapOptions = function( options, props ) {
		options = jQuery.extend( {}, options );

		jQuery.each( props, function( i, name ) {
			var val = options[ name ];

			if ( jQuery.isFunction( val ) ) {
				options[ name ] = wrapHandler( val );

			} else if ( jQuery.isArray( val ) ) {
				options[ name ] = val = val.slice(0);

				jQuery.each( val, function( i, fn ) { val[ i ] = wrapHandler( fn ); } );
			}
		} );

		return options;
	},

	// ajax options to wrap
	// XXX should we handle other properties?
	ajaxProps = [ "beforeSend", "success", "error", "complete" ],

	// animate options to wrap
	animateProps = [ "complete", "step" ];



// for jQuery 1.3 from jQuery 1.5
if ( !isWindow ) {
	// A crude way of determining if an object is a window
	isWindow = function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	};
}



// error event handling

jQuery.event.special.error = {
	setup: function() {
		if ( isWindow( this ) ) {
			Glitch.bind( listener );
		}
	},
	teardown: function() {
		if ( isWindow( this ) ) {
			Glitch.unbind( listener );
		}
	}
};



// event handlers

jQuery.each( [ "bind", "one" ], function( i, name ) {
	var _fn = jQuery.fn[ name ];

	jQuery.fn[ name ] = function( type, data, fn ) {
		// Handle object literals
		// the original function should call us to handle each individual event
		if ( typeof type === "object" ) {
			return _fn.call( this, type, data, fn );
		}

		if ( jQuery.isFunction( data ) || data === false ) {
			fn = data;
			data = undefined;
		}

		return _fn.call( this, type, data, !isWindow( this ) || type !== "error" ? wrapHandler( fn ) : fn ); // avoid infinite loops
	};
} );

jQuery.fn.ready = function( fn ) { return _ready.call( this, wrapHandler( fn ) ); };

if ( _live ) {
	jQuery.fn.live = _live.length === 2 ?
		// accomodate jQuery 1.3 live() that doesn't expect data
		function( type, fn ) {
			return _live.call( this, type, wrapHandler( fn ) );
		} :
		function( types, data, fn, origSelector ) {
			// Handle object literals
			// the original function should call us to handle each individual event
			if ( typeof types === "object" && !types.preventDefault ) {
				return _live.call( this, types, data, fn, origSelector );
			}

			if ( jQuery.isFunction( data ) ) {
				fn = data;
				data = undefined;
			}

			return _live.call( this, types, data, wrapHandler( fn ), origSelector );
		};
}



// ajax

jQuery.ajax = function( url, options ) {
	return typeof url === "object" ?
		_ajax.call( this, wrapOptions( url, ajaxProps ) ) :
		_ajax.call( this, url, wrapOptions( options, ajaxProps ) );
};

if ( _ajaxSetup ) {
	jQuery.ajaxSetup = function( target, settings ) {
		return !settings ?
			_ajaxSetup.call( this, wrapOptions( target, ajaxProps ) ) :
			_ajaxSetup.call( this, target, wrapOptions( settings, ajaxProps ) );
	};
}



// animate

jQuery.fn.animate = function( prop, speed, easing, callback ) {
	var args = jQuery.makeArray( arguments ), i;

	if ( speed && typeof speed === "object" ) {
		args[ 1 ] = wrapOptions( speed, animateProps );

	} else {
		for ( i = 3; i >= 1; i-- ) {
			if ( jQuery.isFunction( args[ i ] ) ) {
				args[ i ] = wrapHandler( args[ i ] );
				break;
			}
		}
	}

	return _animate.apply( this, args );
};



// queue

jQuery.queue = function( elem, type, data ) {
	var wrapped = data;

	if ( jQuery.isArray( data ) ) {
		wrapped = [];
		jQuery.each( data, function( i, callback ) {
			wrapped[i] = wrapHandler( callback );
		} );

	} else if ( jQuery.isFunction( data ) ) {
		wrapped = wrapHandler( data );
	}

	return _queue.call( this, elem, type, wrapped );
};



// deferred

if ( __Deferred ) {
	jQuery._Deferred = function() {
		var deferred = __Deferred.apply( this, arguments ),
			_done = deferred.done;

		deferred.done = function() {
			var args = jQuery.makeArray( arguments ),
				length = args.length,
				i;

			for ( i = 0; i < length; i++ ) {
				args[ i ] = wrapHandler( args[ i ] );
			}

			return _done.apply( this, args );
		};

		return deferred;
	};
}

})(
	jQuery,
	jQuery.isWindow,
	jQuery.fn.ready,
	jQuery.fn.live,
	jQuery.ajax,
	jQuery.ajaxSetup,
	jQuery.fn.animate,
	jQuery.queue,
	jQuery._Deferred,
	Glitch,
	window
);

