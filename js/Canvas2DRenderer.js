/**
 * Created by gaimeng on 15/2/2.
 */
Canvas2DRenderer = function (param) {
    param = param || {};
    var _canvas = param.canvas !== undefined
                ? param.canvas : document.createElement('canvas');
    var _this = this,
        _canvasWidth = _canvas.width,
        _canvasHeight = _canvas.height,
        _canvasWidthHalf = Math.floor( _canvasWidth / 2),
        _canvasHeightHalf = Math.floor(_canvas.height / 2),

        _centerX = 0,
        _centerY = 0,
        _oldId = 0,

        _clearColor,
    _cxt = _canvas.getContext('2d'),
    _clearColor,
    _scale;

    this.domElement = _canvas;
    this.setDefaultView = function(object){
        if(object._id != _oldId) {
            var width = object.br[0] - object.tl[0];
            var height = object.br[1] - object.tl[1];
            var scaleX = _canvasWidth / width;
            var scaleY = _canvasHeight / height;
            _scale = scaleX < scaleY ? scaleX : scaleY;
            _centerX = (object.br[0] + object.tl[0])/2;
            _centerY = (object.br[1] + object.tl[1])/2;
        }
    }
    this.draw = function (scene, camera){
        if(scene.mall === undefined) {
            return;
        }

        //get render data
        var curFloor = scene.mall.getCurFloor();
        _ctx.save();
        _ctx.setTransform(_scale, _scale, 0, 0, _centerX*_scale+_canvasWidthHalf, _centerY*_scale+_canvasHeightHalf);

        for(var i = 0 ; i < curFloor.FuncAreas.length; i++){
            var poly = curFloor.FuncAreas[i].Outline[0][0];
            if(poly.length < 6){ //less than 3 points, return
                return;
            }
            _cxt.beginPath();

            _cxt.moveTo(poly[0], poly[1]);
            for(var i = 2; i < poly.length - 1; i++){
                _cxt.lineTo(poly[i],poly[i+1]);
            }
            _cxt.closePath();


            _cxt.strokeStyle = "blue";
            _cxt.lineWidth = 1;
            _cxt.stroke();
            _cxt.fillStyle = "red";
            _cxt.fill();
        }
    }

    this.setClearColor = function(color){
        _clearColor = color;
    }

    this.setSize = function(width, height) {
        _canvasWidth = width;
        _canvasHeight = height;
        _canvas.width = _canvasWidth;
        _canvas.height = _canvasHeight;
        _canvasHeightHalf = Math.floor(_canvasWidth / 2);
        _canvasWidthHalf = Math.floor(_canvasHeight / 2);
    }

}