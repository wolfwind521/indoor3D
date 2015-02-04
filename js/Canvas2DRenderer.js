/**
 * Created by gaimeng on 15/2/2.
 */
Canvas2DRenderer = function (param) {
    param = param || {};
    var _canvas = param.canvas !== undefined
                ? param.canvas : document.createElement('canvas');
    var _this = this,
        _renderData=null,
        _canvasWidth = _canvas.width,
        _canvasHeight = _canvas.height,
        _canvasWidthHalf = Math.floor( _canvasWidth / 2),
        _canvasHeightHalf = Math.floor(_canvas.height / 2),

    _context = _canvas.getContext('2d');
    _clearColor = new THREE.Color(0xffffff);
    this.domElement = _canvas;

    this.render = function (scene, camera){
        if(scene.mall === undefined) {
            return;
        }

        //get render data
        var curFloor = scene.mall.getCurFloor();

        for(var i = 0 ; i < curFloor.FuncAreas.length; i++){
            var poly = curFloor.FuncAreas[i].Outline[0][0];
            if(poly.length < 6){ //less than 3 points, return
                return;
            }
            _context.beginPath();

            _context.moveTo(poly[0], poly[1]);
            for(var i = 2; i < poly.length - 1; i++){
                _context.lineTo(poly[i],poly[i+1]);
            }
            _context.closePath();


            _context.strokeStyle = "blue";
            _context.lineWidth = 1;
            _context.stroke();
            _context.fillStyle = "red";
            _context.fill();
        }
    }

    this.setSize = function(width, height) {
        _canvasWidth = width;
        _canvasHeight = height;
        _canvas.width = _canvasWidth;
        _canvas.height = _canvasHeight;
        _canvasHeightHalf = Math.floor(_canvasWidth / 2);
        _canvasWidthHalf = Math.floor(_canvasHeight / 2);
    }

    this.setClearColor = function (color) {
        _clearColor.set(color);
    }

    function getRenderData(floor){
        var minx=9999,miny=9999,maxx,maxy;
        for(var i = 0; i < floor.FuncAreas.length; i++){
            var poly = curFloor.FuncAreas[i].Outline[0][0];
            for(var j = 0; j < poly.length; j++){

            }
        }
    }


}