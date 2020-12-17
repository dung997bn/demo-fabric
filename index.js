

let mousePressed = false
let currentMode;
const modes = {
    pan: 'pan',
    draw: 'draw'
}

let color = "#000000"
let group = {}
let FabricBorder = {}

const bgUrl = 'https://cdn.pixabay.com/photo/2019/07/13/10/49/music-4334557_960_720.jpg'
const testUrl = 'https://cdn.pixabay.com/photo/2020/11/12/15/45/dog-5735837_960_720.jpg'
let svgState = {}


const inputFile = document.getElementById('myImage')

const imgAdded = (e) => {
    const inputElem = document.getElementById('myImage')
    const file = inputElem.files[0]
    reader.readAsDataURL(file)
}
inputFile.addEventListener('change', imgAdded)

const reader = new FileReader()

reader.addEventListener('load', () => {
    fabric.Image.fromURL(reader.result, img => {
        canvas.add(img)
        canvas.requestRenderAll()
    })
})

const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: 600,
        height: 600,
        selection: false
    })
}

const setBackground = (url, canvas) => {
    fabric.Image.fromURL(url, (img) => {
        canvas.backgroundImage = img
        canvas.renderAll()
    })
}

const canvas = initCanvas('canvas')
const canvasTest = initCanvas('canvasTest')

const checkObj = (canvas) => {
    let obj = canvas.getObjects()
    console.log(obj);
}

const addBorder = (canvas) => {
    const center = canvas.getCenter()
    const w = 300
    const h = 400
    let border = new fabric.Rect({
        width: w,
        height: h,
        top: center.top - h / 2,
        left: center.left - w / 2,
        strokeWidth: 1,
        stroke: '#2403fc',
        fill: '#ecebf0',
        hasRotatingPoint: false,
        lockRotation: true
    });
    // border.setCoords();
    border.set({
        'excludeFromExport': true,
        'selectable': false,
        'hoverCursor': 'pointer',
        id: 'border'
    })
    FabricBorder = border
    canvas.add(border);

    canvas.renderAll();
}

const addSticker = (canvas) => {

    let obj = canvas.getObjects()
    let border = obj.find(o => o.id === 'border')
    if (!border) {
        return
    }
    let centerBorder = border.getCenterPoint()

    fabric.loadSVGFromURL('http://fabricjs.com/assets/1.svg', (objects, options) => {

        let loadedObject = fabric.util.groupSVGElements(objects, options);

        const center = canvas.getCenter()
        loadedObject.set({
            'left': centerBorder.x,
            'top': centerBorder.y,
            'originX': 'center',
            'originY': 'center',
            'typeSVG': 'sticker',
            id: 'sticker'
        });
        canvas.add(loadedObject);

        canvas.renderAll();
    })
}

const testfunc = (canvas) => {
    console.log(canvas.size());
}


//Undo redo
// current unsaved state
var stateCanvasTest;
// past states
var undo = [];
// reverted states
var redo = [];

/**
 * Push the current state into the undo stack and then capture the current state
 */
function save() {
    // clear the redo stack
    redo = [];
    $('#redo').prop('disabled', true);
    // initial call won't have a state
    if (stateCanvasTest) {
        undo.push(stateCanvasTest);
        $('#undo').prop('disabled', false);
    }
    stateCanvasTest = canvasTest.toJSON()
}

/**
    * Save the current state in the redo stack, reset to a state in the undo stack, and enable the buttons accordingly.
    * Or, do the opposite (redo vs. undo)
    * @param playStack which stack to get the last state from and to then render the canvas as
    * @param saveStack which stack to push current state into
    * @param buttonsOn jQuery selector. Enable these buttons.
    * @param buttonsOff jQuery selector. Disable these buttons.
    */
function replay(playStack, saveStack, buttonsOn, buttonsOff) {
    saveStack.push(stateCanvasTest);
    stateCanvasTest = playStack.pop();
    var on = $(buttonsOn);
    var off = $(buttonsOff);
    // turn both buttons off for the moment to prevent rapid clicking
    on.prop('disabled', true);
    off.prop('disabled', true);
    canvasTest.clear();
    canvasTest.loadFromJSON(stateCanvasTest, function () {
        canvasTest.renderAll();
        // now turn the buttons back on if applicable
        on.prop('disabled', false);
        if (playStack.length) {
            off.prop('disabled', false);
        }
    });
}

save();
// register event listener for user's actions
canvasTest.on('object:modified', function () {
    save();
});
// undo and redo buttonsS
$('#undo').click(function () {
    replay(undo, redo, '#redo', this);
});
$('#redo').click(function () {
    replay(redo, undo, '#undo', this);
})

setBackground(bgUrl, canvas)
setBackground(testUrl, canvasTest)

const zoomIn = (canvasTest) => {
    //way 1 not center of screen
    // let zo = canvasTest.getZoom()
    // canvasTest.setZoom(zo + 0.2)

    //way 2
    let zo = canvasTest.getZoom()
    const center = canvasTest.getCenter()
    let centerPoint = new fabric.Point(center.top, center.left)
    canvasTest.zoomToPoint(centerPoint, zo + 0.2)
}
const zoomOut = (canvasTest) => {
    //way 1 not center of screen
    // let zo = canvasTest.getZoom()
    // canvasTest.setZoom(zo + 0.2)

    //way 2
    let zo = canvasTest.getZoom()
    const center = canvasTest.getCenter()
    let centerPoint = new fabric.Point(center.top, center.left)
    canvasTest.zoomToPoint(centerPoint, zo - 0.2)
}

const restoreCanvas = (canvas, state, bgUrl) => {
    if (state.val) {
        fabric.loadSVGFromString(state.val, objects => {
            console.log(objects);
            objects = objects.filter(o => o['xlink:href'] !== bgUrl)
            canvas.add(...objects)
            canvas.requestRenderAll()
        })
    }
}

const setColorListener = () => {
    const picker = document.getElementById('colorPicker')

    picker.addEventListener('change', (e) => {
        color = e.target.value
        canvas.freeDrawingBrush.color = color
        canvas.renderAll()
    })
}

const clearCanvas = (canvas, state) => {
    state.val = canvas.toSVG()
    canvas.getObjects().forEach((obj) => {
        if (obj !== canvas.backgroundImage) {
            canvas.remove(obj)
        }
    })

}
const testClick = (canvas) => {
    var svg = canvas.toSVG()
    // console.log('SVG: ' + svg);

    var json = canvas.toJSON();
    // console.log(json);
    // canvas.getObjects().forEach((obj) => {
    //     if (obj !== canvas.backgroundImage) {
    //         canvas.remove(obj)
    //     }
    // })
    // delete json["backgroundImage"];
    stateCanvasTest = json
    canvasTest.loadFromJSON(json, function () {
        canvasTest.renderAll();
    });

    save()
}

createRect = (canvas) => {
    const canvasCenter = canvas.getCenter()
    const rect = new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'green',
        left: canvasCenter.left,
        top: -50,
        originX: 'center',
        originY: 'center',
        cornerColor: 'black',
        objectCaching: false
    })
    canvas.add(rect)
    canvas.renderAll()
    rect.animate('top', canvasCenter.top, {
        onChange: canvas.renderAll.bind(canvas)
    });

    rect.on('selected', () => {
        rect.fill = 'white'
        canvas.renderAll()
    })
    rect.on('deselected', () => {
        rect.set('fill', 'black')
        canvas.renderAll()
    })
}

createCirc = () => {
    const canvasCenter = canvas.getCenter()
    const circle = new fabric.Circle({
        radius: 50,
        fill: 'orange',
        left: canvasCenter.left,
        top: -50,
        originX: 'center',
        originY: 'center',
        cornerColor: 'black',
        objectCaching: false
    })
    canvas.add(circle)
    canvas.renderAll()

    circle.animate('top', canvas.height, {
        onChange: canvas.renderAll.bind(canvas),
        duration: 2000,
        onComplete: () => {
            circle.animate('top', canvasCenter.top, {
                onChange: canvas.renderAll.bind(canvas),
                easing: fabric.util.ease.easeInQuart
            });
        }
    });
}

const groupObjects = (canvas, group, shouldGroup) => {
    if (shouldGroup) {
        const objects = canvas.getObjects()
        group.val = new fabric.Group(objects, { cornerColor: 'white' })
        clearCanvas(canvas)
        canvas.add(group.val)
        canvas.requestRenderAll()
    } else {
        group.val.destroy()
        const oldGroup = group.val.getObjects()
        canvas.remove(group.val)
        canvas.add(...oldGroup)
        group.val = null
        canvas.requestRenderAll()
    }
}

const toggleMode = (mode) => {
    if (mode === modes.pan) {
        if (currentMode === modes.pan) {
            currentMode = ""
        } else {
            currentMode = modes.pan
            canvas.isDrawingMode = false
            canvas.renderAll()
        }
    } else if (mode === modes.draw) {
        if (currentMode === modes.draw) {
            currentMode = ""
            canvas.isDrawingMode = false
            canvas.renderAll()
        } else {

            //Change brush

            //free draw
            // canvas.freeDrawingBrush.color = 'red'
            // canvas.freeDrawingBrush.width = '25'

            //circle brush
            // canvas.freeDrawingBrush = new fabric.CircleBrush(canvas)

            //spray brush
            // canvas.freeDrawingBrush = new fabric.SprayBrush(canvas)

            currentMode = modes.draw
            canvas.freeDrawingBrush.color = color
            canvas.isDrawingMode = true
            canvas.renderAll()
        }
    }
}

const setPanEvents = (canvas) => {
    canvas.on('mouse:move', (event) => {
        if (mousePressed && currentMode === modes.pan) {
            const mEvent = event.e
            canvas.setCursor('grab')
            canvas.renderAll()
            const delta = new fabric.Point(mEvent.movementX, mEvent.movementY)
            canvas.relativePan(delta)
        } else if (mousePressed && currentMode === modes.draw) {
            canvas.isDrawingMode = true
            canvas.renderAll()
        }
    })

    //Keep track of mouse down/up
    canvas.on('mouse:down', (event) => {
        mousePressed = true
        if (currentMode === modes.pan) {
            canvas.setCursor('grab')
            canvas.renderAll()
        }
    })
    canvas.on('mouse:up', (event) => {
        mousePressed = false
        canvas.setCursor('pointer')
        canvas.renderAll()
    })
}

setPanEvents(canvas)
setColorListener()







//ClipTo excample

var logoURL = 'https://www.google.com/images/srpr/logo4w.png';

var canvas1 = new fabric.Canvas('c', {
    width: 600,
    height: 600,
    selection: false
});

var logoImg = new Image();
logoImg.src = logoURL;
logoImg.onload = function (img) {
    var logo = new fabric.Image(logoImg, {
        angle: 0,
        width: 550,
        height: 190,
        left: 150,
        top: 150,
        scaleX: 0.25,
        scaleY: 0.25,
        clipName: 'test',

    });
    canvas1.add(logo);
};

var clipRect2 = new fabric.Rect({
    originX: 'left',
    originY: 'top',
    left: 70,
    top: 70,
    width: 250,
    height: 250,
    fill: '#DDD', /* use transparent for no fill */
    strokeWidth: 0,
    selectable: false
});

clipRect2.set({
    clipFor: 'test'
});
canvas1.add(clipRect2);
// canvas1.clipTo = function (ctx) {
//     clipRect2.render(ctx);
// };
canvas1.clipPath = new fabric.Rect({
    left: 70,
    top: 70,
    width: 250,
    height: 250,
    // originX: 'center',
    // originY: 'center',
}),

canvas1.renderAll();
