/**
 * a 2d Canvas renderer for fast rendering
 * Created by gaimeng on 15/2/2.
 */

//---------------------IndoorMap2D class-----------------
IndoorMap2d = function(mapdiv){
    var _this = this;
    var _mapDiv = mapdiv;
    var _controls;
    var _theme;

    var _curFloorId = 0;
    var _selectionListener = null;
    var _selected, _selectedOldColor;
    var _options = {
        showNames : true,
        showPubPoints : true
    }

    this.renderer = null;
    this.is3d = false;
    //var _marker;

    this.init = function(){
        _this.renderer = new Canvas2DRenderer(_mapDiv);
        _this.renderer.setOptions(_options);
        var canvasDiv = _this.renderer.domElement;
        _controls = new Controller2D(canvasDiv);

        //canvas div
//        canvasDiv.style.width = 2000;
//        canvasDiv.style.height = 2000;
//        _this.renderer.setSize(_canvasWidth, _canvasHeight);
        _mapDiv.appendChild(canvasDiv);
        _mapDiv.style.overflow = "hidden";

    }

    this.reset = function(){
        _controls.reset();
        _this.renderer.reset();
    }

    this.setTheme = function(theme){
        _theme = theme;
        return this;
    }

    this.theme = function(){
        return _theme;
    }

    this.getMall = function(){
        return _this.mall;
    }

    this.parse = function(json){
        _this.reset();
        _this.mall = ParseModel(json, _this.is3d);
        _this.showFloor(_this.mall.getDefaultFloorId());
        _this.renderer.setClearColor(_this.mall.theme.background);
        _mapDiv.style.background = _this.mall.theme.background;
        return _this;
    }

    //reset the camera to default configuration
    this.setDefaultView = function () {
        _this.renderer.setDefaultView(_this.mall.getCurFloor());

        _controls.reset();
        _controls.viewChanged = true;
    }

    //TODO:adjust camera to fit the building
    this.adjustCamera = function() {
        _this.setDefaultView();

    }

    this.translate = function(vec){
        var canvasDiv = _this.renderer.domElement;

        var top = parseInt(canvasDiv.style.top);
        var left = parseInt(canvasDiv.style.left);
        var curLeft = (left + vec[0]),
            curTop = (top + subVector[1]);
        canvasDiv.style.left = curLeft + "px";
        canvasDiv.style.top = curTop + "px";
    }

    this.fit = function(obj){

    }
    this.zoomIn = function(zoomScale){
        _this.renderer.zoomIn();
        redraw();
    }

    this.zoomOut = function(zoomScale){
        _this.renderer.zoomOut();
        redraw();
    }

    this.showAreaNames = function(show) {
        _options.showNames = show == undefined ? true : show;
        _this.renderer.setOptions(_options);
        return _this;
    }

    //show pubPoints(entries, ATM, escalator...)
    this.showPubPoints = function(show){
        _options.showPubPoints = show == undefined ? true: show;
        _this.renderer.setOptions(_options);
        return _this;
    }

    //get the selected object
    this.getSelectedId = function(){
        var id = _selected.BrandShop;
        return id ? id : -1;
    }

    //the callback function when sth is selected
    this.setSelectionListener = function(callback){
        _selectionListener = callback;
        return _this;
    }

    //select object by id
    this.selectById = function(id){
        var floor = _this.mall.getCurFloor();
        for(var i = 0; i < floor.FuncAreas.length; i++){
            if(floor.FuncAreas[i].BrandShop && floor.FuncAreas[i].BrandShop == id) {
                _this.deselectAll();
                _this.select(floor.FuncAreas[i]);
            }
        }
    }

    //show floor by id
    this.showFloor = function(floorid) {
        if(_this.mall == null){
            return;
        }
        _curFloorId = floorid;
        _this.mall.showFloor(floorid);
        _this.adjustCamera();

        if(_options.showNames) {
            _this.renderer.createNameTexts(floorid, _this.mall);
        }

        if(_options.showPubPoints) {
            _this.renderer.loadSpirtes(_this.mall);
            _this.renderer.loadSpirtes(_this.mall);
        }

        redraw();
        return _this;
    }

    this.setSelectionMarker = function(marker){
        //_marker = marker;
    }

    //set if the objects are selectable
    this.setSelectable = function (selectable) {
        if(selectable){
            _mapDiv.addEventListener('mouseup', onSelectObject, false);
            _mapDiv.addEventListener('touchend', onSelectObject, false);
        }else{
            _mapDiv.removeEventListener('mouseup', onSelectObject, false);
            _mapDiv.removeEventListener('touchend', onSelectObject, false);
        }
        return _this;
    }

    //se if the user can pan the camera
    this.setMovable = function(movable){
        _controls.enable = movable;
        return _this;
    }

    //focus
    this.focus = function (obj){
        _this.renderer.focus(obj);
    }

    this.deselectAll = function(){
        if (_selected) {
            _selected.fillColor = _selectedOldColor;
            redraw();
        }
    }

    //select object(just hight light it)
    this.select = function(obj){
        if(obj != undefined) {
            //_this.focus(obj);
            _selectedOldColor = obj.fillColor;
            obj.fillColor = _this.mall.theme.selected;
            pos = _this.renderer.localToWorld(obj.Center);
            _selected = obj;
            redraw();

//            _marker.style.left = pos[0] - _marker.width / 2;
//            _marker.style.top = pos[1] - _marker.height / 2;
//            _marker.style.visibility = true;
        }
    }

    function onSelectObject(event){
        event.preventDefault();
        var pos = [0,0]
        if(event.type == "touchend"){
            pos[0] = event.changedTouches[0].clientX;
            pos[1] = event.changedTouches[0].clientY;
        }else {
            pos[0] = event.clientX;
            pos[1] = event.clientY;
        }

        if(Math.abs(pos[0] - _controls.startPoint[0]) < 5 && Math.abs(pos[1] == _controls.startPoint[1]) <5) {
            pos[0] -= getElementLeft(_mapDiv);
            pos[1] -= getElementTop(_mapDiv);

            //deselect the old one
            _this.deselectAll();

            _selected = _this.renderer.onSelect(pos);

            if (_selected) {
                _this.select(_selected)
                console.log(_this.getSelectedId());
                if (_selectionListener) {
                    _selectionListener(_this.getSelectedId());
                }

            } else {
                if (_selectionListener) {
                    _selectionListener(-1);
                }
            }

        }
    }

    function redraw(){
        _this.renderer.render(_this.mall);
    }

    function animate () {
        requestAnimationFrame(animate);
        //_controls.update();
        if(_controls.viewChanged) {
            _this.renderer.render(_this.mall);
            _controls.viewChanged = false;
        }


    }

    _this.init();
    animate();
}

//---------------------the Sprite class------------------
function CanvasSprite(params){
    var _this = this,
        _ctx = params.ctx,
        _width = params.width,
        _height = params.height,
        _offsetX = 0,
        _offsetY = 0,
        _visible = true,

        _img = new Image();
    _img.src = params.image;

    this.draw = function(x, y){
        if(_visible){
            _ctx.drawImage(_img,_offsetX, _offsetY, _width, _height, x >> 0, y >> 0, _width, _height);
        }
    }

    this.show = function(){
        _visible = true;
    }

    this.hide = function(){
        _visible = false;
    }
}

Canvas2DRenderer = function (mapDiv) {

    var _this = this;
    var _canvas = document.createElement('canvas');

    //div size
    var _parentDiv = mapDiv,
        _parentWidth = parseInt(_parentDiv.style.width),
        _parentHeight = parseInt(_parentDiv.style.height),
        _parentHalfWidth = _parentWidth / 2,
        _parentHalfHeight = _parentHeight / 2,
        _padding = 63;  //padding between map bounding box and the div boundary

    var _floorWidth,
        _floorHeight;

    //canvas real size
    var _canvasPos = [0, 0],
        _canvasWidth,
        _canvasHeight,
        _canvasHalfWidth,
        _canvasHalfHeight,
        _oldId = 0,

        _clearColor,
        _nameTexts = [],
        _sprites = [],
        _pubPoints = [],

    _ctx = _canvas.getContext('2d'),
    _clearColor,
    _scale,
    left,
    top;
    var _curFloor = null;
    var _objSize = [0,0];
    var MAX_CANVAS_SIZE = 2000;
    var _options;

    this.domElement = _canvas;
    this.mapCenter = [];
    //var _devicePixelRatio = window.devicePixelRatio;
    var _devicePixelRatio = 1;
    this.setDefaultView = function(object){
        if(object._id != _oldId) {
            _floorWidth = object.rect.br[0] - object.rect.tl[0];
            _floorHeight = object.rect.br[1] - object.rect.tl[1];
            var scaleX = (_parentWidth - _padding) / _floorWidth;
            var scaleY = (_parentHeight - _padding) / _floorHeight;
            _objSize[0] = _floorWidth;
            _objSize[1] = _floorHeight;
            _scale = scaleX < scaleY ? scaleX : scaleY;
            //_scale *= _devicePixelRatio;
            _this.mapCenter[0] = (object.rect.br[0] + object.rect.tl[0])/2;
            _this.mapCenter[1] = (-object.rect.br[1] - object.rect.tl[1])/2;
            _canvas.style.position = "absolute";

            left =  -_canvasHalfWidth +(_parentWidth/2) ;
            _canvas.style.left = left + "px";
            top =  -_canvasHalfHeight +(_parentHeight/2) ;
            _canvas.style.top = top + "px";

        }
    }

    this.reset = function(){
        _nameTexts.length = 0;

    }

    this.focus = function (object) {
        //if(object._id != _oldId) {

        var width = object.rect.br[0] - object.rect.tl[0];
        var height = object.rect.br[1] - object.rect.tl[1];
        var ratio = (width+height) / (_floorWidth+_floorHeight);
        //var padding = ratio > 0.005? _parentWidth * 0.5 : _parentWidth * 0.85;

        var padding = (-1.42*ratio + 0.9) * _parentWidth;
        padding < _parentHalfWidth? padding = _parentHalfWidth : padding;
        var scaleX = (_parentWidth - padding) / width;
        var scaleY = (_parentHeight - padding) / height;
        _objSize[0] = width;
        _objSize[1] = height;
        _scale = scaleX < scaleY ? scaleX : scaleY;

        //_scale > 0.5 ? _scale = 0.5 : _scale;

        var center = [];
        center[0] = (object.rect.br[0] + object.rect.tl[0]) / 2;
        center[1] = (object.rect.br[1] + object.rect.tl[1]) / 2;
        center = _this.localToWorld(center);
        _canvas.style.position = "absolute";

        _canvas.style.left = (_parentHalfWidth - center[0]) + "px";
        _canvas.style.top = (_parentHalfHeight - center[1]) + "px";

        //}
    }

    this.screenShot = function(type){
        var tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = _parentWidth, tmpCanvas.height = _parentHeight;

        var tmpCtx = tmpCanvas.getContext('2d');
        tmpCtx.drawImage(_canvas,parseInt(_canvas.style.left),parseInt(_canvas.style.top));
        return tmpCanvas.toDataURL(type);
    }

    this.setOptions = function(options){
        _options = options;
    }
    this.render = function (mall){
        if(mall === undefined) {
            return;
        }

        var theme = mall.theme;

        //get render data
        _curFloor = mall.getCurFloor();

        _ctx.fillStyle = _clearColor;
        _ctx.fillRect(0,0,_canvasWidth, _canvasHeight);

        _ctx.save();
        _ctx.scale(_scale, _scale);
        _ctx.translate(_canvasHalfWidth/_scale-_this.mapCenter[0], _canvasHalfHeight/_scale - _this.mapCenter[1]);

        var poly = _curFloor.Outline[0][0];
        _ctx.beginPath();
        _ctx.moveTo(poly[0], -poly[1]);
        for(var i = 2; i < poly.length - 1; i+=2){
            _ctx.lineTo(poly[i],-poly[i+1]);
        }
        _ctx.closePath();
        _ctx.strokeStyle = _curFloor.strokeColor;
        _ctx.lineWidth = theme.strokeStyle.linewidth/_scale;
        _ctx.stroke();
        _ctx.fillStyle = _curFloor.fillColor;
        _ctx.fill();

        var funcAreas = _curFloor.FuncAreas;
        _ctx.strokeStyle = theme.strokeStyle.color;
        _ctx.lineWidth = theme.strokeStyle.linewidth/_scale;
        for(var i = 0 ; i < funcAreas.length; i++){
            var funcArea = funcAreas[i];
            var poly = funcArea.Outline[0][0];
            if(poly.length < 6){ //less than 3 points, return
                continue;
            }
            _ctx.beginPath();

            _ctx.moveTo(poly[0], -poly[1]);
            for(var j = 2; j < poly.length - 1; j+=2){
                _ctx.lineTo(poly[j],-poly[j+1]);
            }
            _ctx.closePath();

            _ctx.strokeStyle = theme.strokeStyle.color;
            _ctx.stroke();

            _ctx.fillStyle = funcArea.fillColor;
            _ctx.fill();
        }

        _ctx.restore();

        if(_options.showNames){

            _ctx.textBaseline="middle";
            _ctx.fillStyle = theme.fontStyle.color;
            var textRects = [];
            for(var i = 0 ; i < funcAreas.length; i++){
                var nameText = _nameTexts[i];

                var center = funcAreas[i].Center;
                center = _this.localToWorld(center);

                var rect = new Rect(center[0] - nameText.halfWidth, center[1] - nameText.halfHeight, center[0] + nameText.halfWidth, center[1] + nameText.halfHeight);
                textRects.push(rect);

                nameText.visible = true;

                for(var j = 0; j < i; j++){
                    if(_nameTexts[j].visible && textRects[j].isCollide(rect)){
                        nameText.visible = false;
                        break;
                    }
                }
                if(nameText.visible) {
                    _ctx.fillText(nameText.text, (center[0] - nameText.halfWidth) >> 0, (center[1]) >> 0);
//                _ctx.beginPath();
//                _ctx.arc(center[0], center[1], 3, 0, Math.PI * 2, true);
//                _ctx.closePath();
//
//                _ctx.fill();
//                    _ctx.strokeRect(rect.tl[0], rect.tl[1], rect.br[0] - rect.tl[0], rect.br[1] - rect.tl[1]);
                }
            }
        }

        if(_options.showPubPoints){
            var pubPoints = _curFloor.PubPoint;
            var imgWidth = 20 , imgHeight = 20 ;
//            if(_scale < 0.1){
//                imgWidth = imgHeight = 12;
//            }

            var imgWidthHalf = imgWidth/2, imgHeightHalf = imgHeight/2;
            var pubPointRects = [];
            for(var i = 0; i < pubPoints.length; i++){
                var pubPoint = pubPoints[i];
                var center = pubPoint.Outline[0][0];
                center = _this.localToWorld(center);
                var rect = new Rect(center[0] - imgWidthHalf, center[1] - imgHeightHalf, center[0] + imgWidthHalf, center[1] + imgHeightHalf);
                pubPointRects.push(rect);

                pubPoint.visible = true;
                for(var j = 0; j < i; j++){
                    if(pubPoints[j].visible && pubPointRects[j].isCollide(rect)){
                        pubPoint.visible = false;
                        break;
                    }
                }
                if(pubPoint.visible) {
                    var image = _sprites[pubPoints[i].Type];
                    if (image !== undefined) {
                        _ctx.drawImage(image, (center[0] - imgWidthHalf) >> 0, (center[1] - imgHeightHalf) >> 0, imgWidth, imgHeight);
                    }
                }
            }
        }
//        //test: render the clicked point
//        _ctx.fillStyle='#FF0000';
//        _ctx.beginPath();
//        _ctx.arc(_canvasPos[0], _canvasPos[1], 2, 0, Math.PI * 2, true);
//        _ctx.closePath();
//        _ctx.fill();


    }

    //map the coordinate in canvas to the screen
    this.localToWorld = function(pt){
        var worldPoint = [0,0];
        worldPoint[0] = _canvasHalfWidth + (pt[0] - _this.mapCenter[0]) * _scale;
        worldPoint[1] = _canvasHalfHeight + (-pt[1] - _this.mapCenter[1]) * _scale;
        return worldPoint;
    }

    this.onSelect = function(point){

//        _canvasPos[0] = (-_parentWidth/2 + point[0])/_scale + _centerX;
//        _canvasPos[1] = -(_parentHeight/2 - point[1])/_scale + _centerY;


        _canvasPos[0] = (-_parentWidth/2 + point[0] + _canvasHalfWidth - (parseInt(_canvas.style.left) - left)) >> 0;
        _canvasPos[1] = (-_parentHeight/2 + point[1] + _canvasHalfHeight - (parseInt(_canvas.style.top) - top)) >> 0;
        return hitTest(_canvasPos);
    }

    this.setClearColor = function(color){
        _clearColor = color;

    }

    this.zoomIn = function(zoomScale){
        if(zoomScale === undefined){
            zoomScale = 0.8;
        }
        if(exceed(_scale/zoomScale)){
            return;
        }
        _scale /= zoomScale;
    }

    this.zoomOut = function(zoomScale){
        if(zoomScale === undefined){
            zoomScale = 0.8;
        }
        _scale *= zoomScale;
    }

    this.setSize = function(width, height) {
        _canvas.style.width = width + "px";
        _canvas.style.height = height + "px";
        _canvasWidth = width * _devicePixelRatio;
        _canvasHeight = height * _devicePixelRatio;
        _canvas.width = _canvasWidth;
        _canvas.height = _canvasHeight;
        _canvasHalfWidth = Math.floor(width / 2);
        _canvasHalfHeight = Math.floor(height / 2);
        _ctx.scale(_devicePixelRatio, _devicePixelRatio);
    }

    function exceed(scale){
        var curWidth = _objSize[0] * scale;
        var curHeight = _objSize[1] * scale;
        var maxSize = MAX_CANVAS_SIZE * _devicePixelRatio;
        if(curWidth > maxSize || curHeight > maxSize){
            return true;
        }else{
            return false;
        }
    }

    function hitTest(point){
        _ctx.save();
        _ctx.scale(_scale, _scale);
        _ctx.translate(_canvasHalfWidth/_scale-_this.mapCenter[0], _canvasHalfHeight/_scale - _this.mapCenter[1]);

        for(var i = 0 ; i < _curFloor.FuncAreas.length; i++) {
            var funcArea = _curFloor.FuncAreas[i];
            if(funcArea.Category == undefined && funcArea.Type == 100){ //hollow area
                continue;
            }

            var poly = funcArea.Outline[0][0];
            if (poly.length < 6) { //less than 3 points, return
                continue;
            }
            _ctx.beginPath();

            _ctx.moveTo(poly[0], -poly[1]);
            for (var j = 2; j < poly.length - 1; j += 2) {
                _ctx.lineTo(poly[j], -poly[j + 1]);
            }
            _ctx.closePath();

            if (_ctx.isPointInPath(point[0], point[1])) {
                _ctx.restore();
                return funcArea;
            }
        }
        _ctx.restore();

        return null;
    }

    this.loadSpirtes = function(mall){
        if(mall != null && _sprites.length == 0 ){
            var images = mall.theme.pubPointImg;
            for( var key in images){
                var loader = new THREE.ImageLoader();

                var image = loader.load( images[key], function(image){
                    _this.render(mall);
                })

                _sprites[key] = image;
            }
        }
        _sprites.isLoaded = true;
    }

    this.createNameTexts = function(floorId, mall){
        if(_nameTexts.length != 0){
            _nameTexts.length = 0;
        }
        var funcAreaJson = mall.getFloorJson(mall.getCurFloorId()).FuncAreas;
        var fontStyle = mall.theme.fontStyle;
        _ctx.font =  "bold "+ fontStyle.fontsize + "px " + fontStyle.fontface;
        for(var i = 0 ; i < funcAreaJson.length; i++){
            var name = {};
            var funcArea = funcAreaJson[i];
            if(funcArea.Category == undefined && ((funcArea.Type == "100") || (funcArea.Type == 300))){
                name.text = "";
                name.halfWidth = 0;
                name.halfHeight = 0;
                name.visible = false;
            }else {
                name.text = funcAreaJson[i].Name;
                name.halfWidth = _ctx.measureText(name.text).width / 2;
                name.halfHeight = fontStyle.fontsize  / 4;
                name.visible = true;
            }

            _nameTexts.push(name);
        }
    }

    _this.setSize(MAX_CANVAS_SIZE, MAX_CANVAS_SIZE);
}

//---------------------Controller2D class-----------------

Controller2D = function(domElement){
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    this.viewChanged = true;
    this.enable = true;

    var _top, _left;
    var _curTop, _curLeft;

    var _this = this;

    this.startPoint = [0, 0];
    this.endPoint = [0, 0];

    this.reset = function(){
        _this.startPoint = [0,0];
        _this.endPoint = [0,0];
    }

    this.translate = function(vec){
        _curLeft = (_left + vec[0]);
        _curTop = (_top + vec[1]);
        domElement.style.left = _curLeft + "px";
        domElement.style.top = _curTop + "px";
    }

    function touchStart(event){

        event.preventDefault();

        var touches = event.touches;
        if(touches.length == 1){
            _this.startPoint[0] = touches[0].clientX;
            _this.startPoint[1] = touches[0].clientY;
        }
//        else if( touches.length == 2){
//            _this.startPoint[0] = touches[1].clientX - touches[0].clientX;
//            _this.startPoint[1] = touches[1].clientY - touches[0].clientY;
//        }
        else{
            return;
        }
        if(_this.enable === false) return;

        document.addEventListener('touchend', touchEnd, false);
        document.addEventListener('touchmove', touchMove, false);

        _top = parseInt(domElement.style.top);
        _left = parseInt(domElement.style.left);

    }

    function mouseDown(event){

        event.preventDefault();
        _this.startPoint[0] = event.clientX;
        _this.startPoint[1] = event.clientY;

        if(_this.enable === false) return;

        document.addEventListener('mouseup', mouseUp, false);
        document.addEventListener('mousemove', mouseMove, false);

        _top = parseInt(domElement.style.top);
        _left = parseInt(domElement.style.left);

    }

    function touchMove(event){
        if(_this.enable === false) return;
        event.preventDefault();
        event.stopPropagation();

        var touches = event.touches;
        if(touches.length == 1) {
            _this.endPoint[0] = touches[0].clientX;
            _this.endPoint[1] = touches[0].clientY;
        }else {
            return;
        }

        var subVector = [_this.endPoint[0]-_this.startPoint[0], _this.endPoint[1]-_this.startPoint[1]];
        _this.translate(subVector);

    }

    function mouseMove(event){
        if(_this.enable === false) return;
        event.preventDefault();
        event.stopPropagation();

        _this.endPoint[0] = event.clientX;
        _this.endPoint[1] = event.clientY;

        var subVector = [_this.endPoint[0]-_this.startPoint[0], _this.endPoint[1]-_this.startPoint[1]];

        _this.translate(subVector);

    }

    function touchEnd(event){
        if(_this.enable === false) return;
        document.removeEventListener('touchend', touchEnd, false);
        document.removeEventListener('touchmove', touchMove, false);
    }

    function mouseUp(event){
        if(_this.enable === false) return;
        document.removeEventListener('mouseup', mouseUp, false);
        document.removeEventListener('mousemove', mouseMove, false);
    }

    this.domElement.addEventListener('touchstart', touchStart, false);
    this.domElement.addEventListener('mousedown', mouseDown, false);


}