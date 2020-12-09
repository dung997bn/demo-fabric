

let mousePressed = false
let currentMode;
const modes = {
    pan: 'pan',
    draw: 'draw'
}

let color = "#000000"
let group = {}


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
        width: 500,
        height: 500,
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

setBackground(bgUrl, canvas)
setBackground(testUrl, canvasTest)

const zoom = (canvasTest) => {
    let zo = canvasTest.getZoom()
    canvasTest.setZoom(zo + 0.2)
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
    console.log('SVG: ' + svg);

    var json = canvas.toJSON();
    console.log(json);
    // canvas.getObjects().forEach((obj) => {
    //     if (obj !== canvas.backgroundImage) {
    //         canvas.remove(obj)
    //     }
    // })
    delete json["backgroundImage"];
    canvasTest.loadFromJSON(json, function () {
        canvas.renderAll();
    });
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
