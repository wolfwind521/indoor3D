indoor3D

**OOPS! This project is deprecated. I haven't updated its codes or documentation for a long long time.
You may play with it, but don't use it in real applicaition.
========
This is a javascript lib based on three.js to show an indoor map

**A GUI map eidtor software is under development. Currently you must draw a map with other software and convert it to the JSON format used in this project.**

#Demo
2D Map Demo Page: http://wolfwind521.github.io/2dmap

3D Map Demo Page: http://wolfwind521.github.io

#Usage
a simplest example: 
```html
<!DOCTYPE html>
<html>
<body>
<script src="js/three.min.js"></script>
<script src="js/Detector.js"></script>
<script src="js/OrbitControls.js"></script>
<script src="js/IndoorMap.js"></script>
<script src="js/Projector.js"></script>
<script src="js/IndoorMap2d.js"></script>
<script src="js/IndoorMap3d.js"></script>
<script>
    var map = new IndoorMap();
    map.load('data/testMapData.json').showFloor(1);
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
<script src="js/Projector.js"></script>
<script src="js/IndoorMap.js"></script>
<script src="js/IndoorMap2d.js"></script>
<script src="js/IndoorMap3d.js"></script>
<link href="css/indoor3D.css" rel="stylesheet">

<div id="indoor3d" style="width: 800px; height: 500px"></div>
<script>
    var params = {
        mapDiv:"indoor3d",
        dim:"3d"
    }
    var map = IndoorMap(params);
    map.load('data/testMapData.json', function(){
        map.showAllFloors().showAreaNames(true).setSelectable(true);
        var ul = IndoorMap.getUI(map);
        document.body.appendChild(ul);
    });
</script>

</body>
</html>
```
The explanation is as follows:
1) include the required js files
```html
<script src="js/three.min.js"></script>
<script src="js/Detector.js"></script>
<script src="js/OrbitControls.js"></script>
<script src="js/Projector.js"></script>
<script src="js/IndoorMap.js"></script>
<script src="js/IndoorMap2d.js"></script>
<script src="js/IndoorMap3d.js"></script>
<link href="css/indoor3D.css" rel="stylesheet">
```
  - [three.min.js](http://threejs.org/): a 3D javascript library
  - Detector: detects whether the browser support the webgl. if it does not, threejs switches to a normal canvas renderer.
  - OrbitControls: handles the user interactions to zoom, pan and pivot. (Only used in 3D version)
  - Projector: user selection detection used by threejs. (Only used in 3D version)

2) set up the parameters of the indoor map and pass it to the creator
```js
var params={mapDiv:"indoor3d",dim:"3d"};
var indoorMap = IndoorMap(params);
```
optional parameters:
@mapDiv: if you have create your own <div> as a map container, u can specify its id here, or it will create a full screen map.
@dim: "2d" or "3d". "3d" as default value. But the final result depends on your device. If it doesn't support WebGL, it will show a 2d map even if u set "3d".


So if there is no params passed to IndoorMap, it will create a fullscreen 3D map by default:
```js
var indoorMap = IndoorMap();
```

3) load the map data, and set up its styles.
```js
indoorMap.load('data/testMapData.json', function(){
        map.setTheme(myTheme).showAllFloors().showAreaNames(true).setSelectable(true);
        var ul = IndoorMap.getUI(indoorMap);
        document.body.appendChild(ul);
    });
```
the second parameter of the load() function is a callback function when the data is successfully loaded.
You can customize the style and interaction of your indoor map in it. You may call the functions separately:
```js
map.setTheme(myTheme);
map.showAllFloors();
map.showAreaNames(true);
map.setSelectable(true);
```
or in a chain for convenience:

```js
map.setTheme(myTheme).showAllFloors().showAreaNames(true).setSelectable(true);
```
The UI is the buttons for switching floors. Its style is defined in the css file. so you can customize it by yourself.

#User Reference
There are Three main classes:
  -IndoorMap
  -IndoorMap2d
  -IndoorMap3d


## IndoorMap2d
###methods:
**.load(fileName, callback)**

loads a file. 
When it finishes loading, the callback functon is called.
Since the ui can only be constructed after the data is fully loaded, so the `getUI()` function must be called in the callback.

if the file is already loaded by other modules, you should use the `.parse(jsonData)` method instead

**.parse(jsonData)**

parse the json Data.
if the jsonData is loaded by other modules, you can just use this function to pass it to the indoor map

**.setDefaultView()**

reset the camera to default view (Default perspective view for a 3d map and default top view for a 2d map)

**.setTopView()**

set the camera to the top view. this function is only valid in the 3d map.

**.zoomIn(zoomScale)**

zoom in. zoom Scale is not necessary. so you can just call .zoomIn()

**.zoomOut(zoomScale)**

zoom out. Same as the zoomIn() function, zoom Scale is not necessary.

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

**.setSelectionListener(callback)**

set the call back function when a shop is selected.

the shop id is passed as the parameter of callback. and -1 for nothing is selected.

**.getSelectedId()**

get the selected shop's id

**.selectById(id)**

select the shop by its id

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

