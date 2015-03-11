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
    var _selected;
    this.renderer = null;
    this.is3d = false;

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

    //show floor by id
    this.showFloor = function(floorid) {
        if(_this.mall == null){
            return;
        }
        _curFloorId = floorid;
        _this.mall.showFloor(floorid);
        _this.adjustCamera();
        if(_showPubPoints) {
            //createPubPointSprites(floorid);
        }
        if(_showNames) {
            //createNameSprites(floorid);
        }
        redraw();
    }

    //select object(just hight light it)
    function select(obj){

    }

    //set if the objects are selectable
    this.setSelectable = function (selectable) {
        if(selectable){
            _mapDiv.addEventListener('mousedown', onSelectObject, false);
            _mapDiv.addEventListener('touchstart', onSelectObject, false);
        }else{
            _mapDiv.removeEventListener('mousedown', onSelectObject, false);
            _mapDiv.removeEventListener('touchstart', onSelectObject, false);
        }
    }

    function onSelectObject(){

    }


    function redraw(){
        _controls.viewChanged = true;
    }

    function animate () {
        requestAnimationFrame(animate);
        //_controls.update();
        if(_controls.viewChanged) {
            _this.renderer.render(_this.mall, _this.camera);
        }

        _controls.viewChanged = false;
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


    var _this = this,
        _canvasWidth,
        _canvasHeight,
        _canvasWidthHalf,
        _canvasHeightHalf,
        _padding = 30,

        _centerX = 0,
        _centerY = 0,
        _oldId = 0,

        _clearColor,
        _showNames = true,
        _showPubPoints = true,
    _ctx = _canvas.getContext('2d'),
    _clearColor,
    _scale;

    this.domElement = _canvas;
    this.setDefaultView = function(object){
        if(object._id != _oldId) {
            var width = object.rect.br[0] - object.rect.tl[0];
            var height = object.rect.br[1] - object.rect.tl[1];
            var scaleX = _parentWidth / (width+_padding);
            var scaleY = _parentHeight / (height+_padding);
            _scale = scaleX < scaleY ? scaleX : scaleY;
            _centerX = (object.rect.br[0] + object.rect.tl[0])/2;
            _centerY = (object.rect.br[1] + object.rect.tl[1])/2;
            _canvas.style.position = "absolute";
            _canvas.style.left = -(_canvasWidth - parseInt(_parentDiv.style.width))/2 + "px";
            _canvas.style.top = -(_canvasHeight - parseInt(_parentDiv.style.height))/2 + "px";


            _canvas.style.left = -_canvasWidthHalf +(_parentWidth/2 - _centerX*_scale) + "px";
            _canvas.style.top = -_canvasHeightHalf +(_parentHeight/2 - _centerY*_scale) + "px";

        }
    }
    this.render = function (mall, camera){
        if(mall === undefined) {
            return;
        }

        //get render data
        var curFloor = mall.getCurFloor();

        _ctx.save();
        _ctx.fillStyle = _clearColor;
        _ctx.fillRect(0,0,_canvasWidth, _canvasHeight);
        _ctx.scale(_scale, _scale);
        _ctx.translate(_canvasWidthHalf/_scale-_centerX, _canvasHeightHalf/_scale - _centerY);
       // _ctx.scale(_scale, _scale);


        var poly = curFloor.Outline[0][0];
        _ctx.beginPath();
        _ctx.moveTo(poly[0], poly[1]);
        for(var i = 2; i < poly.length - 1; i+=2){
            _ctx.lineTo(poly[i],poly[i+1]);
        }
        _ctx.closePath();
        _ctx.strokeStyle = curFloor.strokeColor;
        _ctx.lineWidth = 1;
        _ctx.stroke();
        _ctx.fillStyle = curFloor.fillColor;
        _ctx.fill();


        for(var i = 0 ; i < curFloor.FuncAreas.length; i++){
            var funcArea = curFloor.FuncAreas[i];
            var poly = funcArea.Outline[0][0];
            if(poly.length < 6){ //less than 3 points, return
                return;
            }
            _ctx.beginPath();

            _ctx.moveTo(poly[0], poly[1]);
            for(var j = 2; j < poly.length - 1; j+=2){
                _ctx.lineTo(poly[j],poly[j+1]);
            }
            _ctx.closePath();
            _ctx.strokeStyle = funcArea.strokeColor;
            _ctx.lineWidth = 1;
            _ctx.stroke();


            _ctx.fillStyle = funcArea.fillColor;
            _ctx.fill();

            if(_showNames){//draw shop names

            }
        }
        _ctx.restore();


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
        _canvasWidth = width;
        _canvasHeight = height;
        _canvas.width = _canvasWidth;
        _canvas.height = _canvasHeight;
        _canvasWidthHalf = Math.floor(_canvasWidth / 2);
        _canvasHeightHalf = Math.floor(_canvasHeight / 2);
    }

    _this.setSize(2000, 2000);
}


Controller2D = function(domElement){
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    this.viewChanged = true;

    var _top, _left;

    var _clickPoint=[0,0],
        _panStart = [0,0],
        _panEnd = [0,0],
        _this = this

    this.reset = function(){
        _panStart = [0,0];
        _panEnd = [0,0];
    }
    function touchStart(event){
        _panStart[0] = event.touches[0].clientX;
        _panStart[1] = event.touches[0].clientY;

        document.addEventListener('touchend', touchEnd, false);
        document.addEventListener('touchmove', touchMove, false);

        _top = parseInt(domElement.style.top);
        _left = parseInt(domElement.style.left);

    }

    function touchMove(event){
        event.preventDefault();
        event.stopPropagation();

        _panEnd[0] = event.touches[0].clientX;
        _panEnd[1] = event.touches[0].clientY;

        var subVector = [_panEnd[0]-_panStart[0], _panEnd[1]-_panStart[1]];

        domElement.style.left = (_left + subVector[0]) + "px";
        domElement.style.top = (_top + subVector[1]) + "px";

    }

    function touchEnd(event){
        document.removeEventListener('touchend', touchEnd, false);
        document.removeEventListener('touchmove', touchMove, false);
    }

    this.domElement.addEventListener('touchstart', touchStart, false);


}