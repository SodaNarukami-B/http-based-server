'use strict'

const http = require('http');
const os = require('os');
const port = 3000;

const MAX_BUFFER = 10 * 1024 * 1024;

function sendResponse(res, code, message){
    res.writeHead(code, {
        'content-type': 'application/json',
        'X-Content-Type-Options': 'nosniff'
    })
    return res.end(JSON.stringify({
        status: code, 
        message: message
    }))
}
function logReq(req){
    console.log(`${new Date().toISOString()} - ${req.method} [ ${req.url} ]:`, req.headers);
    return
}

let dataBase = []

const router = {
    'GET /': (req, res) => {
        logReq(req);
        return sendResponse(res, 200, dataBase)
    },
    'POST /': (req, res) => {
        if(!req.headers['content-type']){
            return sendResponse(res, 400, "Content-Type header requied");
        }
        const mimeType = req.headers['content-type'].toLowerCase().split(";")[0].trim();
        if(mimeType !== "application/json"){
            return sendResponse(res, 415, "Unsupported content-type. Expected: application/json");
        }
        let body = [];
        let size = 0;
        let overflowed = false;
        
        req.on('data', chunk => {
            size += chunk.length;
            if(size > MAX_BUFFER){
                overflowed = true;
                sendResponse(res, 413, 'Buffer overflow')
                body = [];
                req.destroy();
                return
            }
            body.push(chunk);
        })
        req.on('end', () => {
            if(overflowed) return;
            if(size === 0){
                return sendResponse(res, 400, "Empty Data");
            }
            try{
                const parsed = JSON.parse(Buffer.concat(body).toString());
                if(!parsed || typeof parsed !== "object" || Array.isArray(parsed)){
                    return sendResponse(res, 400, 'Data must be a valid non-array object');
                }
                if(Object.keys(parsed).length < 1){
                    return sendResponse(res, 400, 'Object must have at least 1 field');
                }
                if(Object.values(parsed).some(value => typeof value === "string" && value.trim() === "")){
                    return sendResponse(res, 400, 'All keys must have values');
                }
                if(parsed['id']){
                    return sendResponse(res, 400, 'Object cant have system names');
                }
                let allIds = [];
                dataBase.forEach(object => {
                    allIds.push(object['id']);
                })
                let id = allIds.length? Math.max(...allIds) + 1 : 0;
                parsed['id'] = id;
                dataBase.push(parsed)
                logReq(req);
                console.log("Data Base: pushed new objects");
                return sendResponse(res, 201, "Data pushed to Data Base");
            }catch(error){
                return sendResponse(res, 400, "Invalid JSON");
            }
        })
        req.on('aborted', () => {
            return sendResponse(res, 499, 'Aborted by user');
        })
        req.on('error', err => {
            console.log("ERROR: ", err);
            return sendResponse(res, 500, "Interal Server Error");
        })
    }
}
const server = http.createServer((req, res) => {
    try{
        const url = new URL(req.url, `http://${req.headers.host || "0.0.0.0:3000"}`)
        const handler = router[`${req.method} ${url.pathname}`];
        if(handler){
            handler(req, res)
        }else{
            sendResponse(res, 404, "Not Found");
        }
    }catch(error){
        sendResponse(res, 400, "Invalid URL");
    }
})
server.listen(port, "0.0.0.0", () => {
    const net = os.networkInterfaces();
    let eth0 = [];
    let lo = [];
    Object.entries(net).forEach(([name, ifaces]) => {
        ifaces.forEach(iface => {
            if(name === "eth0" && iface.family === "IPv4" && !iface.internal){
                eth0.push({address: iface.address, mac: iface.mac})
            }
            if(name === "lo" && iface.family === "IPv4"){
                lo.push({address: iface.address, mac: iface.mac});
            }
        })
    })
    console.log("Server started on port", [3000], '\n')
    if(eth0){
        console.log(['Eth0'], 'interfaces (IPv4):');
        eth0.forEach(iface => {
            console.log(' - ', iface)
        })
    }
    if(lo){
        console.log(['lo'], 'interfaces (IPv4):')
        lo.forEach(iface => {
            console.log(' - ', iface);
        })
    }
    console.log('\n', "-".repeat(50))
})