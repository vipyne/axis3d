# axis2
move along....

## Introduction
Axis3d is a multi-media 3d rendering library

## Tutorial
### Create some graphics

```bash
$ git clone https://github.com/littlstar/axis3d
$ cd axis3d && npm install
```

Now create a new folder in axis3d/example named "example1"

In that folder first add a file named "index.html" with this code:
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
Save that file, and make another file in that folder named "index.js"

Here's where the fun begins. First we need to add our dependencies,
paste this at the top of "index.js":

```javascript
'use strict';

import Context from 'axis3d/context'
import Camera from 'axis3d/camera'
import Box from 'axis3d/mesh/box'
import Frame from 'axis3d/frame'
```
Ok, now we need to setup our Context and tools. 
In axis3d, the Context is a central reference point that keeps everything connected
and in order, so every object created needs to listen to it. This is easy to do
because very object class returns a function, so all we have to do is pass the Context
as the 1st argument to every object we make.

First initialize the Context. Beneath the dependencies add:
```javascript
const ctx = Context()
```

Now let's create our Camera, Frame, and Box below that:
```javascript
const frame = Frame(ctx)
const camera = Camera(ctx, {position: [0, 0, -5]})
const box = Botx(ctx)
```

Notice we passed Camera a second object with the key "position". The array it contains ([0, 0, -5])
represents the X, Y, and Z coordinates. This moves the camera back 5 units for a small zoom out.

Finally, let's create the scene. Add this below everything else:
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

Let's look at that last bit of code we added:
```javascript
frame(() => {
  camera(() => {
    box()
  })
})
```

First, frame() fires 60 times per second and every time it returns a function that calls the camera() function. 
That function returns a function that calls box. In English that might sound like "every time a frame
is drawn we make a box inside our camera scene"... or something like that.




