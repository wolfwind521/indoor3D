indoor3D
========

This is a javascript lib based on three.js to show a 3D indoor map

#Usage
a simplest example: 
```html
<!DOCTYPE html>
<html>
<body>
<script src="js/three.min.js"></script>
<script src="js/Detector.js"></script>
<script src="js/OrbitControls.js"></script>
<script src="js/Indoor3D.js"></script>
<link href="css/indoor3D.css" rel="stylesheet">
<script>
    var indoorMap = new Indoor3D();
    indoorMap.load('B000A9R4FE.json');
    indoorMap.showFloor(1);
</script>
</body>
</html>
```
a little more complex example：
```html
<!DOCTYPE html>
<html>
<body>
<script src="js/three.min.js"></script>
<script src="js/Detector.js"></script>
<script src="js/OrbitControls.js"></script>
<script src="js/Indoor3D.js"></script>
<link href="css/indoor3D.css" rel="stylesheet">

<div id="indoor3d" style="width: 800px; height: 500px"></div>
<script>
    var params = {
        mapDiv:"indoor3d"
    }
    var indoorMap = new Indoor3D(params);
    indoorMap.load('B000A9R4FE.json', function(){
        indoorMap.showAllFloors();
        indoorMap.showLabels(true);
        indoorMap.setSelectable(true);
        var ul = indoorMap.getUI();
        document.body.appendChild(ul);
    });
</script>

</body>
</html>
```
1) include the required js files
```html
<script src="js/three.min.js"></script>
<script src="js/Detector.js"></script>
<script src="js/OrbitControls.js"></script>
<script src="js/Indoor3D.js"></script>
<link href="css/indoor3D.css" rel="stylesheet">
```
  - [three.min.js](http://threejs.org/): a 3D javascript library
  - Detector: detects whether the browser support the webgl. if it does not, threejs switches to a normal canvas renderer.
  - OrbitControls: handles the user interactions to zoom, pan and pivot

2) set up the parent <div> node of the indoor map and pass the params
```html
var params={mapDiv:"indoor3d"};
var indoorMap = new Indoor3D(params);
```
So there must be a corresponding `<div id="indoor3d">` tag in your html codes, or it will create a fullscreen map.
If there is no params passed to Indoor3D, it will create a fullscreen one as well:
```html
var indoorMap = new Indoor3D();
```

3) load the map data, and set up its styles.
```html
indoorMap.load('B000A9R4FE.json', function(){
        indoorMap.showAllsFloor();
        indoorMap.setSelectable(true);
        var ul = indoorMap.getUI();
        document.body.appendChild(ul);
    });
```
the second parameter of the load() function is a callback function when the data is loaded.
if you don't need the ui, you can also set the style outside the callback function:
```html
indoorMap.load('B000A9R4FE.json');
indoorMap.showFloor(1);
indoorMap.setSelectable(true);
indoorMap.showLabels(true);
```
the style of the ui is defined in the css file. so you can specify it by yourself.

#User Reference
There are two main classes:
  -IndoorMap
  -Mall


## IndoorMap
###methods:
**.load(fileName, callback)**

loads a file. 
When it finishes loading, the callback functon is called.
Since the ui can only be constructed after the data is fully loaded, so the `getUI()` function must be called in the callback.

**.adjustCamera**

Resets the camera to its default settings. This function is called when switching floors

**.setSelectable(selectable)**

selectable- a boolean parameter to specify whether the rooms are selectable

**.showLabels(showLabels)**

showLabels- a boolean parameter to specify whether to show the labels.
The labels are the icons and texts in the map.

**.getUI()**

returns a `<ul>` tag with all the floor id. The user can switch the floor by clicking the `<li>`
You can insert the `<ul>` to anywhere in the html.
Make sure to call this method only after the map is loaded.

**.getSelected()**

get the selected `[THREE.Object3D]`(http://threejs.org/docs/#Reference/Core/Object3D).
You can get the object's name by using `.getSelected().name`, more properties will be added later.

**.showFloor(id)**

`id`-the floor id
shows the floor by id. Notice this does not handle the labels.

**.showAllFloors()**

shows all the floors together. Notice this does not handle the labels.

###
## Mall:
###Properties
**.floors**

This is an array with all the floors of `[THREE.Object3D]`(http://threejs.org/docs/#Reference/Core/Object3D) type.

###Methods:
**.getCurFloorId()**

gets the `id` of the current floor.
Notice: the `id` is a  signed integers. -1 means Floor B1, and 1 means Floor F1. 0 is preserved for showing all the floors.


**.getFloor(id)**

`id`-the floor id
gets the floor of `[THREE.Object3D]`(http://threejs.org/docs/#Reference/Core/Object3D) type by its `id`.

**.getCurFloor()**

gets the current floor of `[THREE.Object3D]`(http://threejs.org/docs/#Reference/Core/Object3D) type.

