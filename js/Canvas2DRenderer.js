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
    _ctx = _canvas.getContext('2d'),
    _clearColor,
    _scale;

    this.domElement = _canvas;
    this.setDefaultView = function(object){
        if(object._id != _oldId) {
            var width = object.rect.br[0] - object.rect.tl[0];
            var height = object.rect.br[1] - object.rect.tl[1];
            var scaleX = _canvasWidth / width;
            var scaleY = _canvasHeight / height;
            _scale = scaleX < scaleY ? scaleX : scaleY;
            _centerX = (object.rect.br[0] + object.rect.tl[0])/2;
            _centerY = (object.rect.br[1] + object.rect.tl[1])/2;
        }
    }
    this.render = function (scene, camera){
        if(scene.mall === undefined) {
            return;
        }

        //get render data
        var curFloor = scene.mall.getCurFloor();


        _ctx.clearRect(0,0,_canvasWidth, _canvasHeight);
        _ctx.translate(_centerX, _centerY);
        _ctx.scale(_scale, _scale);
        _ctx.translate(-_canvasWidthHalf+_centerX*_scale, -_canvasHeightHalf+_centerY*_scale);


        var poly = curFloor.Outline[0][0];
        _ctx.beginPath();
        _ctx.moveTo(poly[0], poly[1]);
        for(var i = 2; i < poly.length - 1; i+=2){
            _ctx.lineTo(poly[i],poly[i+1]);
        }
        _ctx.closePath();
        _ctx.strokeStyle = "blue";
        _ctx.lineWidth = 1;
        _ctx.stroke();


        for(var i = 0 ; i < curFloor.FuncAreas.length; i++){
            var poly = curFloor.FuncAreas[i].Outline[0][0];
            if(poly.length < 6){ //less than 3 points, return
                return;
            }
            _ctx.beginPath();

            _ctx.moveTo(poly[0], poly[1]);
            for(var j = 2; j < poly.length - 1; j+=2){
                _ctx.lineTo(poly[j],poly[j+1]);
            }
            _ctx.closePath();
            _ctx.strokeStyle = "blue";
            _ctx.lineWidth = 1;
            _ctx.stroke();


            _ctx.fillStyle = curFloor.FuncAreas[i].fillColor;
            _ctx.fill();
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