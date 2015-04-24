/**
 * a 2d Canvas renderer for fast rendering
 * Created by gaimeng on 15/2/2.
 */

//---------------------IndoorMap2D class-----------------
IndoorMap2d = function(mapdiv){
    var _this = this;

    var _mapDiv = mapdiv;

    var _controls;
    var _showNames = true, _showPubPoints = true;
    var _curFloorId = 0;
    var _selectionListener = null;
    var _selected, _selectedOldColor;
    this.renderer = null;
    this.is3d = false;
    var _marker;

    this.init = function(){
        _this.renderer = new Canvas2DRenderer(_mapDiv);
        var canvasDiv = _this.renderer.domElement;
        _controls = new Controller2D(canvasDiv);

        //canvas div
//        canvasDiv.style.width = 2000;
//        canvasDiv.style.height = 2000;
//        _this.renderer.setSize(_canvasWidth, _canvasHeight);
        _mapDiv.appendChild(canvasDiv);
        _mapDiv.style.overflow = "hidden";

    }

    this.parse = function(json){
        _this.mall = ParseModel(json, _this.is3d);
        _this.showFloor(_this.mall.getDefaultFloorId());
        _this.renderer.setClearColor(_this.mall.theme.background);
        _mapDiv.style.background = _this.mall.theme.background;
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

    this.zoomIn = function(zoomScale){
        _this.renderer.zoomIn();
        redraw();
    }

    this.zoomOut = function(zoomScale){
        _this.renderer.zoomOut();
        redraw();
    }

    this.showAreaNames = function(show) {
        _showNames = show == undefined ? true : show;
    }

    //show pubPoints(entries, ATM, escalator...)
    this.showPubPoints = function(show){
        _showPubPoints = show == undefined ? true: show;
    }

    //get the selected object
    this.getSelectedId = function(){
        return _selected._id;
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
                    _selected.fillColor = _selectedOldColor;
                }
                select(floor.children[i]);
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

        if(_showNames) {
            _this.renderer.createNameTexts(floorid, _this.mall);
        }

        if(_showPubPoints) {
            _this.renderer.loadSpirtes(_this.mall);
            _this.renderer.loadSpirtes(_this.mall);
        }

        redraw();
    }

    this.setSelectionMarker = function(marker){
        _marker = marker;
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
    }

    //select object(just hight light it)
    function select(obj){
        if(obj != undefined) {
            _selectedOldColor = obj.fillColor;
            obj.fillColor = _this.mall.theme.selected;
            pos = _this.renderer.localToWorld(obj.Center);
            _marker.style.left = pos[0] - _marker.width / 2;
            _marker.style.top = pos[1] - _marker.height / 2;
            _marker.style.visibility = true;
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

        if(pos[0] == _controls.startPoint[0] && pos[1] == _controls.startPoint[1]) {
            pos[0] -= getElementLeft(_mapDiv);
            pos[1] -= getElementTop(_mapDiv);

            //deselect the old one
            if (_selected) {
                _selected.fillColor = _selectedOldColor;
                redraw();
            }

            _selected = _this.renderer.onSelect(pos);

            if (_selected) {
                select(_selected)
                if (_selectionListener) {
                    _selectionListener(_selected._id);
                }
                redraw();
            } else {
                if (_selectionListener) {
                    _selectionListener(-1);
                }
            }

        }
    }

    function redraw(){
        _controls.viewChanged = true;
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

    var _canvas = document.createElement('canvas');
    var _parentDiv = mapDiv,
        _parentWidth = parseInt(_parentDiv.style.width),
        _parentHeight = parseInt(_parentDiv.style.height);

    var _canvasPos = [0, 0];
    var _this = this,
        _canvasWidth,
        _canvasHeight,
        _canvasWidthHalf,
        _canvasHeightHalf,
        _padding = 50,

        _centerX = 0,
        _centerY = 0,
        _oldId = 0,

        _clearColor,
        _showNames = true,
        _nameTexts = [],
        _sprites = [],
        _pubPoints = [],
        _showPubPoints = true,
    _ctx = _canvas.getContext('2d'),
    _clearColor,
    _scale,
    left,
    top;
    var _curFloor = null;

    this.domElement = _canvas;
    //var _devicePixelRatio = window.devicePixelRatio;

    var _devicePixelRatio = 1;
    this.setDefaultView = function(object){
        if(object._id != _oldId) {
            var width = object.rect.br[0] - object.rect.tl[0];
            var height = object.rect.br[1] - object.rect.tl[1];
            var scaleX = (_parentWidth - _padding) / width;
            var scaleY = (_parentHeight - _padding) / height;
            _scale = scaleX < scaleY ? scaleX : scaleY;
            _scale *= _devicePixelRatio;
            _centerX = (object.rect.br[0] + object.rect.tl[0])/2;
            _centerY = (-object.rect.br[1] - object.rect.tl[1])/2;
            _canvas.style.position = "absolute";

            left =  -_canvasWidthHalf/_devicePixelRatio +(_parentWidth/2) ;
            _canvas.style.left = left + "px";
            top =  -_canvasHeightHalf/_devicePixelRatio +(_parentHeight/2) ;
            _canvas.style.top = top + "px";

        }
    }
    this.render = function (mall){
        if(mall === undefined) {
            return;
        }

        //get render data
        _curFloor = mall.getCurFloor();

        _ctx.fillStyle = _clearColor;
        _ctx.fillRect(0,0,_canvasWidth, _canvasHeight);

        _ctx.save();
        _ctx.scale(_scale, _scale);
        _ctx.translate(_canvasWidthHalf/_scale-_centerX, _canvasHeightHalf/_scale - _centerY);

        var poly = _curFloor.Outline[0][0];
        _ctx.beginPath();
        _ctx.moveTo(poly[0], -poly[1]);
        for(var i = 2; i < poly.length - 1; i+=2){
            _ctx.lineTo(poly[i],-poly[i+1]);
        }
        _ctx.closePath();
        _ctx.strokeStyle = _curFloor.strokeColor;
        _ctx.lineWidth = (2*_devicePixelRatio/_scale) >> 0;
        _ctx.stroke();
        _ctx.fillStyle = _curFloor.fillColor;
        _ctx.fill();

        var funcAreas = _curFloor.FuncAreas;
        _ctx.strokeStyle = mall.theme.strokeStyle.color;
        _ctx.lineWidth = (mall.theme.strokeStyle.linewidth * _devicePixelRatio/ _scale) >> 0;
        for(var i = 0 ; i < funcAreas.length; i++){
            var funcArea = funcAreas[i];
            var poly = funcArea.Outline[0][0];
            if(poly.length < 6){ //less than 3 points, return
                return;
            }
            _ctx.beginPath();

            _ctx.moveTo(poly[0], -poly[1]);
            for(var j = 2; j < poly.length - 1; j+=2){
                _ctx.lineTo(poly[j],-poly[j+1]);
            }
            _ctx.closePath();


            _ctx.stroke();

            _ctx.fillStyle = funcArea.fillColor;
            _ctx.fill();
        }

        _ctx.restore();

        if(_showNames){

            _ctx.textBaseline="middle";
            _ctx.fillStyle = mall.theme.fontStyle.color;
            var textRects = [];
            for(var i = 0 ; i < funcAreas.length; i++){
                var nameText = _nameTexts[i];

//                if(nameText.text == undefined){
//                    nameText.visible = false;
//                    continue;
//                }

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

        if(_showPubPoints){
            var pubPoints = _curFloor.PubPoint;
            var imgWidth = 25 * _devicePixelRatio, imgHeight = 25 *_devicePixelRatio;
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

    this.localToWorld = function(pt){
        var worldPoint = [0,0];
        worldPoint[0] = _canvasWidthHalf + (pt[0] - _centerX) * _scale;
        worldPoint[1] = _canvasHeightHalf + (-pt[1] - _centerY) * _scale;
        return worldPoint;
    }

    this.onSelect = function(point){

//        _canvasPos[0] = (-_parentWidth/2 + point[0])/_scale + _centerX;
//        _canvasPos[1] = -(_parentHeight/2 - point[1])/_scale + _centerY;


        _canvasPos[0] = (-_parentWidth/2 + point[0] + _canvasWidthHalf/_devicePixelRatio - (parseInt(_canvas.style.left) - left))*_devicePixelRatio;
        _canvasPos[1] = (-_parentHeight/2 + point[1] + _canvasHeightHalf/_devicePixelRatio - (parseInt(_canvas.style.top) - top))*_devicePixelRatio;
        return hitTest(_canvasPos);
    }

    this.setClearColor = function(color){
        _clearColor = color;

    }

    this.zoomIn = function(zoomScale){
        if(zoomScale === undefined){
            zoomScale = 0.8;
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
        _canvasWidthHalf = Math.floor(_canvasWidth / 2);
        _canvasHeightHalf = Math.floor(_canvasHeight / 2);
    }

    function hitTest(point){
        _ctx.save();
        _ctx.scale(_scale, _scale);
        _ctx.translate(_canvasWidthHalf/_scale-_centerX, _canvasHeightHalf/_scale - _centerY);

        for(var i = 0 ; i < _curFloor.FuncAreas.length; i++) {
            var funcArea = _curFloor.FuncAreas[i];
            if(funcArea.Category == undefined && funcArea.Type == 100){ //hollow area
                continue;
            }

            var poly = funcArea.Outline[0][0];
            if (poly.length < 6) { //less than 3 points, return
                return;
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
        _ctx.font =  "bold "+ fontStyle.fontsize * _devicePixelRatio + "px " + fontStyle.fontface;
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
                name.halfHeight = fontStyle.fontsize * _devicePixelRatio / 4;
                name.visible = true;
            }

            _nameTexts.push(name);
        }
    }


    _this.setSize(2000*_devicePixelRatio, 2000*_devicePixelRatio);
}

//---------------------Controller2D class-----------------

Controller2D = function(domElement){
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    this.viewChanged = true;

    var _top, _left;
    var _curTop, _curLeft;

    var _this = this;

    this.startPoint = [0, 0];
    this.endPoint = [0, 0];

    this.reset = function(){
        _this.startPoint = [0,0];
        _this.endPoint = [0,0];
    }
    function touchStart(event){
        _this.startPoint[0] = event.touches[0].clientX;
        _this.startPoint[1] = event.touches[0].clientY;

        document.addEventListener('touchend', touchEnd, false);
        document.addEventListener('touchmove', touchMove, false);

        _top = parseInt(domElement.style.top);
        _left = parseInt(domElement.style.left);

    }

    function mouseDown(event){
        _this.startPoint[0] = event.clientX;
        _this.startPoint[1] = event.clientY;

        document.addEventListener('mouseup', mouseUp, false);
        document.addEventListener('mousemove', mouseMove, false);

        _top = parseInt(domElement.style.top);
        _left = parseInt(domElement.style.left);

    }

    function touchMove(event){
        event.preventDefault();
        event.stopPropagation();

        _this.endPoint[0] = event.touches[0].clientX;
        _this.endPoint[1] = event.touches[0].clientY;

        var subVector = [_this.endPoint[0]-_this.startPoint[0], _this.endPoint[1]-_this.startPoint[1]];

        _curLeft = (_left + subVector[0]);
        _curTop = (_top + subVector[1]);

        domElement.style.left =  _curLeft + "px";
        domElement.style.top =  _curTop + "px";

    }

    function mouseMove(event){
        event.preventDefault();
        event.stopPropagation();

        _this.endPoint[0] = event.clientX;
        _this.endPoint[1] = event.clientY;

        var subVector = [_this.endPoint[0]-_this.startPoint[0], _this.endPoint[1]-_this.startPoint[1]];

        _curLeft = (_left + subVector[0]);
        _curTop = (_top + subVector[1]);
        domElement.style.left = _curLeft + "px";
        domElement.style.top = _curTop + "px";

    }

    function touchEnd(event){
        document.removeEventListener('touchend', touchEnd, false);
        document.removeEventListener('touchmove', touchMove, false);
    }

    function mouseUp(event){
        document.removeEventListener('mouseup', mouseUp, false);
        document.removeEventListener('mousemove', mouseMove, false);
    }

    this.domElement.addEventListener('touchstart', touchStart, false);
    this.domElement.addEventListener('mousedown', mouseDown, false);


}