## Introduction
Axis3d is a multi-media 3d rendering library

## Simple Example
### Draw a cube

First clone the repo, cd into it and install the dependencies

```bash
$ git clone https://github.com/littlstar/axis3d
$ cd axis3d && npm install
```

Now create a new folder in axis3d/example named "example1" and add
a file named "index.html" with this code:
```html
<!doctype html>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <title>Axis 360 Example 1</title>
  </head>
  <body>
    <script type="text/javascript" src="/index.js"></script>
  </body>
</html>
```
Save that file and make another file in that folder named "index.js"

This file will contain the action. First import the dependencies.
Paste this at the top of "index.js":

```javascript
'use strict';

import Context from 'axis3d/context'
import Camera from 'axis3d/camera'
import Box from 'axis3d/mesh/box'
import Frame from 'axis3d/frame'
```
Now we setup our Context and tools. 
In axis3d, the Context is a central reference point. It keeps all the objects we generate 
connected and in order, so to make sure those objects have access to it, we must pass Context
as the first argument to every object we create.

First initialize the Context. Beneath the dependencies add:
```javascript
const ctx = Context()
```

Now create the Camera, Frame & Box below that:
```javascript
const frame = Frame(ctx)
const camera = Camera(ctx, {position: [0, 0, -5]})
const box = Box(ctx)
```

Notice we passed Camera a second argument, an object with the key "position". The array it contains ([0, 0, -5])
represents the X, Y, and Z coordinates, so this moves the camera back 5 units for a small zoom out.
Without this, we would have an extreme close up of the cube, instead of seeing the whole thing.

Finally, create the scene by adding this at the bottom:
```javascript
frame(() => {
  camera(() => {
    box()
  })
})
```
Done! Let's run it.
From the axis3d repo in the terminal run:
```bash
$ make example/example1
```

Now open a web browser to http://localhost:3000/ and you should see a box!

### If make returns an error:
Make sure your terminal command has no slash at the end. You should have 
```javascript
$ make example/example1 
```
and not
```
$ make example/example1/
```
Also, make sure you run it from inside the axis3d/ repo.


Let's look at that last bit of code we added:
```javascript
frame(() => {
  camera(() => {
    box()
  })
})
```

First, frame() fires 60 times per second and every time it returns a function that calls the camera() function. 
That function returns a function that calls box(). In English that might sound like "every time a frame
is drawn we make a box inside our camera scene"... or something like that.

## Going Further
### Time, Rotation & Object Positioning

Now let's get more complex. Make a new folder next to example/example1
called example/example2. In it, create 2 files, index.html and index.js.
Copy and paste the contents of our old index.html into our new one, and
update the example number in the title.

Now add this to the top of index.js
```javascript
'use strict';

import Context from 'axis3d/context'
import Camera from 'axis3d/camera'
import Plane from 'axis3d/mesh/plane'
import Box from 'axis3d/mesh/box'
import Sphere from 'axis3d/mesh/sphere'
import Frame from 'axis3d/frame'
import quat from 'gl-quat'
import vec3 from 'gl-vec3'
````

In this example, we're going to generate some spheres and boxes that all rotate around a center
box, which we'll call the 'centroid'. 
To start, setup the context, camera and frame, along with our centroid box and rotation array:
```
const ctx = Context()
const camera = Camera(ctx, {position: [0, 0, -20]})
const frame = Frame(ctx)

const centroid = Box(ctx)
const rotation = [0, 0, 0, 1]
```

Now let's make our rotating spheres and boxes. Add this:
```javascript
const nodesNum = 40
const nodes = []

for (let i = 0; i < nodesNum; i++) {
  // even
  if (0 == i % 2) {
    nodes.push(Sphere(ctx, {
      // rgba color array
      color: [0, (i * 16)/255, 0, 1]
    }))
  } else {
    nodes.push(Box(ctx, {
      color: [0, 0, (i * 16)/255, 1]
    }))
  }
}
```
Notice the color array we pass to each node, it's just like the position key/value we pass to the camera.

