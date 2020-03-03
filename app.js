function setCursorByID(id, cursorStyle) {
    var elem
    if (document.getElementById && (elem = document.getElementById(id))) {
        if (elem.style) elem.style.cursor = cursorStyle
    }
}

function euclideanDist(p1, p2) {
    var distX = p1['x'] - p2['x']
    var distY = p1['y'] - p2['y']
    return Math.sqrt(distX * distX + distY * distY)
}

function getNrOfClusters() {
    return maxKnearestNeighborClasses
}

function getColor(i, transparency) {
    return getColorGeneral(i, getNrOfClusters(), transparency)
}

function getColorGeneral(i, k, transparency) {
    if (i == 0) {
        return 'hsla(0, 100%, 100%, ' + transparency + ')'
    }
    var t = (i - 1) * (360 / k)
    var color = 'hsla(' + t + ', 100%, 50%, ' + transparency + ')'
    return color
}

function doesCenterWithoutPointsExist(clusterCenters, k) {
    for (i = 0; i < k; i++) {
        if (clusterCenters[i]['points'] == 0) {
            return true
        }
    }
    return false
}

/** Returns a dictionary with a cluster and a radius*/
function getKNearestNeighbor(k, mouseCoords) {
    if (points.length == 0) {
        return { cluster: 0, radius: INITIAL_RADIUS }
    }

    var Distances = new Array()
    for (var i = 0; i < points.length; i++) {
        points[i]['cluster'] = points[i]['class']
        var dist = euclideanDist(points[i], mouseCoords)
        Distances.push({ dist: dist, class: points[i]['class'] })
    }

    numberSort = function(a, b) {
        return a['dist'] - b['dist']
    }

    Distances.sort(numberSort)

    /* initialise array to count */
    var classCount = new Array(maxKnearestNeighborClasses)
    for (var i = 0; i < maxKnearestNeighborClasses; i++) {
        classCount[i] = 0
    }

    /* count classes */
    for (var i = 0; i < Math.min(Distances.length, k); i++) {
        classCount[Distances[i]['class'] - 1]++
    }

    /* find maximum */
    maxClass = 0
    maxClassCount = 0
    for (var i = 0; i < maxKnearestNeighborClasses; i++) {
        if (maxClassCount < classCount[i]) {
            maxClassCount = classCount[i]
            maxClass = i + 1
        } else if (maxClassCount == classCount[i]) {
            maxClass = 0
        }
    }
    return {
        cluster: maxClass,
        radius: Distances[Math.min(Distances.length, k) - 1]['dist']
    }
}

function drawBoard(canvas, mouseCoords, radius) {
    var context = canvas.getContext('2d')
    var k = parseInt(kElement.value)
    // context.canvas.width = window.innerWidth - 300
    // context.canvas.height = window.innerHeight - 50
    // context.canvas.style.width = 100
    // context.canvas.style.height = 100
    context.canvas.width = window.innerWidth - 300
    context.canvas.height = window.innerHeight - 100
    console.log(document.getElementById('canvas-div').offsetWidth)
    context.clearRect(0, 0, canvas.width, canvas.height)
    if (document.getElementById('voronoi').checked) {
        // var add = parseInt(document.getElementById("density").value);
        var offset = 10
        for (x = 0; x < canvas.width; x += offset) {
            for (y = 0; y < canvas.height; y += offset) {
                var algorithmResult = getKNearestNeighbor(k, { x: x, y: y })
                if (algorithmResult['cluster'] > 0) {
                    context.fillStyle = getColor(
                        algorithmResult['cluster'],
                        0.5
                    )
                    context.fillRect(x, y, offset, offset)
                }
            }
        }
    }

    if (document.getElementById('circle').checked) {
        var algorithmResult = getKNearestNeighbor(k, mouseCoords)

        // if (algorithmResult['cluster'] > 0) {
        context.beginPath()
        context.arc(
            mouseCoords['x'],
            mouseCoords['y'],
            algorithmResult['radius'],
            0,
            2 * Math.PI,
            false
        )
        context.fillStyle = getColor(algorithmResult['cluster'], 0.4)
        context.strokeStyle = getColor(algorithmResult['cluster'], 1)
        context.lineWidth = 2
        context.fill()
        context.stroke()
        // }
    }

    drawPoints(canvas, k)
}

/** permanently add a point */
function addPoint(event, canvas, mouseCoords, radius) {
    updateBoard()

    pointCluster = parseInt(document.getElementById('class').value)

    if (pointCluster > maxKnearestNeighborClasses) {
        maxKnearestNeighborClasses = pointCluster
    }

    points.push({
        x: mouseCoords['x'],
        y: mouseCoords['y'],
        radius: radius,
        cluster: pointCluster,
        class: pointCluster
    })
}

/** draw all permanently added points */
function drawPoints(canvas, k) {
    for (var i = 0; i < points.length; i++) {
        context.beginPath()
        context.arc(
            points[i]['x'],
            points[i]['y'],
            points[i]['radius'],
            0,
            2 * Math.PI,
            false
        )
        context.lineWidth = 1
        context.strokeStyle = 'black'
        context.fillStyle = getColor(
            points[i]['cluster'],
            getNrOfClusters(),
            0.9
        )
        context.fill()
        context.stroke()
    }
}

/** get the current position of the mouse */
function getMouseCoords(canvas, evt) {
    var rect = canvas.getBoundingClientRect()
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    }
}

function updateBoard() {
    var canvas = document.getElementById('myCanvas')
    drawBoard(canvas, { x: 0, y: 0 }, INITIAL_RADIUS)
}

function updateNumberBgColor() {
    var domEl = document.getElementById('class')
    if (parseInt(domEl.value) > getNrOfClusters() + 1) {
        domEl.value = getNrOfClusters() + 1
    }
    domEl.style.backgroundColor = getColorGeneral(
        parseInt(domEl.value),
        Math.max(parseInt(domEl.value), getNrOfClusters()),
        0.5
    )
}

/** global variables */
var maxKnearestNeighborClasses = 1
var INITIAL_RADIUS = 20
var POINT_RADIUS = 5
var points = new Array()
var canvas = document.getElementById('myCanvas')
var kElement = document.getElementById('k')
var context = canvas.getContext('2d')
drawBoard(canvas, { x: 0, y: 0 }, INITIAL_RADIUS)
updateNumberBgColor()
setCursorByID('myCanvas', 'crosshair')

/** event listeners */
canvas.addEventListener(
    'mousemove',
    function(evt) {
        var mouseCoords = getMouseCoords(canvas, evt)
        drawBoard(canvas, mouseCoords, INITIAL_RADIUS)
    },
    false
)

canvas.addEventListener(
    'mousedown',
    function(event) {
        var mouseCoords = getMouseCoords(canvas, event)
        addPoint(event, canvas, mouseCoords, POINT_RADIUS)
    },
    false
)
