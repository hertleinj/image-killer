const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
    send: (channel, data) => {
        console.log("From Renderer to Backend - Channel: " + channel)
        console.log(data)
        // whitelist channels
        let validChannels = ["do-action", "load-pic", "get-folder", "copy-pic"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["set-pic", "set-folder", "set-files"];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, args) => {
                console.log("From Backend to Frontend - Channel:" + channel);
                console.log(args);
                func(event, args);
            });
        }
    }
}
);
