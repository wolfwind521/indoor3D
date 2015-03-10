/**
 * Created by gaimeng on 15/3/9.
 */

IndoorMap3d = function(mapdiv){
    var _this = this;

    var _mapDiv = mapdiv,
        _canvasWidth = _mapDiv.clientWidth,
        _canvasWidthHalf = _canvasWidth / 2,
        _canvasHeight = _mapDiv.clientHeight,
        _canvasHeightHalf = _canvasHeight / 2;

    var _scene, _controls, _projector, _rayCaster;
    var  _canvasDiv;
    var _selected;
    var _showNames = true, _showPubPoints = true;
    var _curFloorId = 0;
    var _selectionListener = null;
    var _sceneOrtho, _cameraOrtho;//for 2d
    var _spriteMaterials = [], _pubPointSprites=null, _nameSprites = null;

    this.camera = null;
    this.renderer = null;
    this.mall = null;
    this.is3d = true;

    this.init = function(){

        // perspective scene for normal 3d rendering
        _scene = new THREE.Scene();
        _this.camera = new THREE.PerspectiveCamera(20, _canvasWidth / _canvasHeight, 0.1, 2000);

        //orthogonal scene for sprites 2d rendering
        _sceneOrtho = new THREE.Scene();
        _cameraOrtho = new THREE.OrthographicCamera(- _canvasWidthHalf, _canvasWidthHalf, _canvasHeightHalf, -_canvasHeightHalf, 1, 10);
        _cameraOrtho.position.z = 10;

        //controls
        _controls = new THREE.OrbitControls(_this.camera);

        //renderer
        _this.renderer = new THREE.WebGLRenderer({ antialias: true });
        _this.renderer.autoClear = false;

        //set up the lights
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-500, 500, -500);
        _scene.add(light);

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(500, 500, 500);
        _scene.add(light);

        //canvas div
        _this.renderer.setSize(_mapDiv.clientWidth, _mapDiv.clientHeight);
        _canvasDiv = _this.renderer.domElement
        _mapDiv.appendChild(_canvasDiv);

        _mapDiv.style.overflow = "hidden";
        _canvasDiv.style.width = "100%";
        _canvasDiv.style.height = "100%";
    }

    //load the map by the json file name
    this.load = function (fileName, callback) {
        var loader = new IndoorMapLoader(_this.is3d);
        loader.load(fileName, function(mall){
            _this.mall = mall;
            _scene.add(_this.mall.root);
            _scene.mall = mall;
            if(callback) {
                callback();
            }
            _this.renderer.setClearColor(_this.mall.theme.background);
            if(_curFloorId == 0){
                _this.showAllFloors();
            }else{
                _this.showFloor(_curFloorId);
            }

        });
    }

    //parse the json file
    this.parse = function(json){
        _this.mall = ParseModel(json, _this.is3d);
        _scene.mall = _this.mall;
        _this.showFloor(_this.mall.getDefaultFloorId());
        _this.renderer.setClearColor(_this.mall.theme.background);
        _scene.add(_this.mall.root);
    }

    //reset the camera to default configuration
    this.setDefaultView = function () {
        _this.camera.position.set(0, 150, 400);//TODO: adjust the position automatically
        _this.camera.lookAt(_scene.position);

        _controls.reset();
        _controls.viewChanged = true;
    }

    //set top view
    this.setTopView = function(){
        _this.camera.position.set(0, 500, 0);
    }

    //TODO:adjust camera to fit the building
    this.adjustCamera = function() {
        _this.setDefaultView();

    }

    this.zoomIn = function(zoomScale){
        _controls.zoomOut(zoomScale);
        redraw();
    }

    this.zoomOut = function(zoomScale){
        _controls.zoomIn(zoomScale);
        redraw();
    }

    //show floor by id
    this.showFloor = function(floorid) {
        if(_scene.mall == null){
            return;
        }
        _curFloorId = floorid;
        _scene.mall.showFloor(floorid);
        _this.adjustCamera();
        if(_showPubPoints) {
            createPubPointSprites(floorid);
        }
        if(_showNames) {
            createNameSprites(floorid);
        }
        redraw();
    }

    //show all floors
    this.showAllFloors = function(){
        _curFloorId = 0; //0 for showing all
        if(_this.mall == null){
            return;
        }
        _this.mall.showAllFloors();
        _this.adjustCamera();
        clearPubPointSprites();
        clearNameSprites();

    }

    //set if the objects are selectable
    this.setSelectable = function (selectable) {
        if(selectable){
            _projector = new THREE.Projector();
            _rayCaster = new THREE.Raycaster();
            _mapDiv.addEventListener('mousedown', onSelectObject, false);
            _mapDiv.addEventListener('touchstart', onSelectObject, false);
        }else{
            _mapDiv.removeEventListener('mousedown', onSelectObject, false);
            _mapDiv.removeEventListener('touchstart', onSelectObject, false);
        }
    }

    //show the labels
    this.showAreaNames = function(show) {
        _showNames = show == undefined ? true : show;
    }

    //show pubPoints(entries, ATM, escalator...)
    this.showPubPoints = function(show){
        _showPubPoints = show == undefined ? true: show;
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
                select(floor.children[i]);
            }
        }
    }

    //select object(just hight light it)
    function select(obj){
        obj.currentHex = _selected.material.color.getHex();
        obj.material.color.setHex(_this.mall.theme.selected);
    }

    function onSelectObject() {

        // find intersections
        event.preventDefault();
        var mouse = new THREE.Vector2();
        if(event.type == "touchstart"){
            mouse.x = ( event.touches[0].clientX / _canvasDiv.clientWidth ) * 2 - 1;
            mouse.y = -( event.touches[0].clientY / _canvasDiv.clientHeight ) * 2 + 1;
        }else {
            mouse.x = ( event.clientX / _canvasDiv.clientWidth ) * 2 - 1;
            mouse.y = -( event.clientY / _canvasDiv.clientHeight ) * 2 + 1;
        }
        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        vector.unproject( _this.camera);

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
                        select(_selected);
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
        redraw();

    }

    function redraw(){
        _controls.viewChanged = true;
    }

    function animate () {
        requestAnimationFrame(animate);
        _controls.update();
        if(_controls.viewChanged) {

            _this.renderer.clear();
            _this.renderer.render(_scene, _this.camera);

            if (_showNames || _showPubPoints) {
                updateLabels();
            }
            _this.renderer.clearDepth();
            _this.renderer.render(_sceneOrtho, _cameraOrtho);

        }

        _controls.viewChanged = false;
    }

    //load Sprites
    function loadSprites(){
        if(_this.mall != null && _spriteMaterials.length == 0){
            var images = _this.mall.theme.pubPointImg;
            for(var key in images){
                var texture = THREE.ImageUtils.loadTexture(images[key], undefined, redraw);
                var material = new THREE.SpriteMaterial({map:texture});
                _spriteMaterials[key] = material;
            }
        }
        _spriteMaterials.isLoaded = true;
    }

    //labels includes pubPoints and shop names
    function updateLabels() {
        var mall = _this.mall;
        if(mall == null || _controls == null || !_controls.viewChanged){
            return;
        }
        var curFloor = mall.getCurFloor();
        if(curFloor == null){
            return;
        }

        var projectMatrix = null;

        if(_showNames) {
            if(_nameSprites != undefined){
                projectMatrix = new THREE.Matrix4();
                projectMatrix.multiplyMatrices(_this.camera.projectionMatrix, _this.camera.matrixWorldInverse);

                updateSprites(_nameSprites, projectMatrix);
            }

        }

        if(_showPubPoints){
            if(_pubPointSprites != undefined){
                if(!projectMatrix){
                    projectMatrix = new THREE.Matrix4();
                    projectMatrix.multiplyMatrices(_this.camera.projectionMatrix, _this.camera.matrixWorldInverse);
                }
                updateSprites(_pubPointSprites, projectMatrix);
            }
        }
        _controls.viewChanged = false;
    };

    //update sprites
    function updateSprites(spritelist, projectMatrix){
        for(var i = 0 ; i < spritelist.children.length; i++){
            var sprite = spritelist.children[i];
            var vec = new THREE.Vector3(sprite.oriX * 0.1, 0, -sprite.oriY * 0.1);
            vec.applyProjection(projectMatrix);

            var x = Math.round(vec.x * _canvasWidthHalf);
            var y = Math.round(vec.y * _canvasHeightHalf);
            sprite.position.set(x, y, 1);

            //check collision with the former sprites
            var visible = true;
            var visibleMargin = 5;
            for(var j = 0; j < i; j++){
                var img = sprite.material.map.image;
                if(!img){ //if img is undefined (the img has not loaded)
                    visible = false;
                    break;
                }

                var imgWidthHalf1 = sprite.width / 2;
                var imgHeightHalf1 = sprite.height / 2;
                var rect1 = new Rect(sprite.position.x - imgWidthHalf1, sprite.position.y - imgHeightHalf1,
                        sprite.position.x + imgHeightHalf1, sprite.position.y + imgHeightHalf1 );

                var sprite2 = spritelist.children[j];
                var sprite2Pos = sprite2.position;
                var imgWidthHalf2 = sprite2.width / 2;
                var imgHeightHalf2 = sprite2.height / 2;
                var rect2 = new Rect(sprite2Pos.x - imgWidthHalf2, sprite2Pos.y - imgHeightHalf2,
                        sprite2Pos.x + imgHeightHalf2, sprite2Pos.y + imgHeightHalf2 );

                if(sprite2.visible && rect1.isCollide(rect2)){
                    visible = false;
                    break;
                }

                rect1.tl[0] -= visibleMargin;
                rect1.tl[1] -= visibleMargin;
                rect2.tl[0] -= visibleMargin;
                rect2.tl[1] -= visibleMargin;


                if(sprite.visible == false && rect1.isCollide(rect2)){
                    visible = false;
                    break;
                }
            }
            sprite.visible = visible;
        }
    }

    //creat the funcArea Name sprites of a floor
    function createNameSprites(floorId){
        if(!_nameSprites){
            _nameSprites = new THREE.Object3D();
        }else{
            clearNameSprites();
        }
        var funcAreaJson = _this.mall.getFloorJson(_this.mall.getCurFloorId()).FuncAreas;
        for(var i = 0 ; i < funcAreaJson.length; i++){
            var sprite = makeTextSprite(funcAreaJson[i].Name, _this.mall.theme.fontStyle);
            sprite.oriX = funcAreaJson[i].Center[0];
            sprite.oriY = funcAreaJson[i].Center[1];
            _nameSprites.add(sprite);
        }
        _sceneOrtho.add(_nameSprites);
    }

    //create the pubpoint sprites in a floor by the floor id
    function createPubPointSprites(floorId){
        if(!_spriteMaterials.isLoaded){
            loadSprites();
        }

        if(!_pubPointSprites) {

            _pubPointSprites = new THREE.Object3D();
        }else{
            clearPubPointSprites();
        }

        var pubPointsJson = _this.mall.getFloorJson(_this.mall.getCurFloorId()).PubPoint;
        var imgWidth, imgHeight;
        for(var i = 0; i < pubPointsJson.length; i++){
            var spriteMat = _spriteMaterials[pubPointsJson[i].Type];
            if(spriteMat !== undefined) {
                imgWidth = 30, imgHeight = 30;
                var sprite = new THREE.Sprite(spriteMat);
                sprite.scale.set(imgWidth, imgHeight, 1);
                sprite.oriX = pubPointsJson[i].Outline[0][0][0];
                sprite.oriY = pubPointsJson[i].Outline[0][0][1];
                sprite.width = imgWidth;
                sprite.height = imgHeight;
                _pubPointSprites.add(sprite);
            }
        }
        _sceneOrtho.add(_pubPointSprites);
    }

    function clearNameSprites(){
        _nameSprites.remove(_nameSprites.children);
        _nameSprites.children.length = 0;
    }
    function clearPubPointSprites(){
        _pubPointSprites.remove(_pubPointSprites.children);
        _pubPointSprites.children.length = 0;
    }

    function makeTextSprite( message, parameters )
    {
        if ( parameters === undefined ) parameters = {};

        var fontface = parameters.hasOwnProperty("fontface") ?
            parameters["fontface"] : "Arial";

        var fontsize = parameters.hasOwnProperty("fontsize") ?
            parameters["fontsize"] : 18;

        var borderThickness = parameters.hasOwnProperty("borderThickness") ?
            parameters["borderThickness"] : 2;

        var borderColor = parameters.hasOwnProperty("borderColor") ?
            parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
            parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

        //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
        //	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

        var spriteAlignment = new THREE.Vector2( 0, 0 );


        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        var metrics = context.measureText( message );
//
//        // background color
//        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
//            + backgroundColor.b + "," + backgroundColor.a + ")";
//        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
            + borderColor.b + "," + borderColor.a + ")";
//
//        context.lineWidth = borderThickness;
//        context.strokeRect(borderThickness/2, borderThickness/2, metrics.width + borderThickness, fontsize * 1.4 + borderThickness);

        // text color
        context.fillStyle = "rgba(0, 0, 0, 1.0)";

        context.fillText( message, borderThickness, fontsize + borderThickness);

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas)
        texture.needsUpdate = true;


        var spriteMaterial = new THREE.SpriteMaterial(
            { map: texture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(100,50,1.0);
        sprite.width = metrics.width;
        sprite.height = fontsize * 1.4;
        return sprite;
    }

    //resize the map
    this.resize = function (width, height){
        _this.camera.aspect = width / height;
        _this.camera.updateProjectionMatrix();

        _this.renderer.setSize( width, height );
        _controls.viewChanged = true;
    }

    _this.init();
    animate();

}