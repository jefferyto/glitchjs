function version( ver, fn ) {
	if ( $.fn.jquery >= ver ) {
		fn();
	}
}

function versionTest( ver ) {
	var args = $.makeArray( arguments );
	args.shift();
	version( ver, function() { test.apply( this, args ); } );
}

function versionAsyncTest( ver ) {
	var args = $.makeArray( arguments );
	args.shift();
	version( ver, function() { asyncTest.apply( this, args ); } );
}

function setupErrorHandling() {
	var buf = [];
	$( window ).bind( "error.test", function( e ) {
		e.preventDefault();
		buf.push( e.error );
	} );
	return buf;
}

function teardownErrorHandling() {
	$( window ).unbind( "error.test" );
}



module( "error event" );

test( "trigger/error()", 1, function() {
	var buf = setupErrorHandling();

	$j( window ).bind( "error.test", function( e ) {
		e.preventDefault();
		buf.push( e.error + " 2" );
	} );

	$( window )
		.trigger( {
			type: "error",
			error: "trigger"
		} )
		.error();

	$j( window )
		.trigger( {
			type: "error",
			error: "trigger"
		} )
		.error();

	deepEqual( buf, [ "trigger", undefined, "trigger 2", "undefined 2" ], "handled expected errors" );

	$j( window ).unbind( "error.test" );
	teardownErrorHandling();
});

asyncTest( "uncaught error", 1, function() {
	// escape qunit's try/catch
	setTimeout( function() {
		var buf = setupErrorHandling();

		$j( window ).bind( "error.test", function( e ) {
			e.preventDefault();
			buf.push( e.error );
		} );

		setTimeout( function() {
			if ( buf.length ) {
				// when the error reaches window.onerror, the real error object/value is not available
				ok( buf[ 0 ] && buf[ 0 ].message && buf[ 1 ] && buf[ 1 ].message, "handled expected errors" );
			} else {
				// for Chrome < 10, Safari, IE 7 inside setTimeout
				// XXX need to rethink how this test case is done for IE 7
				ok( true, "window.onerror was not called by this browser" );
			}

			$j( window ).unbind( "error.test" );
			teardownErrorHandling();
			start();
		}, 0 );

		throw "native";
	}, 0);
} );



module( "event handlers" );

// bind/one/unbind

test( "bind/one/unbind()", 5, function() {
	var handler = function( e, obj ) {
			equal( e.data, undefined, "bind: event has no data" );
			equal( obj, undefined, "bind: handler has no trigger parameters" );
			throw "bind";
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.bind( "click", handler )
		.one( "click", function( e, obj ) {
			equal( e.data, undefined, "one: event has no data" );
			equal( obj, undefined, "one: handler has no trigger parameters" );
			throw "one";
		} )
		.trigger( "click" )
		.unbind( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "bind", "one" ], "handled expected errors" );

	teardownErrorHandling();
} );

test( "bind/one/unbind(), data", 5, function() {
	var handler = function( e, obj ) {
			equal( e.data.foo, "bar", "bind: event has data" );
			equal( obj, undefined, "bind: handler has no trigger parameters" );
			throw "bind";
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.bind( "click", { foo: "bar" }, handler )
		.one( "click", { bar: "foo" }, function( e, obj ) {
			equal( e.data.bar, "foo", "one: event has data" );
			equal( obj, undefined, "one: handler has no trigger parameters" );
			throw "one";
		} )
		.trigger( "click" )
		.unbind( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "bind", "one" ], "handled expected errors" );

	teardownErrorHandling();
} );

test( "bind/one/unbind(), trigger parameters", 5, function() {
	var handler = function( e, obj ) {
			equal( e.data, undefined, "bind: event has no data" );
			equal( obj.bar, "foo", "bind: handler has trigger parameters" );
			throw "bind";
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.bind( "click", handler )
		.one( "click", function( e, obj ) {
			equal( e.data, undefined, "one: event has no data" );
			equal( obj.bar, "foo", "one: handler has trigger parameters" );
			throw "one";
		} )
		.trigger( "click", [ { bar: "foo" } ] )
		.unbind( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "bind", "one" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4", "bind/one/unbind(Object)", 3, function() {
	var obj = {
			foo: function() { ok( true, "bind: foo handler called" ); },
			click: function() { throw "bind"; }
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.bind( obj )
		.one( {
			foo: function() { ok( true, "one: foo handler called" ); },
			click: function() { throw "one"; }
		} )
		.trigger( "foo" )
		.trigger( "click" )
		.unbind( obj )
		.trigger( "foo" )
		.trigger( "click" );

	deepEqual( buf, [ "bind", "one" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4.3", "bind/one/unbind(false)", 1, function() {
	var handler = function() { throw "bind"; },
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.bind( "click", false )
		.bind( "click", handler )
		.one( "click", function() { throw "one"; } )
		.trigger( "click" )
		.unbind( "click", false )
		.trigger( "click" )
		.unbind( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "bind", "one", "bind" ], "handled expected errors" );

	teardownErrorHandling();
} );

// click

test( "click()", 2, function() {
	var handler = function(e) {
			equal( e.data, undefined, "click: event has no data" );
			throw "click";
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.click( handler )
		.trigger( "click" )
		.unbind( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "click" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4.3", "click(), data", 2, function() {
	var handler = function( e ) {
			equal( e.data.foo, "bar", "click: event has data" );
			throw "click";
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.click( { foo: "bar" }, handler )
		.trigger( "click" )
		.unbind( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "click" ], "handled expected errors" );

	teardownErrorHandling();
} );

// live/die

versionTest( "1.3", "live/die(), root selector", 1, function() {
	var handler = function() { throw "live"; },
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.live( "click", handler )
		.trigger( "click" )
		.die( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "live" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4", "live/die(), context selector", 3, function() {
	var handler = function( e, obj ) {
			equal( e.data, undefined, "live: event has no data" );
			equal( obj, undefined, "live: handler has no trigger parameters" );
			throw "live";
		},
		buf = setupErrorHandling();

	$( "span", $( "#qunit-fixture div" )[ 0 ] )
		.live( "click", handler )
		.trigger( "click" )
		.die( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "live" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4", "live/die(), context selector, data", 3, function() {
	var handler = function( e, obj ) {
			equal( e.data.foo, "bar", "live: event has data" );
			equal( obj, undefined, "live: handler has no trigger parameters" );
			throw "live";
		},
		buf = setupErrorHandling();

	$( "span", $( "#qunit-fixture div" )[ 0 ] )
		.live( "click", { foo: "bar" }, handler )
		.trigger( "click" )
		.die( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "live" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4", "live/die(), context selector, trigger parameters", 3, function() {
	var handler = function( e, obj ) {
			equal( e.data, undefined, "live: event has no data" );
			equal( obj.bar, "foo", "live: handler has trigger parameters" );
			throw "live";
		},
		buf = setupErrorHandling();

	$( "span", $( "#qunit-fixture div" )[ 0 ] )
		.live( "click", handler )
		.trigger( "click", [ { bar: "foo" } ] )
		.die( "click", handler )
		.trigger( "click" );

	deepEqual( buf, [ "live" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4.3", "live/die(Object), context selector", 2, function() {
	var obj = {
			foo: function() { ok( true, "live: foo handler called" ); },
			click: function() { throw "live"; }
		},
		buf = setupErrorHandling();

	$( "span", $( "#qunit-fixture div" )[ 0 ] )
		.live( obj )
		.trigger( "foo" )
		.trigger( "click" )
		.die( obj )
		.trigger( "foo" )
		.trigger( "click" );

	deepEqual( buf, [ "live" ], "handled expected errors" );

	teardownErrorHandling();
} );

// delegate/undelegate

versionTest( "1.4.2", "delegate/undelegate()", 3, function() {
	var handler = function( e, obj ) {
			equal( e.data, undefined, "delegate: event has no data" );
			equal( obj, undefined, "delegate: handler has no trigger parameters" );
			throw "delegate";
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.delegate( "span", "click", handler )
		.find( "span" )
			.trigger( "click" )
		.end()
		.undelegate( "span", "click", handler )
		.find( "span" )
			.trigger( "click" );

	deepEqual( buf, [ "delegate" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4.2", "delegate/undelegate(), data", 3, function() {
	var handler = function( e, obj ) {
			equal( e.data.foo, "bar", "delegate: event has data" );
			equal( obj, undefined, "delegate: handler has no trigger parameters" );
			throw "delegate";
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.delegate( "span", "click", { foo: "bar" }, handler )
		.find( "span" )
			.trigger( "click" )
		.end()
		.undelegate( "span", "click", handler )
		.find( "span" )
			.trigger( "click" );

	deepEqual( buf, [ "delegate" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4.2", "delegate/undelegate(), trigger parameters", 3, function() {
	var handler = function( e, obj ) {
			equal( e.data, undefined, "delegate: event has no data" );
			equal( obj.bar, "foo", "delegate: handler has trigger parameters" );
			throw "delegate";
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.delegate( "span", "click", handler )
		.find( "span" )
			.trigger( "click", [ { bar: "foo" } ] )
		.end()
		.undelegate( "span", "click", handler )
		.find( "span" )
			.trigger( "click" );

	deepEqual( buf, [ "delegate" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.4.3", "delegate/undelegate(Object)", 2, function() {
	var obj = {
			foo: function() { ok( true, "delegate: foo handler called" ); },
			click: function() { throw "delegate"; }
		},
		buf = setupErrorHandling();

	$( "#qunit-fixture div" )
		.delegate( "span", obj )
		.find( "span" )
			.trigger( "foo" )
			.trigger( "click" )
		.end()
		.undelegate( "span", obj )
		.find( "span" )
			.trigger( "foo" )
			.trigger( "click" );

	deepEqual( buf, [ "delegate" ], "handled expected errors" );

	teardownErrorHandling();
} );

// ready

(function() {
	var buf = setupErrorHandling();

	$( function() { throw "$(fn)"; } );
	$( document ).ready( function() { throw "$(document).ready(fn)"; } );

	$( teardownErrorHandling );

	test( "ready", 1, function() {
		deepEqual( buf, [ "$(fn)", "$(document).ready(fn)" ], "handled expected errors" );
	} );
})();



module( "ajax callbacks" );

asyncTest( "ajax(Object), success", 1, function() {
	var buf = setupErrorHandling();

	$( document ).one( "ajaxStop", function() {
		deepEqual( buf, [ "beforeSend", "success", "complete" ], "handled expected errors" );
		teardownErrorHandling();
		start();
	} );

	$.ajax( {
		url: "../jquery.js",
		type: "GET",
		dataType: "text",
		beforeSend: function() { throw "beforeSend"; },
		success: function() { throw "success"; },
		complete: function() { throw "complete"; }
	} );
} );

asyncTest( "ajax(Object), error", 1, function() {
	var buf = setupErrorHandling();

	$( document ).one( "ajaxStop", function() {
		deepEqual( buf, [ "beforeSend", "error", "complete" ], "handled expected errors" );
		teardownErrorHandling();
		start();
	} );

	$.ajax( {
		url: "nonexistent.file?" + Math.random(),
		type: "GET",
		dataType: "text",
		beforeSend: function() { throw "beforeSend"; },
		error: function() { throw "error"; },
		complete: function() { throw "complete"; }
	} );
} );

versionAsyncTest( "1.5", "ajax(url, Object), success", 1, function() {
	var buf = setupErrorHandling();

	$( document ).one( "ajaxStop", function() {
		deepEqual( buf, [ "beforeSend", "success", "complete" ], "handled expected errors" );
		teardownErrorHandling();
		start();
	} );

	$.ajax( "../jquery.js", {
		type: "GET",
		dataType: "text",
		beforeSend: function() { throw "beforeSend"; },
		success: function() { throw "success"; },
		complete: function() { throw "complete"; }
	} );
} );

versionAsyncTest( "1.5", "ajax(url, Object), error", 1, function() {
	var buf = setupErrorHandling();

	$( document ).one( "ajaxStop", function() {
		deepEqual( buf, [ "beforeSend", "error", "complete" ], "handled expected errors" );
		teardownErrorHandling();
		start();
	} );

	$.ajax( "nonexistent.file?" + Math.random(), {
		type: "GET",
		dataType: "text",
		beforeSend: function() { throw "beforeSend"; },
		error: function() { throw "error"; },
		complete: function() { throw "complete"; }
	} );
} );

versionAsyncTest( "1.1", "ajaxSetup(Object), success", 1, function() {
	var buf = setupErrorHandling();

	$( document ).one( "ajaxStop", function() {
		deepEqual( buf, [ "beforeSend", "success", "complete" ], "handled expected errors" );
		$.ajaxSetup( {} );
		teardownErrorHandling();
		start();
	} );

	$.ajaxSetup( {
		type: "GET",
		dataType: "text",
		beforeSend: function() { throw "beforeSend"; },
		success: function() { throw "success"; },
		complete: function() { throw "complete"; }
	} );

	$.ajax( { url: "../jquery.js" } );
} );

versionAsyncTest( "1.1", "ajaxSetup(Object), error", 1, function() {
	var buf = setupErrorHandling();

	$( document ).one( "ajaxStop", function() {
		deepEqual( buf, [ "beforeSend", "error", "complete" ], "handled expected errors" );
		$.ajaxSetup( {} );
		teardownErrorHandling();
		start();
	} );

	$.ajaxSetup( {
		type: "GET",
		dataType: "text",
		beforeSend: function() { throw "beforeSend"; },
		error: function() { throw "error"; },
		complete: function() { throw "complete"; }
	} );

	$.ajax( { url: "nonexistent.file?" + Math.random() } );
});



module( "animate/queue callbacks" );

asyncTest( "animate(Object)", 1, function() {
	var buf = setupErrorHandling();

	setTimeout( function() {
		$( "#qunit-fixture div" )
			.css( "height", 1 )
			.animate( { height: 5 }, {
				complete: function() {
					setTimeout( function() {
						deepEqual( buf, [ "animate" ], "handled expected errors" );

						teardownErrorHandling();
						start();
					}, 0 );

					throw "animate";
				}
			} );
	}, 0 );
} );

asyncTest( "animate(callback)", 1, function() {
	var buf = setupErrorHandling();

	setTimeout( function() {
		$( "#qunit-fixture div" )
			.css( "height", 1 )
			.animate( { height: 5 }, function() {
				setTimeout( function() {
					deepEqual( buf, [ "animate" ], "handled expected errors" );

					teardownErrorHandling();
					start();
				}, 0 );

				throw "animate";
			} );
	}, 0 );
} );

asyncTest( "animate(speed, callback)", 1, function() {
	var buf = setupErrorHandling();

	setTimeout( function() {
		$( "#qunit-fixture div" )
			.css( "height", 1 )
			.animate( { height: 5 }, "fast", function() {
				setTimeout( function() {
					deepEqual( buf, [ "animate" ], "handled expected errors" );

					teardownErrorHandling();
					start();
				}, 0 );

				throw "animate";
			} );
	}, 0 );
} );

asyncTest( "animate(easing, callback)", 1, function() {
	var buf = setupErrorHandling();

	setTimeout( function() {
		$( "#qunit-fixture div" )
			.css( "height", 1 )
			.animate( { height: 5 }, "swing", function() {
				setTimeout( function() {
					deepEqual( buf, [ "animate" ], "handled expected errors" );

					teardownErrorHandling();
					start();
				}, 0 );

				throw "animate";
			} );
	}, 0 );
} );

asyncTest( "animate(speed, easing, callback)", 1, function() {
	var buf = setupErrorHandling();

	setTimeout( function() {
		$( "#qunit-fixture div" )
			.css( "height", 1 )
			.animate( { height: 5 }, "fast", "swing", function() {
				setTimeout( function() {
					deepEqual( buf, [ "animate" ], "handled expected errors" );

					teardownErrorHandling();
					start();
				}, 0 );

				throw "animate";
			} );
	}, 0 );
} );

asyncTest( "animate step", 1, function() {
	var buf = setupErrorHandling(), count = 0;

	setTimeout( function() {
		$( "#qunit-fixture div" )
			.css( "height", 1 )
			.animate( { height: 5 }, {
				step: function() {
					count++;
					throw "animate";
				},
				complete: function() {
					var expected = [], i;
					for ( i = 0; i < count; i++ ) {
						expected[ i ] = "animate";
					}
					deepEqual( buf, expected, "handled expected errors" );

					teardownErrorHandling();
					start();
				}
			} );
	}, 0 );
} );

asyncTest( "queue(function)", 1, function() {
	var buf = setupErrorHandling();

	setTimeout( function() {
		$( "#qunit-fixture div" ).queue( function() {
			setTimeout( function() {
				deepEqual( buf, [ "queue" ], "handled expected errors" );

				teardownErrorHandling();
				start();
			}, 0 );

			throw "queue";
		} );
	}, 0 );
} );

asyncTest( "queue(array)", 1, function() {
	var buf = setupErrorHandling();

	setTimeout( function() {
		$( "#qunit-fixture div" ).queue( [
			function() {
				setTimeout( function() {
					deepEqual( buf, [ "queue" ], "handled expected errors" );

					teardownErrorHandling();
					start();
				}, 0 );

				throw "queue";
			}
		] );
	}, 0 );
} );



module( "deferred callbacks" );

versionTest( "1.5", "done/resolve()", 5, function() {
	var buf = setupErrorHandling();

	$.Deferred()
		.done( function( obj ) {
			equal( obj, undefined, "done before resolve: callback has no arguments" );
			ok( this.promise, "done before resolve: callback context is delegate object" );
			throw "done before resolve";
		} )
		.resolve()
		.done( function( obj ) {
			equal( obj, undefined, "done after resolve: callback has no arguments" );
			ok( this.promise, "done after resolve: callback context is delegate object" );
			throw "done after resolve";
		} );

	deepEqual( buf, [ "done before resolve", "done after resolve" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.5", "done/resolve(arguments)", 5, function() {
	var buf = setupErrorHandling();

	$.Deferred()
		.done( function( obj ) {
			equal( obj.foo, "bar", "done before resolve: callback has arguments" );
			ok( this.promise, "done before resolve: callback context is delegate object" );
			throw "done before resolve";
		} )
		.resolve( { foo: "bar" } )
		.done( function( obj ) {
			equal( obj.foo, "bar", "done after resolve: callback has arguments" );
			ok( this.promise, "done after resolve: callback context is delegate object" );
			throw "done after resolve";
		} );

	deepEqual( buf, [ "done before resolve", "done after resolve" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.5", "done/resolveWith(Object)", 5, function() {
	var buf = setupErrorHandling();

	$.Deferred()
		.done( function( obj ) {
			equal( obj, undefined, "done before resolve: callback has no arguments" );
			equal( this.bar, "foo", "done before resolve: callback context is custom object" );
			throw "done before resolve";
		} )
		.resolveWith( { bar: "foo" } )
		.done( function( obj ) {
			equal( obj, undefined, "done after resolve: callback has no arguments" );
			equal( this.bar, "foo", "done after resolve: callback context is custom object" );
			throw "done after resolve";
		} );

	deepEqual( buf, [ "done before resolve", "done after resolve" ], "handled expected errors" );

	teardownErrorHandling();
} );

versionTest( "1.5", "done/resolveWith(Object, Array)", 5, function() {
	var buf = setupErrorHandling();

	$.Deferred()
		.done( function( obj ) {
			equal( obj.foo, "bar", "done before resolve: callback has arguments" );
			equal( this.bar, "foo", "done before resolve: callback context is custom object" );
			throw "done before resolve";
		} )
		.resolveWith( { bar: "foo" }, [ { foo: "bar" } ] )
		.done( function( obj ) {
			equal( obj.foo, "bar", "done after resolve: callback has arguments" );
			equal( this.bar, "foo", "done after resolve: callback context is custom object" );
			throw "done after resolve";
		} );

	deepEqual( buf, [ "done before resolve", "done after resolve" ], "handled expected errors" );

	teardownErrorHandling();
} );

