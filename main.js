let map = document.getElementById("map")
let pinpointModal = document.getElementById("pinpointModal")
let pinpointForm = document.getElementById("pinpointForm")
let nameInput = document.getElementById("nameInput")
let btnPinClose = document.getElementById("btnPinClose")
let btnConnClose = document.getElementById("btnConnClose")
let connectModal = document.getElementById("connectModal")
let connectForm = document.getElementById("connectForm")
let distanceInput = document.getElementById("distanceInput")
let modeSelect = document.getElementById("modeSelect")
let instructionModal = document.getElementById("instructionModal")
let btnModalClose = document.getElementById("btnModalClose")

let isConnect = false
let fromConnectId
let toConnectId
let rectFrom

let isInstructionClose = localStorage.getItem("isClosed") || false

if(isInstructionClose == "true"){
    instructionModal.classList.add("hide")
}

let pinpoints = JSON.parse(localStorage.getItem("pinpoints")) || []
let connections = JSON.parse(localStorage.getItem("connections")) || []

let savedX
let savedY

function screenToSvgCoords(screenX, screenY) {
    const pt = map.createSVGPoint()
    pt.x = screenX
    pt.y = screenY

    const svgCoords = pt.matrixTransform(map.getScreenCTM().inverse())
    return { x: svgCoords.x, y: svgCoords.y }
}

pinpoints.forEach(pin => { createPinpoints(pin) })

connections.forEach(connect => { createConnection(connect) })

btnPinClose.addEventListener("click",()=>{pinpointModal.classList.add("hide")})
btnModalClose.addEventListener("click",()=>{
    instructionModal.classList.add("hide")

    localStorage.setItem("isClosed", true)
})
btnConnClose.addEventListener("click",()=>{
    connectModal.classList.add("hide")
    isActive = false
})

map.addEventListener("dblclick", (e) => {
    const titik = screenToSvgCoords(e.clientX, e.clientY)
    savedX = titik.x
    savedY = titik.y

    pinpointModal.style.left = e.clientX - 85 + "px"
    pinpointModal.style.top = e.clientY - 105 + "px"
    pinpointModal.classList.remove("hide")
})

pinpointForm.addEventListener("submit", (e) => {
    e.preventDefault()

    let newPinpoint = {
        id: pinpoints.length == 0 ? 1 : pinpoints[pinpoints.length - 1].id + 1,
        x: savedX,
        y: savedY,
        name: nameInput.value
    }

    createPinpoints(newPinpoint)
    pinpoints.push(newPinpoint)

    localStorage.setItem("pinpoints", JSON.stringify(pinpoints))

    pinpointModal.classList.add("hide")
})

let isActive = false
connectForm.addEventListener("submit", (e) => {
    e.preventDefault()

    let newConnect = {
        id: connections.length == 0 ? 1 : connections[connections.length - 1].id + 1,
        from_id: fromConnectId,
        to_id: toConnectId,
        mode: modeSelect.value
    }

    connections.push(newConnect)

    createConnection(newConnect)
    localStorage.setItem("connections", JSON.stringify(connections))

    connectModal.classList.add("hide")
})

function createPinpoints(pinpoin) {
    let pinpointEl = createElement("image", {
        x: pinpoin.x - 22,
        y: pinpoin.y - 45,
        width: 50,
        height: 50,
        href: "asset/pinpoint.svg"
    })

    let g = createElement("g", {
        transform: `translate(${pinpoin.x - 60}, ${pinpoin.y - 70})`
    })
    let rect = createElement("rect", {
        width: "120", height: "25", fill: "white", stroke: "black", rx: "5", ry: "5"
    })
    let text = createElement("text", {
        fill: "black", y: "17", x: "6"
    })
    text.textContent = pinpoin.name
    let btnConnect = createElement("image", {
        href: "asset/connection.svg", width: "20", height: "20", x: "70", y: "3"
    })
    let btnTrash = createElement("image", {
        href: "asset/trash.svg", width: "20", height: "20", x: "95", y: "3"
    })

    pinpoin.element = pinpointEl

    g.append(rect)
    g.append(text)
    g.append(btnConnect)
    g.append(btnTrash)

    btnTrash.addEventListener("click", () => {
        pinpointEl.remove()
        g.remove()

        let pinIndex = pinpoints.findIndex(pin => pin.id == pinpoin.id)
        let pin = pinpoints[pinIndex]

        let connectToDeletes = connections.filter(conn => conn.from_id == pin.id || conn.to_id == pin.id)
        connectToDeletes.forEach(conn => {
            conn.line.remove()
            conn.distance.remove()

            let connectIndex = connections.findIndex(connect => connect.id == conn.id)
            connections.splice(connectIndex, 1)
        })

        pinpoints.splice(pinIndex, 1)
        localStorage.setItem("pinpoints", JSON.stringify(pinpoints))
    })

    btnConnect.addEventListener("click", () => {
        if (isConnect == false) {
            isConnect = true
            rect.classList.add("active")
            fromConnectId = pinpoin.id
            rectFrom = rect
        } else {
            toConnectId = pinpoin.id

            let fromConnect = pinpoints.find(pin => pin.id == fromConnectId)
            let toConnect = pinpoints.find(pin => pin.id == toConnectId)

            connectModal.style.left = ((fromConnect.x + toConnect.x) / 2) - 130 + "px"
            connectModal.style.top = ((fromConnect.y + toConnect.y) / 2) + "px"
            connectModal.classList.remove("hide")

            isConnect = false
            rectFrom.classList.remove("active")
        }
    })

    map.append(pinpointEl)
    map.append(g)
}

let activeConnectionId = null
function createConnection(connection) {
    let fromConnect = pinpoints.find(pin => pin.id == connection.from_id)
    let toConnect = pinpoints.find(pin => pin.id == connection.to_id)

    let line = createElement("line", {
        x1: fromConnect.x,
        y1: connection.mode == "train" ? fromConnect.y + 10 : (connection.mode == "bus" ? fromConnect.y - 10 : fromConnect.y),
        x2: toConnect.x,
        y2: connection.mode == "train" ? toConnect.y + 10 : (connection.mode == "bus" ? toConnect.y - 10 : toConnect.y),
        stroke: connection.mode == "train" ? "#33E339" : (connection.mode == "bus" ? "#A83BE8" : "#000000"),
        "stroke-width": 4
    })

    let text = createElement("text", {
        x: (fromConnect.x + toConnect.x) / 2,
        y: connection.mode == "train" ? ((fromConnect.y + toConnect.y) / 2) + 5 : (connection.mode == "bus" ? ((fromConnect.y + toConnect.y) / 2) - 5 : ((fromConnect.y + toConnect.y) / 2)),
        fill: connection.mode == "train" ? "#33E339" : (connection.mode == "bus" ? "#A83BE8" : "#000000")
    })
    text.textContent = distanceInput.value

    connection.line = line
    connection.distance = text

    map.append(line)
    map.append(text)

    line.addEventListener("click", () => {
        connections.forEach(conn => {
            conn.line.classList.remove("active")
        })

        line.classList.add("active")
        activeConnectionId = connection.id
    })
}

document.addEventListener("keydown", (e) => {
    if ((e.key === "Backspace" || e.key === "Delete") && activeConnectionId !== null) {

        const index = connections.findIndex(conn => conn.id === activeConnectionId)
        if (index === -1) return

        connections[index].line.remove()
        connections[index].distance.remove()

        connections.splice(index, 1)
        localStorage.setItem("connections", JSON.stringify(connections))

        activeConnectionId = null
    }
})

function createElement(elementName, attributes) {
    let el = document.createElementNS("http://www.w3.org/2000/svg", elementName)

    if (!attributes) return el

    let attributeKeys = Object.keys(attributes)
    attributeKeys.forEach(key => {
        el.setAttribute(key, attributes[key])
    })

    return el
}