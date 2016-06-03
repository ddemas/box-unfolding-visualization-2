var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

canvas.onmousedown = clickMouse;
canvas.onmouseup = releaseMouse;
canvas.onmousemove = dragMouse;

var height = 0.5;
var width = 0.5;
var length = 0.5;

var center_x;
var center_y;

var perimeter = 0;

var sourceX = 0;
var sourceY = 0;

var points = starPoints(sourceX, sourceY);
var centerPoints = starPoints(0,0);

var mouseIsDown = false;
var selectedPointInd = 0;

var voronoiDiagram = null;
var voronoiDiagramAll = null;

var fade = 0.5;

var SCALE = 15;

var voronoiDisp = true;
var rectColorsDisp = true;
var starEdgesDisp = true;
var fadeDisp = true;

var upperLeftSwap = false;
var upperRightSwap = false;
var lowerLeftSwap = false;
var lowerRightSwap = false;

resizeCanvas();
setInterval(draw, 10);

function draw() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    perimeter = 0;

    updateCheckBoxes();

    rescale();

    if (rectColorsDisp) {
        drawBgRectangles(width, height, length);
    }

    var minimumx = - (width*SCALE)/2;
    var maximumx = width*SCALE/2;
    var minimumy = - height*SCALE/2;
    var maximumy = height*SCALE/2;
    sourceX = Math.max(Math.min(sourceX, maximumx), minimumx);
    sourceY = Math.max(Math.min(sourceY, maximumy), minimumy);

    setSwapBooleans(sourceX, sourceY);

    points = starPoints(sourceX, sourceY);
    centerPoints = starPoints(0,0);

    drawSymmetricPointsAndLines(sourceX,sourceY);

    //document.getElementById("perimeter").innerHTML=perimeter;
}

function resizeCanvas() {
    canvas.width = $(window).width() - 530;
    center_x = canvas.width / 2;
    canvas.height = $(window).height() - 65;
    center_y = canvas.height / 2;
}

function rescale() {
    var totalWidth = Math.max(width*3 + length*2, width + 2*height + 2*length);
    var totalHeight = Math.max(height*3 + length*2, width*2 + height);
    // if(!more_wxl_faces) {
    //     totalWidth = Math.max(width*3 + length*2, width + 2*height);
    //     totalHeight = Math.max(height*3 + length*2, width*2 + length*2 + height);
    // }

    var newScale = SCALE;

    var canvasHeightToWidthRatio = canvas.height / canvas.width;

    if(totalHeight > totalWidth * canvasHeightToWidthRatio) {
        newScale = canvas.height * 0.9 / totalHeight;
    } else if (totalWidth * canvasHeightToWidthRatio >= totalHeight) {
        newScale = canvas.width * 0.9 / totalWidth;
    }

    SCALE = newScale;
}

function drawBgRectangles(w, h, l) {
    var scaledWidth = w * SCALE;
    var scaledLength = l * SCALE;
    var scaledHeight = h * SCALE;

    drawRectangle(center_x - scaledWidth/2,center_y - scaledHeight/2, scaledWidth, scaledHeight, H_BY_W_COLOR);

    drawRectangle(center_x - scaledWidth/2,center_y - scaledHeight*3/2 - scaledLength, scaledWidth, scaledHeight, H_BY_W_COLOR);
    drawRectangle(center_x - scaledWidth/2,center_y + scaledHeight/2 + scaledLength, scaledWidth, scaledHeight, H_BY_W_COLOR);

    drawRectangle(center_x - scaledWidth/2 - scaledLength - scaledWidth,
        center_y - scaledHeight/2,
        scaledWidth, scaledHeight, H_BY_W_COLOR);

    drawRectangle(center_x + scaledWidth/2 + scaledLength,
        center_y - scaledHeight/2,
        scaledWidth, scaledHeight, H_BY_W_COLOR);

    drawRectangle(center_x + scaledWidth/2, center_y - scaledHeight/2, scaledLength, scaledHeight, H_BY_L_COLOR);
    drawRectangle(center_x - scaledWidth/2 - scaledLength, center_y - scaledHeight/2, scaledLength, scaledHeight, H_BY_L_COLOR);

    drawRectangle(center_x - scaledWidth/2, center_y - scaledHeight/2 - scaledLength, scaledWidth, scaledLength, W_BY_L_COLOR);
    drawRectangle(center_x - scaledWidth/2, center_y + scaledHeight/2, scaledWidth, scaledLength, W_BY_L_COLOR);

    if (!upperLeftSwap) {
        drawRectangle(center_x - scaledWidth/2 - scaledLength - scaledHeight,
            center_y - scaledHeight/2 - scaledWidth,
            scaledHeight, scaledWidth, H_BY_W_COLOR);
        drawRectangle(center_x - scaledWidth/2 - scaledLength, center_y - scaledHeight/2 - scaledWidth, scaledLength, scaledWidth, W_BY_L_COLOR);
    } else {
        drawRectangle(center_x - scaledWidth/2 - scaledHeight,
            center_y - scaledHeight/2 - scaledWidth - scaledLength,
            scaledHeight, scaledWidth, H_BY_W_COLOR);
        drawRectangle(center_x - scaledWidth/2 - scaledHeight, center_y - scaledHeight/2 - scaledLength, scaledHeight, scaledLength, H_BY_L_COLOR);
    }

    if (!upperRightSwap) {
        drawRectangle(center_x + scaledWidth/2 + scaledLength,
            center_y - scaledHeight/2 - scaledWidth,
            scaledHeight, scaledWidth, H_BY_W_COLOR);
        drawRectangle(center_x + scaledWidth/2, center_y - scaledHeight/2 - scaledWidth, scaledLength, scaledWidth, W_BY_L_COLOR);
    } else {
        drawRectangle(center_x + scaledWidth/2,
            center_y - scaledHeight/2 - scaledWidth - scaledLength,
            scaledHeight, scaledWidth, H_BY_W_COLOR);
        drawRectangle(center_x + scaledWidth/2, center_y - scaledHeight/2 - scaledLength, scaledHeight, scaledLength, H_BY_L_COLOR);
    }

    if (!lowerLeftSwap) {
        drawRectangle(center_x - scaledWidth/2 - scaledLength - scaledHeight,
            center_y + scaledHeight/2,
            scaledHeight, scaledWidth, H_BY_W_COLOR);
        drawRectangle(center_x - scaledWidth/2 - scaledLength, center_y + scaledHeight/2, scaledLength, scaledWidth, W_BY_L_COLOR);
    } else {
        drawRectangle(center_x - scaledWidth/2 - scaledHeight,
            center_y + scaledHeight/2 + scaledLength,
            scaledHeight, scaledWidth, H_BY_W_COLOR);
        drawRectangle(center_x - scaledWidth/2 - scaledHeight, center_y + scaledHeight/2, scaledHeight, scaledLength, H_BY_L_COLOR);
    }

    if (!lowerRightSwap) {
        drawRectangle(center_x + scaledWidth/2 + scaledLength,
            center_y + scaledHeight/2,
            scaledHeight, scaledWidth, H_BY_W_COLOR);
        drawRectangle(center_x + scaledWidth/2, center_y + scaledHeight/2, scaledLength, scaledWidth, W_BY_L_COLOR);
    } else {
        drawRectangle(center_x + scaledWidth/2,
            center_y + scaledHeight/2 + scaledLength,
            scaledHeight, scaledWidth, H_BY_W_COLOR);
        drawRectangle(center_x + scaledWidth/2, center_y + scaledHeight/2, scaledHeight, scaledLength, H_BY_L_COLOR);
    }

}

function drawSymmetricPointsAndLines(relx, rely) {
    var scaledHeight = height * SCALE;
    var scaledWidth = width * SCALE;
    var scaledLength = length * SCALE;

    // Apologies for the bad variable names. These are the vertices of the box
    var leftVertexX = center_x - scaledWidth/2 - scaledLength;
    var midLeftVertexX = center_x - scaledWidth/2;
    var midRightVertexX = center_x + scaledWidth/2;
    var rightVertexX = center_x + scaledWidth/2 + scaledLength;
    var topVertexY = center_y - scaledHeight/2;
    var bottomVertexY = center_y + scaledHeight/2;

    // and the vertices we use if there are more hxl faces
    var SWAPleftVertexX = center_x - scaledWidth/2;
    var SWAPrightVertexX = center_x + scaledWidth/2;
    var SWAPtopVertexY = center_y - scaledHeight/2 - scaledLength;
    var SWAPmidTopVertexY = center_y - scaledHeight/2;
    var SWAPmidBottomVertexY = center_y + scaledHeight/2;
    var SWAPbottomVertexY = center_y + scaledHeight/2 + scaledLength;

    var voronoi = new Voronoi();
    var bbox = {xl: -50, xr: canvas.width + 50, yt: -50, yb: canvas.height + 50};
    try {
        voronoiDiagram = voronoi.compute(points, bbox);
        voronoiDiagramAll = voronoi.compute(allStarPoints(sourceX, sourceY), bbox);
    } catch(Exception) {
        console.log("oops");
    }

    if (voronoiDisp) {
        for (var i = 0; i < voronoiDiagramAll.edges.length; i++) {
            var edge = voronoiDiagramAll.edges[i];
            drawVoronoiLines(edge.va.x, edge.va.y, edge.vb.x, edge.vb.y, "#FF7DF0");
        }
        for (var i = 0; i < voronoiDiagram.edges.length; i++) {
            var edge = voronoiDiagram.edges[i];
            drawVoronoiLines(edge.va.x, edge.va.y, edge.vb.x, edge.vb.y, VORONOI_COLOR);
        }
    }

    var innerPolygon = [{x: midLeftVertexX, y: bottomVertexY},
        {x: leftVertexX, y: bottomVertexY},
        {x: leftVertexX, y: topVertexY},
        {x: midLeftVertexX, y: topVertexY},
        {x: midRightVertexX, y: topVertexY},
        {x: rightVertexX, y: topVertexY},
        {x: rightVertexX, y: bottomVertexY},
        {x: midRightVertexX, y: bottomVertexY}];

    if (lowerLeftSwap) {
        innerPolygon[0] = {x: SWAPleftVertexX, y: SWAPbottomVertexY};
        innerPolygon[1] = {x: SWAPleftVertexX, y: SWAPmidBottomVertexY};
    }
    if (upperLeftSwap) {
        innerPolygon[2] = {x: SWAPleftVertexX, y: SWAPmidTopVertexY};
        innerPolygon[3] = {x: SWAPleftVertexX, y: SWAPtopVertexY};
    }
    if (upperRightSwap) {
        innerPolygon[4] = {x: SWAPrightVertexX, y: SWAPtopVertexY};
        innerPolygon[5] = {x: SWAPrightVertexX, y: SWAPmidTopVertexY};
    }
    if (lowerRightSwap) {
        innerPolygon[6] = {x: SWAPrightVertexX, y: SWAPmidBottomVertexY};
        innerPolygon[7] = {x: SWAPrightVertexX, y: SWAPbottomVertexY};
    }

    if (fadeDisp && starEdgesDisp) {
        fadeOutside(points, innerPolygon, fade);
    } else if (fadeDisp) {
        fadeEverything(fade);
    }

    if (starEdgesDisp) {
        drawStarPerimeter(points[0].x, points[0].y, innerPolygon[7].x, innerPolygon[7].y);
        drawStarPerimeter(points[0].x, points[0].y, innerPolygon[0].x, innerPolygon[0].y);
        for (var k = 1; k < innerPolygon.length; k++) {
            drawStarPerimeter(points[k].x, points[k].y, innerPolygon[k-1].x, innerPolygon[k-1].y);
            drawStarPerimeter(points[k].x, points[k].y, innerPolygon[k].x, innerPolygon[k].y);
        }
    }

    for (var j = 0; j < 8; j++) {
        drawPoint(points[j].x, points[j].y, j % 2 == 0);
    }
}

function starPoints(relx, rely) {
    var allPoints = starPointsRegular(relx, rely);
    var swapPoints = starPointsSwap(relx, rely);

    if (lowerLeftSwap) {
        allPoints[1] = swapPoints[1];
    }
    if (upperLeftSwap) {
        allPoints[3] = swapPoints[3];
    }
    if (upperRightSwap) {
        allPoints[5] = swapPoints[5];
    }
    if (lowerRightSwap) {
        allPoints[7] = swapPoints[7];
    }

    return allPoints;
}

function allStarPoints(relx, rely) {
    var allPoints = starPointsRegular(relx, rely);
    var swapPoints = starPointsSwap(relx, rely);

    for (var i = 0; i < swapPoints.length; i++) {
        if (allPoints.indexOf(swapPoints[i])) {
            allPoints.push(swapPoints[i]);
        }
    }

    return allPoints;
}

function starPointsRegular(relx, rely) {
    var scaledHeight = height * SCALE;
    var scaledWidth = width * SCALE;
    var scaledLength = length * SCALE;

    return [{x:center_x + relx, y:center_y + rely + scaledHeight + scaledLength}, // F
        {x:center_x-(scaledHeight+scaledWidth)/2-scaledLength-rely, y:center_y+(scaledHeight+scaledWidth)/2+relx}, // E
        {x:center_x-scaledWidth-scaledLength-relx, y:center_y-rely}, //D
        {x:center_x-(scaledHeight+scaledWidth)/2-scaledLength+rely, y:center_y-(scaledHeight+scaledWidth)/2-relx}, // C
        {x:center_x+relx, y:center_y-scaledHeight-scaledLength+rely}, // B
        {x:center_x+(scaledHeight+scaledWidth)/2+scaledLength-rely, y:center_y-(scaledHeight+scaledWidth)/2+relx}, // I
        {x:center_x+scaledWidth+scaledLength-relx, y:center_y-rely}, // H
        {x:center_x+(scaledHeight+scaledWidth)/2+scaledLength+rely, y:center_y+(scaledHeight+scaledWidth)/2-relx}]; // G
}

function starPointsSwap(relx, rely) {
    var scaledHeight = height * SCALE;
    var scaledWidth = width * SCALE;
    var scaledLength = length * SCALE;

    return [{x:center_x + relx, y:center_y + rely + scaledHeight + scaledLength}, // F
        {x:center_x-(scaledHeight+scaledWidth)/2-rely, y:center_y+(scaledHeight+scaledWidth)/2+scaledLength+relx}, // E
        {x:center_x-scaledWidth-scaledLength-relx, y:center_y-rely}, //D
        {x:center_x-(scaledHeight+scaledWidth)/2+rely, y:center_y-(scaledHeight+scaledWidth)/2-scaledLength-relx}, // C
        {x:center_x+relx, y:center_y-scaledHeight-scaledLength+rely}, // B
        {x:center_x+(scaledHeight+scaledWidth)/2-rely, y:center_y-(scaledHeight+scaledWidth)/2-scaledLength+relx}, // I
        {x:center_x+scaledWidth+scaledLength-relx, y:center_y-rely}, // H
        {x:center_x+(scaledHeight+scaledWidth)/2+rely, y:center_y+(scaledHeight+scaledWidth)/2+scaledLength-relx}]; // G
}

function setSwapBooleans(x, y) {
    var regularPoints = starPointsRegular(x,y);
    var swapPoints = starPointsSwap(x,y);

    var scaledHeight = height * SCALE;
    var scaledWidth = width * SCALE;

    // These are some of the vertices of the box
    var leftVertexX = center_x - scaledWidth/2;
    var rightVertexX = center_x + scaledWidth/2;
    var topVertexY = center_y - scaledHeight/2;
    var bottomVertexY = center_y + scaledHeight/2;

    lowerLeftSwap = distance(swapPoints[1].x, swapPoints[1].y, leftVertexX, bottomVertexY)
        < distance(regularPoints[1].x, regularPoints[1].y, leftVertexX, bottomVertexY);

    upperLeftSwap = distance(swapPoints[3].x, swapPoints[3].y, leftVertexX, topVertexY)
        < distance(regularPoints[3].x, regularPoints[3].y, leftVertexX, topVertexY);

    upperRightSwap = distance(swapPoints[5].x, swapPoints[5].y, rightVertexX, topVertexY)
        < distance(regularPoints[5].x, regularPoints[5].y, rightVertexX, topVertexY);

    lowerRightSwap = distance(swapPoints[7].x, swapPoints[7].y, rightVertexX, bottomVertexY)
        < distance(regularPoints[7].x, regularPoints[7].y, rightVertexX, bottomVertexY);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1,2));
}

function drawPoint(x, y, dragable) {
    ctx.beginPath();
    ctx.arc(x,y,POINT_RADIUS,0,360);
    if (dragable) {
        ctx.fillStyle = WHITE;
    } else {
        ctx.fillStyle = BLACK;
    }
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawStarPerimeter(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();

    var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1,2));
    perimeter += distance / SCALE;
}

function drawVoronoiLines(x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawRectangle(x, y, width, height, color) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = color;
    ctx.strokeStyle = GRAY;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function fadeOutside(convexVertices, concaveVertices, opacity) {
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    ctx.moveTo(convexVertices[0].x, convexVertices[0].y);
    for(var i = convexVertices.length-1; i >= 0; i--) {
        ctx.lineTo(concaveVertices[i].x, concaveVertices[i].y);
        ctx.lineTo(convexVertices[i].x, convexVertices[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = "rgba(255,255,255," + opacity + ")";
    ctx.fill();
}

function fadeEverything(opacity) {
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    ctx.fillStyle = "rgba(255,255,255," + opacity + ")";
    ctx.fill();
}

function clickMouse(e) {
    var mousePos = getMousePos(canvas, e);
    for (var i = 0; i < points.length; i += 2){
        if ((mousePos.x >= points[i].x - POINT_RADIUS && mousePos.x <= points[i].x + POINT_RADIUS) &&
            (mousePos.y >= points[i].y - POINT_RADIUS && mousePos.y <= points[i].y + POINT_RADIUS)) {
            mouseIsDown = true;
            selectedPointInd = i;
        }
    }
}

function dragMouse(e) {
    var mousePos = getMousePos(canvas, e);
    if (mouseIsDown) {
        // X and Y for Top and bottom points are obvious
        var xsign = 1;
        var ysign = 1;
        var switchXy = false;
        if (selectedPointInd == 3) {
            xsign = -1;
            switchXy = true;
        } else if (selectedPointInd == 5) {
            ysign = -1;
            switchXy = true;
        } else if (selectedPointInd == 6 || selectedPointInd == 2) {
            xsign = -1;
            ysign = -1;
        } else if (selectedPointInd == 1) {
            ysign = -1;
            switchXy = true;
        } else if (selectedPointInd == 7) {
            xsign = -1;
            switchXy = true;
        }

        if (switchXy) {
            sourceY = ysign * (mousePos.x - centerPoints[selectedPointInd].x);
            sourceX = xsign * (mousePos.y - centerPoints[selectedPointInd].y);
        } else {
            sourceX = xsign * (mousePos.x - centerPoints[selectedPointInd].x);
            sourceY = ysign * (mousePos.y - centerPoints[selectedPointInd].y);
        }
    }
}

function releaseMouse(e) {
    mouseIsDown = false;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function updateCheckBoxes() {
    voronoiDisp = document.getElementById("voronoi-check").checked;
    rectColorsDisp = document.getElementById("faces-check").checked;
    starEdgesDisp = document.getElementById("star-check").checked;
    fadeDisp = document.getElementById("fade-check").checked;
}

//////////////////////////////////////////////////////////////
// Sliders                                                  //
//////////////////////////////////////////////////////////////

$(function() {
    $("#height" ).slider({
        value: 0.5,
        orientation: "horizontal",
        range: "min",
        min: 0.01,
        max: 1,
        animate: true,
        step: 0.01,
        slide: function (event, ui) {
            $("#heightAmount" ).val(ui.value);
            height = ui.value;
        }
    });
});

$(function() {
    $("#width" ).slider({
        value: 0.5,
        orientation: "horizontal",
        range: "min",
        min: 0.01,
        max: 1,
        step: 0.01,
        animate: true,
        slide: function (event, ui) {
            $("#widthAmount" ).val(ui.value);
            width = ui.value;
        }
    });
});

$(function() {
    $("#length" ).slider({
        value: 0.5,
        orientation: "horizontal",
        range: "min",
        min: 0.01,
        max: 1,
        step: 0.01,
        animate: true,
        slide: function (event, ui) {
            $("#lengthAmount" ).val(ui.value);
            length = ui.value;
        }
    });
});

$(function() {
    $("#fade" ).slider({
        value: 0.85,
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 1,
        step: 0.05,
        animate: true,
        slide: function (event, ui) {
            $("#fadeAmount" ).val(ui.value);
            fade = ui.value;
        }
    });
});
