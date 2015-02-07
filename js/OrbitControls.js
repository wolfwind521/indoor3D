/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @modified wolfwind
 */

THREE.OrbitControls = function ( object, domElement ) {

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // API

    this.enabled = true;

    this.center = new THREE.Vector3();

    this.userZoom = true;
    this.userZoomSpeed = 0.5;

    this.userRotate = true;
    this.userRotateSpeed = 1.0;

    this.userPan = true;
    this.userPanSpeed = 1.5;

    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI/2; // radians

    this.minDistance = 0;
    this.maxDistance = Infinity;

    // 65 /*A*/, 83 /*S*/, 68 /*D*/
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, ROTATE: 65, ZOOM: 83, PAN: 68 };

    this.is3d = true;

    // internals

    var scope = this;

    var EPS = 0.000001;
    var PIXELS_PER_ROUND = 1800;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var zoomStart = new THREE.Vector2();
    var zoomEnd = new THREE.Vector2();
    var zoomDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;

    var lastPosition = new THREE.Vector3();

    var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };
    var state = STATE.NONE;

    // events

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start'};
    var endEvent = { type: 'end'};

    this.reset = function (){
        rotateStart = new THREE.Vector2();
        rotateEnd = new THREE.Vector2();
        rotateDelta = new THREE.Vector2();

        zoomStart = new THREE.Vector2();
        zoomEnd = new THREE.Vector2();
        zoomDelta = new THREE.Vector2();

        panStart = new THREE.Vector2();
        panEnd = new THREE.Vector2();
        panDelta = new THREE.Vector2();

        phiDelta = 0;
        thetaDelta = 0;
        scale = 1;

        lastPosition = new THREE.Vector3();
        state = STATE.NONE;

        this.center = new THREE.Vector3();

    }

    this.rotateLeft = function ( angle ) {

        if ( angle === undefined ) {

            angle = getAutoRotationAngle();

        }

        thetaDelta -= angle;

    };

    this.rotateRight = function ( angle ) {

        if ( angle === undefined ) {

            angle = getAutoRotationAngle();

        }

        thetaDelta += angle;

    };

    this.rotateUp = function ( angle ) {

        if ( angle === undefined ) {

            angle = getAutoRotationAngle();

        }

        phiDelta -= angle;

    };

    this.rotateDown = function ( angle ) {

        if ( angle === undefined ) {

            angle = getAutoRotationAngle();

        }

        phiDelta += angle;

    };

    this.zoomIn = function ( zoomScale ) {

        if ( zoomScale === undefined ) {

            zoomScale = getZoomScale();

        }

        scale /= zoomScale;

    };

    this.zoomOut = function ( zoomScale ) {

        if ( zoomScale === undefined ) {

            zoomScale = getZoomScale();

        }

        scale *= zoomScale;

    };

    this.pan = function ( distance ) {

        distance.transformDirection( this.object.matrix );
        distance.multiplyScalar( scope.userPanSpeed );

        this.object.position.add( distance );
        this.center.add( distance );

    };

    this.set3D = function(b){
        scope.is3d = b;
        if(b){
            //TODO
        }
    }

    this.update = function () {

        var position = this.object.position;
        var offset = position.clone().sub( this.center );

        // angle from z-axis around y-axis

        var theta = Math.atan2( offset.x, offset.z );

        // angle from y-axis

        var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

        if ( this.autoRotate ) {

            this.rotateLeft( getAutoRotationAngle() );

        }

        theta += thetaDelta;
        phi += phiDelta;

        // restrict phi to be between desired limits
        phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

        var radius = offset.length() * scale;

        // restrict radius to be between desired limits
        radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

        offset.x = radius * Math.sin( phi ) * Math.sin( theta );
        offset.y = radius * Math.cos( phi );
        offset.z = radius * Math.sin( phi ) * Math.cos( theta );

        position.copy( this.center ).add( offset );

        this.object.lookAt( this.center );

        thetaDelta = 0;
        phiDelta = 0;
        scale = 1;

        if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

            this.dispatchEvent( changeEvent );

            lastPosition.copy( this.object.position );
            this.viewChanged = true;

        }

    };


    function getAutoRotationAngle() {

        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

        return Math.pow( 0.95, scope.userZoomSpeed );

    }

    function onMouseDown( event ) {

        if ( scope.enabled === false ) return;
        if ( scope.userRotate === false ) return;

        event.preventDefault();

        if ( state === STATE.NONE )
        {
            if ( event.button === 0 )
                state = STATE.PAN;
            if ( event.button === 1 )
                state = STATE.ZOOM;
            if ( event.button === 2 )
                state = STATE.ROTATE;
        }


        if ( state === STATE.ROTATE ) {

            //state = STATE.ROTATE;

            rotateStart.set( event.clientX, event.clientY );

        } else if ( state === STATE.ZOOM ) {

            //state = STATE.ZOOM;

            zoomStart.set( event.clientX, event.clientY );

        } else if ( state === STATE.PAN ) {

            //state = STATE.PAN;
            panStart.set(event.clientX, event.clientY);

        }

        document.addEventListener( 'mousemove', onMouseMove, false );
        document.addEventListener( 'mouseup', onMouseUp, false );

    }

    function onMouseMove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();



        if ( state === STATE.ROTATE ) {

            rotateEnd.set( event.clientX, event.clientY );
            rotateDelta.subVectors( rotateEnd, rotateStart );

            scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
            scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

            rotateStart.copy( rotateEnd );

        } else if ( state === STATE.ZOOM ) {

            zoomEnd.set( event.clientX, event.clientY );
            zoomDelta.subVectors( zoomEnd, zoomStart );

            if ( zoomDelta.y > 0 ) {

                scope.zoomIn();

            } else {

                scope.zoomOut();

            }

            zoomStart.copy( zoomEnd );

        } else if ( state === STATE.PAN ) {

            panEnd.set(event.clientX, event.clientY);
            panDelta.subVectors(panEnd, panStart);
            scope.pan( new THREE.Vector3( - panDelta.x, panDelta.y , 0 ) );
            panStart.copy(panEnd);

        }

    }

    function onMouseUp( event ) {

        if ( scope.enabled === false ) return;
        if ( scope.userRotate === false ) return;

        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );

        state = STATE.NONE;

    }

    function onMouseWheel( event ) {

        if ( scope.enabled === false ) return;
        if ( scope.userZoom === false ) return;

        var delta = 0;

        if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if ( event.detail ) { // Firefox

            delta = - event.detail;

        }

        if ( delta > 0 ) {

            scope.zoomOut();

        } else {

            scope.zoomIn();

        }

    }

    function onKeyDown( event ) {

        if ( scope.enabled === false ) return;
        if ( scope.userPan === false ) return;

        switch ( event.keyCode ) {

            /*case scope.keys.UP:
             scope.pan( new THREE.Vector3( 0, 1, 0 ) );
             break;
             case scope.keys.BOTTOM:
             scope.pan( new THREE.Vector3( 0, - 1, 0 ) );
             break;
             case scope.keys.LEFT:
             scope.pan( new THREE.Vector3( - 1, 0, 0 ) );
             break;
             case scope.keys.RIGHT:
             scope.pan( new THREE.Vector3( 1, 0, 0 ) );
             break;
             */
            case scope.keys.ROTATE:
                state = STATE.ROTATE;
                break;
            case scope.keys.ZOOM:
                state = STATE.ZOOM;
                break;
            case scope.keys.PAN:
                state = STATE.PAN;
                break;

        }

    }

    function onKeyUp( event ) {

        switch ( event.keyCode ) {

            case scope.keys.ROTATE:
            case scope.keys.ZOOM:
            case scope.keys.PAN:
                state = STATE.NONE;
                break;
        }

    }

    function touchstart( event ) {

        if ( scope.enabled === false ) return;

        switch ( event.touches.length ) {

            case 2:
                if(scope.is3d) { //rotate when using webgl
                    state = STATE.TOUCH_ROTATE;
                    rotateStart.copy(event.touches[ 0 ].clientX, event.touches[ 0 ].clientY );
                    rotateEnd.copy(rotateStart);
                }else{
                    state = STATE.NONE;
                }
                break;
            case 1:
                state = STATE.TOUCH_ZOOM_PAN;
//                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
//                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
//                _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

//                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
//                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                panStart.set( event.touches[ 0 ].clientX, event.touches[ 0 ].clientY );
                //panEnd.copy( panStart );
                break;

            default:
                state = STATE.NONE;

        }
        document.addEventListener( 'touchend', touchend, false );
        document.addEventListener( 'touchmove', touchmove, false );
        scope.dispatchEvent( startEvent );


    }

    function touchmove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        switch ( event.touches.length ) {

            case 2:
                if(scope.is3d) {
                    rotateEnd.copy(event.touches[ 0 ].clientX, event.touches[ 0 ].clientY );
                }else{
                    state = STATE.NONE;
                }
                break;
            case 1:
//                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
//                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
//                _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );
//
//                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
//                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                panEnd.set( event.touches[ 0 ].clientX, event.touches[ 0 ].clientY );
                panDelta.subVectors(panEnd, panStart);
                scope.pan(new THREE.Vector3( - panDelta.x, panDelta.y , 0 ));
                panStart.copy(panEnd);
                break;

            default:
                state = STATE.NONE;

        }

    }

    function touchend( event ) {

        if ( scope.enabled === false ) return;

//        switch ( event.touches.length ) {
//
//            case 2:
//                if(scope.is3d) {
//                    rotateEnd.copy(event.touches[ 0 ].clientX, event.touches[ 0 ].clientY );
//                    rotateStart.copy(rotateEnd);
//                }
//                break;
//            case 1:
////                _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
////
////                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
////                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
////                panEnd.copy( event.touches[ 0 ].clientX, event.touches[ 0 ].clientY );
////                panStart.copy( panEnd );
//                break;
//
//        }
        document.removeEventListener('touchend', touchend, false);
        document.removeEventListener('touchmove', touchmove, false);

        state = STATE.NONE;
        scope.dispatchEvent( endEvent );

    }

    this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
    this.domElement.addEventListener( 'mousedown', onMouseDown, false );
    this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
    this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
    this.domElement.addEventListener( 'touchstart', touchstart, false );

    window.addEventListener( 'keydown', onKeyDown, false );
    window.addEventListener( 'keyup', onKeyUp, false );

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
