/**
 * Created by gaimeng on 14/12/27.
 */


//---------------------the Mall class--------------------
function Mall(){
    var _this = this;
    this.floors = [];   //the floors
    this.building = null; //the building
    this.root = new THREE.Object3D(); //the root scene
    this.theme = defaultTheme; //theme
    this.is3d = true;

    var _curFloorId;

    //get current floor id
    this.getCurFloorId = function() {
        return _curFloorId;
    }

    //get floor by id
    this.getFloor = function(id) {
        for(var i = 0; i < _this.floors.length; i++) {
            if(_this.floors[i]._id == id) {
                return _this.floors[i];
            }
        }
        return null;
    }

    //get floor by name
    this.getFloorByName = function(name){
        for(var i = 0; i < _this.floors.length; i++) {
            if(_this.floors[i].Name == name) {
                return _this.floors[i];
            }
        }
        return null;
    }

    //get current floor
    this.getCurFloor = function() {
        return _this.getFloor(_curFloorId);
    }

    //show floor by id
    this.showFloor = function(id){
        if(_this.is3d) {
            //set the building outline to invisible
            _this.root.remove(_this.building);
            //set all the floors to invisible
            for (var i = 0; i < _this.floors.length; i++) {
                if (_this.floors[i]._id == id) {
                    //set the specific floor to visible
                    _this.floors[i].position.set(0, 0, 0);
                    _this.root.add(_this.floors[i]);
                } else {
                    _this.root.remove(_this.floors[i]);
                }
            }
        }
        _curFloorId = id;
    }

    //show the whole building
    this.showAllFloors = function(){
        if(!_this.is3d){ //only the 3d map can show all the floors
            return;
        }

        _this.root.add(_this.building);

        var offset = 4;
        for(var i=0; i<_this.floors.length; i++){
            _this.floors[i].position.set(0,0,i*_this.floors[i].height*offset);
            _this.root.add(this.floors[i]);
        }
        this.building.scale.set(1,1,offset);

        _curFloorId = 0;

        return _this.root;
    }
}
//----------------------------theme--------------------------------------
var defaultTheme = {
    name : "test", //theme's name
    background : 0xe6e6e6, //background color

    //building's style
    building : {
        color: 0x000000,
        opacity: 0.1,
        transparent:true,
        depthTest:false
    },

    //floor's style
    floor : {
        color: 0xc1c1c1,
        opacity:1,
        transparent:false
    },

    //selected room's style
    selected : 0xffff55,

    //rooms' style
    room : function(type){
        switch (type){

            case "000100": //hollow. u needn't change this color. because i will make a hole on the model in the final version.
                return {
                    color: 0x212121,
                    opacity: 0.8,
                    transparent: true
                }
            case "000300": //closed area
                return {
                    color: 0x9e9e9e,
                    opacity: 0.7,
                    transparent: true
                };
            case "000400": //empty shop
                return{
                    color: 0xE4E4E4,
                    opacity: 0.7,
                    transparent: true
                };
            case "050100": //chinese food
                return {
                    color: 0xd8992c,
                    opacity: 0.7,
                    transparent: true
                };
            case "050117": //hotpot
                return {
                    color: 0xe6a1d1,
                    opacity: 0.7,
                    transparent: true
                };
            case "050201": //i don't know. some kinds of food...
                return {
                    color: 0xb9b3ff,
                    opacity: 0.7,
                    transparent: true
                };
            case "050300": //western food
                return {
                    color: 0xa1e5e6,
                    opacity: 0.7,
                    transparent: true
                };
            case "050300": //western food
                return {
                    color: 0x9e9323,
                    opacity: 0.7,
                    transparent: true
                };
            case "061102": //shoes
                return {
                    color: 0x99455e,
                    opacity: 0.7,
                    transparent: true
                };
            case "061103": //bags
                return {
                    color: 0x17566a,
                    opacity: 0.7,
                    transparent: true
                };
            case "061202": //jewelry
                return {
                    color: 0xd6675b,
                    opacity: 0.7,
                    transparent: true
                };
            case "061400": //toiletry
                return {
                    color: 0x17566a,
                    opacity: 0.7,
                    transparent: true
                };

            default : //default
                return {
                    color: 0xd0641a,
                    opacity: 0.7,
                    transparent: true
                };
        }
    },

    //room wires' style
    roomWire : {
        color: 0x38291f,
        opacity: 0.5,
        transparent: true,
        linewidth: 1
    },

    //icons of the labels
    labelImg: function(type){
        switch (type){
            case "000300": //closed area
                return "./img/indoor_floor_normal.png";
            case "11001": //WC
                return "./img/wc.png";
            case "11002": //atm
                return "./img/indoor_pub_atm.png";
            case "11003": //cashier
                return "./img/indoor_pub_cashier.png";
            case "11004": //office
                return "./img/indoor_pub_office.png";
            case "21001": //staircase
                return "./img/indoor_pub_staircase.png";
            case "21002": //escalator
                return "./img/indoor_pub_escalator.png";
            case "21003": //elevator
                return "./img/indoor_pub_elevator.png";
            case "050100": //food
                return "./img/indoor_func_am0010.png";
            case "061102": //shoes
                return "./img/indoor_func_am0006.png";
            case "061103": //bags
                return "./img/indoor_func_am0009.png";
            case "061202": //jewelry
                return "./img/indoor_func_am0002.png";
            case "061400": //toiletry
                return "./img/indoor_func_am0005.png";
            case "22006": //gate
                return "./img/gate.png";

            default : //default
                return "./img/default-point.png";
        }
    }
}
//----------------------------the Loader class --------------------------
IndoorMapLoader= function ( is3d ) {

    THREE.Loader.call( this, is3d );

    this.withCredentials = false;
    this.is3d = is3d;

};

IndoorMapLoader.prototype = Object.create( THREE.Loader.prototype );

IndoorMapLoader.prototype.load = function ( url, callback, texturePath ) {

    var scope = this;

    this.onLoadStart();
    this.loadAjaxJSON( this, url, callback );

};

IndoorMapLoader.prototype.loadAjaxJSON = function ( context, url, callback, callbackProgress ) {

    var xhr = new XMLHttpRequest();

    var length = 0;

    xhr.onreadystatechange = function () {

        if ( xhr.readyState === xhr.DONE ) {

            if ( xhr.status === 200 || xhr.status === 0 ) {

                if ( xhr.responseText ) {

                    var json = JSON.parse( xhr.responseText );

                    var result = context.parse( json );
                    callback( result );

                } else {

                    console.error( 'IndoorMapLoader: "' + url + '" seems to be unreachable or the file is empty.' );

                }

                // in context of more complex asset initialization
                // do not block on single failed file
                // maybe should go even one more level up

                context.onLoadComplete();

            } else {

                console.error( 'IndoorMapLoader: Couldn\'t load "' + url + '" (' + xhr.status + ')' );

            }

        } else if ( xhr.readyState === xhr.LOADING ) {

            if ( callbackProgress ) {

                if ( length === 0 ) {

                    length = xhr.getResponseHeader( 'Content-Length' );

                }

                callbackProgress( { total: length, loaded: xhr.responseText.length } );

            }

        } else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {

            if ( callbackProgress !== undefined ) {

                length = xhr.getResponseHeader( 'Content-Length' );

            }

        }

    };

    xhr.open( 'GET', url, true );
    xhr.withCredentials = this.withCredentials;
    xhr.send( null );

};

IndoorMapLoader.prototype.parse = function ( json ) {

    var scope = this,
        mall = new Mall();

    //get the center of some points
    function getCenter(points){
        var center = new THREE.Vector2(0,0);
        for(var i=0; i<points.length; i++){
            center.add(points[i]);
        }
        center.divideScalar(points.length);
        return center;
    }

    function parse3DModels() {
        var building,shape, extrudeSettings, geometry, material, mesh, wire, color, points;
        var scale = 0.1, floorHeight, buildingHeight = 0;
        var underfloors = json.data.building.UnderFloors;

        //floor geometry
        for(var i=0; i<json.data.Floors.length; i++){
            var floorObj = new THREE.Object3D();
            var floor = json.data.Floors[i];
            var floorid = floor._id;
            floorHeight = floor.High / scale;
            if(floorHeight == 0.0){ //if it's 0, set to 50.0
                floorHeight = 50.0;
            }
            buildingHeight += floorHeight;
            points = parsePoints(floor.Outline[0][0]);
            shape = new THREE.Shape(points);
            geometry = new THREE.ShapeGeometry(shape);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(mall.theme.floor));
            mesh.position.set(0,0,-5);

            floorObj.height = floorHeight;
            floorObj.add(mesh);
            floorObj.points = [];
            floorObj._id = floor._id;
            var index;
            if(floorid < 0) { //underfloors
                index = floorid + underfloors;
            }else{ // ground floors, id starts from 1
                index = floorid - 1 + underfloors;
            }
            mall.floors[index] = floorObj;
            //funcArea geometry
            for(var j=0; j<floor.FuncAreas.length; j++){

                var funcArea = floor.FuncAreas[j];
                points = parsePoints(funcArea.Outline[0][0]);
                shape = new THREE.Shape(points);

                var center = getCenter(points);
                floorObj.points.push({ name: funcArea.Name, type: funcArea.Type, position: new THREE.Vector3(center.x * scale, floorHeight * scale, -center.y * scale )});

                //solid model
                if(scope.is3d) {
                    extrudeSettings = {amount: floorHeight, bevelEnabled: false};
                    geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                    material = new THREE.MeshLambertMaterial(mall.theme.room(funcArea.Type));
                }else{
                    geometry = new THREE.ShapeGeometry(shape);
                    material = new THREE.MeshBasicMaterial(mall.theme.room(funcArea.Type));
                }
                mesh = new THREE.Mesh(geometry, material);
                mesh.type = "solidroom";
                mesh.name = funcArea.Name;
                mesh.id = funcArea._id;
                floorObj.add(mesh);

                geometry = shape.createPointsGeometry();
//                //bottom wireframe
//                wire = new THREE.Line(geometry, mall.theme.roomWireMat);
//                floorObj.add(wire);

                //top wireframe
                wire = new THREE.Line(geometry, new THREE.LineBasicMaterial(mall.theme.roomWire));
                if(scope.is3d) {
                    wire.position.set(0, 0, floorHeight);
                }
                floorObj.add(wire);


            }

            //pubPoint geometry
            for(var j = 0; j < floor.PubPoint.length; j++){
                var pubPoint = floor.PubPoint[j];
                var point = parsePoints(pubPoint.Outline[0][0])[0];
                floorObj.points.push({name: pubPoint.Name, type: pubPoint.Type, position: new THREE.Vector3(point.x * scale,  floorHeight * scale, -point.y * scale)});
            }
        }

        //building geometry
        building = json.data.building;
        points = parsePoints(building.Outline[0][0]);

        if(points.length > 0) {
                shape = new THREE.Shape(points);
                extrudeSettings = {amount: buildingHeight, bevelEnabled: false};
                geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(mall.theme.building));

                mall.building = mesh;
        }
        mall.root.name = building.Name;
        mall.remark = building.Remark;

        //scale the mall
        mall.root.scale.set(scale, scale, scale);
        mall.root.rotateOnAxis(new THREE.Vector3(1, 0, 0 ), -Math.PI/2);

        return mall;


    };

    //parse the points to THREE.Vector2 (remove duplicated points)
    function parsePoints(pointArray){
        var shapePoints = [];
        for(var i=0; i < pointArray.length; i+=2){
            var point = new THREE.Vector2(pointArray[i], pointArray[i+1]);
            if(i>0) {
                var lastpoint = shapePoints[shapePoints.length - 1];
                if (point.x != lastpoint.x || point.y != lastpoint.y) { //there are some duplicate points in the original data
                    shapePoints.push(point);
                }
            }else{
                shapePoints.push(point);
            }
        }
        return shapePoints;
    }

    mall.is3d = scope.is3d;
    if(scope.is3d){//3d map
        return parse3DModels();
    }else{//2d map
        mall.jsonData = json;
        for(var i = 0; i < json.data.Floors.length; i++){
            mall.floors.push(json.data.Floors[i]);
            mall.building = json.data.building;
        }
        return mall;
    }
};

//-----------------------------the IndoorMap class ------------------------------------

var IndoorMap = function (params) {
    var _this = this;
    var _scene, _controls, _renderer, _projector, _rayCaster;
    var _mapDiv, _canvasDiv, _labelsRoot, _uiRoot, _uiSelected;
    var _selected;
    var _showLabels = false;
    var _curFloorId = 0;
    var _fullScreen = false;
    var _selectionListener = null;
    this.is3d = true;

    //initialization
    this.init = function (params) {

        // get the map div
        if (!(typeof params === "undefined") && params.hasOwnProperty("mapDiv")) {
            _mapDiv = document.getElementById(params.mapDiv);
        }
        if(!(typeof params === "undefined") && params.hasOwnProperty("dim")){
            if(params.dim == "2d"){
                _this.is3d = false;
            }
        }

        if(_mapDiv != null){
            _fullScreen = false;
        } else {
            //if the mapDiv undefined, create a fullscreen map
            _mapDiv = document.createElement("div");
            _mapDiv.style.width = window.innerWidth + "px";
            _mapDiv.style.height = window.innerHeight + "px";
            _mapDiv.id = "indoor3d";
            document.body.appendChild(_mapDiv);
            document.body.style.margin = "0";
            _fullScreen = true;
            window.addEventListener('resize', onWindowResize, false);
        }

        // set up the scene
        _scene = new THREE.Scene();
        _this.camera = new THREE.PerspectiveCamera(20, _mapDiv.clientWidth / _mapDiv.clientHeight, 0.1, 2000);
        _controls = new THREE.OrbitControls(_this.camera);


        // webgl detection
        if (Detector.webgl && _this.is3d) {
            _renderer = new THREE.WebGLRenderer({ antialias: true });
            var light = new THREE.DirectionalLight(0xffffff);
            light.position.set(-500, 500, -500);
            _scene.add(light);

        } else {
            //_renderer = new Canvas2DRenderer();
            _renderer = new THREE.CanvasRenderer();
            _controls.is3d = false;
            _this.is3d = false;
        }

        //set up the lights
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(500, 500, 500);
        _scene.add(light);

        _this.setDefaultView();
        _renderer.setSize(_mapDiv.clientWidth, _mapDiv.clientHeight);
        _canvasDiv = _renderer.domElement
        _mapDiv.appendChild(_canvasDiv);
        _mapDiv.style.overflow = "hidden";
        _canvasDiv.style.width = "100%";
        _canvasDiv.style.height = "100%";


    }

    //load the map by the jason file name
    this.load = function (fileName, callback) {
        var loader = new IndoorMapLoader(_this.is3d);
        loader.load(fileName, function(mall){
            _this.mall = mall;
            _scene.add(_this.mall.root);
            _scene.mall = mall;
            if(callback) {
                callback();
            }
            _renderer.setClearColor(_this.mall.theme.background);
            if(_curFloorId == 0){
               _this.showAllFloors();
            }else{
                _this.showFloor(_curFloorId);
            }

        });
    }

    //parse the json file
    this.parse = function(json){
        var loader = new IndoorMapLoader(_this.is3d);
        loader.parse(json);
    }

    //reset the camera to default configuration
    this.setDefaultView = function () {
        if(_this.is3d) {
            _this.camera.position.set(0, 150, 400);//TODO: adjust the position automatically
        }else{
            _this.camera.position.set(0, 500, 0);
        }
        _this.camera.lookAt(_scene.position);
        _controls.reset();
    }

    this.setTopView = function(){
        _this.camera.position.set(0, 500, 0);
    }

    //TODO:adjust camera to fit the building
    this.adjustCamera = function() {
        _this.setDefaultView();
        _controls.viewChanged = true;
    }

    this.zoomIn = function(zoomScale){
        _controls.zoomOut(zoomScale);
    }

    this.zoomOut = function(zoomScale){
        _controls.zoomIn(zoomScale);
    }

    //resize the map
    this.resize = function (width, height){
        if(_fullScreen) {
            _mapDiv.style.width = width + "px";
            _mapDiv.style.height = height + "px";
        }
        _this.camera.aspect = width / height;
        _this.camera.updateProjectionMatrix();

        _renderer.setSize( width, height );
        _controls.viewChanged = true;
    }

    //set if the objects are selectable
    this.setSelectable = function (selectable) {
        if(selectable){
            _projector = new THREE.Projector();
            _rayCaster = new THREE.Raycaster();
            document.addEventListener('mousedown', onSelectObject, false);
        }else{
            document.removeEventListener('mousedown', onSelectObject, false);
        }
    }

    //show the labels
    this.showLabels = function(showLabels) {
        if(showLabels == undefined){
            _showLabels = true;
        }else {
            _showLabels = showLabels;
        }

        if(_this.mall == null){ //if the mall hasn't been loaded
            return;
        }else { //the mall has already been loaded
            if (_showLabels) {
                var fid = _this.mall.getCurFloorId();
                if(fid != 0) {
                    createLabels(fid);
                    _labelsRoot.style.display = "inline";
                    updateLabels();
                }
            } else {
                if(_labelsRoot != null) {
                    _labelsRoot.style.display = "none";
                }
            }
        }
    }

    //get the UI
    this.getUI = function() {
        if(_this.mall == null){
            console.error("the data has not been loaded yet. please call this function in callback")
            return null;
        }
        //create the ul list
        _uiRoot = document.createElement('ul');
        _uiRoot.className = 'floorsUI';

        var li = document.createElement('li');
        var text = document.createTextNode('All');

        li.appendChild(text);
        _uiRoot.appendChild(li);
        li.onclick = function(){
            _this.showAllFloors();
        }

        for(var i = 0; i < this.mall.floorNames.length; i++){
            (function(arg){
                li = document.createElement('li');
                text = document.createTextNode(_this.mall.floorNames[i]);
                li.appendChild(text);
                li.onclick = function () {
                    _this.showFloor(_this.mall.floors[arg]._id);
                }
                _uiRoot.appendChild(li);
            })(i);
        }
        return _uiRoot;
    }

    //get the selected object
    this.getSelected = function(){
        return _selected;
    }

    //get the selected object
    this.getSelectedId = function(){
        return _selected.id;
    }

    //the callback function when sth is selected
    this.setSelectionListener = function(callback){
        _selectionListener = callback;
    }

    //select object by id
    this.selectById = function(id){
        var floor = _this.getCurFloor();
        for(var i = 0; i < floor.children.length; i++){
            if(floor.children[i].id && floor.children[i].id == id) {
                if (_selected) {
                    _selected.material.color.setHex(_selected.currentHex);
                }
                _this.select(floor.children[i]);
            }
        }
    }

    //select object(just hight light it)
    this.select = function(obj){
        obj.currentHex = _selected.material.color.getHex();
        obj.material.color.setHex(_this.mall.theme.selected);
    }

    //show the floor by id
    this.showFloor = function(floorid) {
        _curFloorId = floorid;
        if(_this.mall == null){
            return;
        }
        _this.mall.showFloor(floorid);
        _this.adjustCamera();
        _this.showLabels(_showLabels);
        updateUI();
        _controls.viewChanged = true;
    }

    //show all floors
    this.showAllFloors = function(){
        _curFloorId = 0; //0 for showing all
        if(_this.mall == null){
            return;
        }
        _this.mall.showAllFloors();
        _this.adjustCamera();
        if(_labelsRoot != null){
            _labelsRoot.innerHTML = ""; //clear the labels when showing all
        }
        updateUI();
    }

    //create the labels by floor id
    function createLabels(floorId){
        //create the root
        if(typeof _labelsRoot === "undefined") {
            _labelsRoot = document.createElement("div");
            _labelsRoot.className = "mapLabels";
            _mapDiv.appendChild(_labelsRoot);
        }
        _labelsRoot.innerHTML = "";

        if(typeof _this.mall === "undefined"){
            return;
        }

        var floorPoints = _this.mall.getFloor(floorId).points;
        for(var i=0 ; i < floorPoints.length; i++) {
            var div = document.createElement('div');
            var imgsrc = _this.mall.theme.labelImg(floorPoints[i].type);
            if(imgsrc != null && imgsrc != "") {
                var img = document.createElement('img');
                img.setAttribute('src', imgsrc);
                div.appendChild(img);
            }

            if(floorPoints[i].type[0] == '2')//stairs,gates...
            {
                div.className = 'pubPoints';
            }else{
                var text = document.createTextNode(floorPoints[i].name);
                div.appendChild(text);
            }
            _labelsRoot.appendChild(div);
        }

    }

    function updateLabels() {
        if(_this.mall == null || _controls == null || !_controls.viewChanged){
            return;
        }
        if(_this.mall.getCurFloor() == null || _showLabels == false || _labelsRoot.children.length == 0){
            return;
        }
        var floorPoints = _this.mall.getCurFloor().points;

        var halfWidth = _canvasDiv.clientWidth / 2;
        var halfHeight = _canvasDiv.clientHeight / 2;
        var projectMatrix = new THREE.Matrix4();
        projectMatrix.multiplyMatrices( _this.camera.projectionMatrix, _this.camera.matrixWorldInverse );
        for(var i=0; i<floorPoints.length; i++){
            var vec = new THREE.Vector3(floorPoints[i].position.x, floorPoints[i].position.y, floorPoints[i].position.z);
            vec.applyProjection(projectMatrix);
            var pos = {
                x: Math.round(vec.x * halfWidth + halfWidth),
                y: Math.round(-vec.y * halfHeight + halfHeight)
            };
            _labelsRoot.children[i].style.left = pos.x + 'px';
            _labelsRoot.children[i].style.top = pos.y+'px';
            _labelsRoot.children[i].style.position = 'absolute';

            if(pos.x < 0 || pos.x > _canvasDiv.clientWidth || pos.y < 0 || pos.y > _canvasDiv.clientHeight){
                _labelsRoot.children[i].style.display = "none";
            }else{
                _labelsRoot.children[i].style.display = "inline";
            }
        }
        _controls.viewChanged = false;
    };

    function updateUI() {
        if(_uiRoot == null){
            return;
        }
        var ulChildren = _uiRoot.children;
        if(ulChildren.length == 0){
            return;
        }
        if(_uiSelected != null){
            _uiSelected.className = "";
        }
        var curid = _this.mall.getCurFloorId();
        if( curid == 0){
            _uiSelected = _uiRoot.children[0];
        }else{
            for(var i = 0; i < ulChildren.length; i++){
                if(ulChildren[i].innerText == _this.mall.getCurFloorId().toString() ){
                    _uiSelected = ulChildren[i];
                }
            }
        }
        if(_uiSelected != null){
            _uiSelected.className = "selected";
        }
    }

    function animate () {
        requestAnimationFrame(animate);
        _controls.update();
        _renderer.render(_scene, _this.camera);
        if(_showLabels){
            updateLabels();
        }
    }

    this.draw = function(){
        _renderer.render(_scene, _this.camera);
    }

    function onSelectObject() {
        // find intersections
        event.preventDefault();
        var mouse = new THREE.Vector2();
        mouse.x = ( event.clientX / _canvasDiv.clientWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / _canvasDiv.clientHeight ) * 2 + 1;
        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        _projector.unprojectVector( vector, _this.camera );

        _rayCaster.set( _this.camera.position, vector.sub( _this.camera.position ).normalize() );

        var intersects = _rayCaster.intersectObjects( _this.mall.root.children[0].children );

        if ( intersects.length > 0 ) {

            if ( _selected != intersects[ 0 ].object ) {

                if ( _selected ) {
                    _selected.material.color.setHex( _selected.currentHex );
                }
                for(var i=0; i<intersects.length; i++) {
                    _selected = intersects[ i ].object;
                    if(_selected.type && _selected.type == "solidroom") {
                        _this.select(_selected);
                        if(_selectionListener) {
                            _selectionListener(_selected.id); //notify the listener
                        }
                        break;
                    }else{
                        _selected = null;
                    }
                    if(_selected == null && _selectionListener != null){
                        _selectionListener(-1);
                    }
                }
            }

        } else {

            if ( _selected ) {
                _selected.material.color.setHex( _selected.currentHex );
            }

            _selected = null;
            if(_selectionListener) {
                _selectionListener(-1); //notify the listener
            }
        }
    }

    function onWindowResize(){
        _this.resize(window.innerWidth, window.innerHeight);
    }


    _this.init(params);
    animate();
}