function setupErrorHandling() {
	var buf = [];
	Glitch.bind( function( error ) {
		buf.push( error );
		return false;
	} );
	return buf;
}

function teardownErrorHandling() {
	Glitch.unbind();
	defaultbuf = [];
	firstbuf = [];
}



module( "core" );

// XXX uncaught others
(function() {

})();


asyncTest( "uncaught error", 3, function() {
	// escape qunit's try/catch
	setTimeout( function() {
		var buf = setupErrorHandling();

		setTimeout( function() {
			if ( buf.length ) {
				// when the error reaches window.onerror, the real error object/value is not available
				ok( buf[ 0 ] && buf[ 0 ].message, "handled expected errors" );
				ok( firstbuf[ 0 ] && firstbuf[ 0 ].message, "handled expected errors (first)" );
				ok( defaultbuf[ 0 ] && defaultbuf[ 0 ].message, "handled expected errors (default)" );
			} else {
				// for Chrome < 10, Safari, IE 7 inside setTimeout
				// XXX need to rethink how this test case is done for IE 7
				expect( 1 );
				ok( true, "window.onerror was not called by this browser" );
			}

			teardownErrorHandling();
			start();
		}, 0 );

		throw "uncaught";
	}, 0 );
} );

test( "caught", 3, function() {
	var buf = setupErrorHandling();

	Glitch( function() { throw undefined; } );
	Glitch( function() { throw null; } );
	Glitch( function() { throw true; } );
	Glitch( function() { throw false; } );
	Glitch( function() { throw 0; } );
	Glitch( function() { throw 1; } );
	Glitch( function() { throw "error"; } );
	Glitch( function() { throw { foo: "bar" }; } );

	deepEqual( buf, [ undefined, null, true, false, 0, 1, "error", { foo: "bar" } ], "handled expected errors" );
	deepEqual( firstbuf, [ undefined, null, true, false, 0, 1, "error", { foo: "bar" } ], "handled expected errors (first)" );
	deepEqual( defaultbuf, [ undefined, null, true, false, 0, 1, "error", { foo: "bar" } ], "handled expected errors (default)" );

	teardownErrorHandling();
} );

test( "Glitch/add/remove/trigger", 3, function() {
	var buf = setupErrorHandling(),
		listener = function( error ) {
			buf.push( error + " 2" );
		};

	Glitch( function() { throw "a"; } );
	Glitch.trigger( "b" );

	Glitch.bind( listener );

	Glitch( function() { throw "c"; } );
	Glitch.trigger( "d" );

	Glitch.unbind( listener );

	Glitch( function() { throw "e"; } );
	Glitch.trigger( "f" );

	Glitch( function( a, b, c ) { throw a + b.d + c; }, [ 'a', { d: 'rg' }, 's' ] );

	Glitch.unbind();

	Glitch( function() { throw "g"; } );
	Glitch.trigger( "h" );

	deepEqual( buf, [ "a", "b", "c", "c 2", "d", "d 2", "e", "f", "args" ], "handled expected errors" );
	deepEqual( firstbuf, [ "a", "b", "c", "d", "e", "f", "args", "g", "h" ], "handled expected errors (first)" );
	deepEqual( defaultbuf, [ "a", "b", "c", "d", "e", "f", "args", "g", "h" ], "handled expected errors (default)" );

	teardownErrorHandling();
} );

test( "wrap", 6, function() {
	var buf = setupErrorHandling(), obj;

	Glitch.wrap( function( arg ) {
		equal( arg.bar, "foo", "correct arguments" );
		equal( this.foo, "bar", "correct context" );
		throw "wrap";
	} ).call( { foo: "bar" }, { bar: "foo" } );

	equal( Glitch.wrap( { foo: function() { return "return value"; } } ).foo(), "return value", "correct return value" );

	deepEqual( buf, [ "wrap" ], "handled expected errors" );
	deepEqual( firstbuf, [ "wrap" ], "handled expected errors (first)" );
	deepEqual( defaultbuf, [ "wrap" ], "handled expected errors (default)" );

	teardownErrorHandling();
} );

asyncTest( "setTimeout", 3, function() {
	var buf = setupErrorHandling();

	Glitch.setTimeout( function() { throw "function"; }, 0 );
	clearTimeout( Glitch.setTimeout( function() { throw "clear function"; }, 500 ) );

	setTimeout( function() {
		deepEqual( buf, [ "function" ], "handled expected errors" );
		deepEqual( firstbuf, [ "function" ], "handled expected errors (first)" );
		deepEqual( defaultbuf, [ "function" ], "handled expected errors (default)" );

		teardownErrorHandling();
		start();
	}, 1000 );
} );

asyncTest( "setInterval", 3, function() {
	var buf = setupErrorHandling(),
		count = 0, id;

	id = Glitch.setInterval( function() {
		count++;
		if ( count < 3 ) {
			throw "function " + count;
		} else {
			clearTimeout( id );
		}
	}, 150 );

	setTimeout( function() {
		deepEqual( buf, [ "function 1", "function 2" ], "handled expected errors" );
		deepEqual( firstbuf, [ "function 1", "function 2" ], "handled expected errors (first)" );
		deepEqual( defaultbuf, [ "function 1", "function 2" ], "handled expected errors (default)" );

		teardownErrorHandling();
		start();
	}, 1000 );
} );

test( "noConflict", 4, function() {
	var g = Glitch.noConflict();
	equal( Glitch, firstGlitch, "restored first Glitch" );

	g.noConflict( true );
	equal( window.onerror, firstOnerror, "restored first onerror" );

	Glitch.noConflict();
	equal( Glitch, defaultGlitch, "restored default Glitch" );

	firstGlitch.noConflict( true );
	equal( window.onerror, defaultOnerror, "restored default onerror" );
} );

