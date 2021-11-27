import { app, BrowserWindow, dialog, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { Actions } from './models/Actions.model';
import { FFState } from './models/ffstate.model';
import { Folder } from './models/folderSetGet.model';
import { generateFilePath, Picture } from './models/picture.model';
//import { autoUpdater } from "electron-updater"
// Initialize remote module
require('@electron/remote/main').initialize();

//autoUpdater.logger = require("electron-log");
//(autoUpdater.logger as any).transports.file.level = "info";

let win: BrowserWindow = null;
let picCache = null;
let sharp = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    backgroundColor: '#6b7280',
    show: false,
    webPreferences: {
      enableBlinkFeatures: "CSSColorSchemeUARendering",
      nodeIntegration: false,
      contextIsolation: true,  // false if you want to run e2e test with Spectron
      enableRemoteModule: false, // true if you want to run e2e test with Spectron or use remote module in renderer context (ie. Angular)
      preload: path.join(__dirname, "preload.js")
    },
  });


  win.setMenu(null)
  win.setMenuBarVisibility(false)


  if (serve) {
    win.webContents.openDevTools();
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron'))
    });
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.once('ready-to-show', () => {
    win.show()
    //autoUpdater.checkForUpdatesAndNotify()
  })

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

var rxjsoperators = require("rxjs/operators");
var rxjs = require("rxjs");
const readAsObservable = rxjs.bindNodeCallback(fs.readdir);
const statAsObservable = rxjs.bindNodeCallback(fs.stat);
const readFileAsObs = rxjs.bindNodeCallback(fs.readFile);
let preloadBreak = false;

const allowedEndings = ["jpg", "png", "raw", "orf", "raf"]
var state = new FFState();


ipcMain.on('get-folder', (event, folder: Folder) => {
  var temp = dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  })
  temp.then((erg) => {
    if (!erg.canceled) {
      event.sender.send('set-folder', new Folder(folder.target, erg.filePaths[0]))
      if (folder.target === 'target') {
        state.toFolder = erg.filePaths[0]
      }
      if (folder.target === 'source') {
        state.fromFolder = erg.filePaths[0]
        readAsObservable(erg.filePaths[0]).pipe(
          rxjsoperators.map(x => (x as Array<any>).filter(x => allowedEndings.includes(x.substr(-3).toLowerCase()))),
          rxjsoperators.map(x => {
            return x.map((e) => {
              const e0 = e.split('.')
              return new Picture(e0[0], e0[1], erg.filePaths[0]);
            })
          }),
          // Zusammenfassen von Gleichen bildern mit unterschiedlichen Dateiendungen
          rxjsoperators.map((list: Array<Picture>) => {
            list.sort((a: Picture, b: Picture) => a.name.localeCompare(b.name))
            var mergedItems: Picture[];
            mergedItems = [];
            list.forEach(pic => {
              // Faster?
              //var i = mergedItems.map(x => { return x.name }).indexOf(pic.name);
              //if (i === -1) {
              const i = mergedItems.length - 1;
              if (mergedItems[i] === undefined || mergedItems[i].name !== pic.name) {
                mergedItems.push(pic);
              } else {
                mergedItems[i].types.push(pic.types[0])
                mergedItems[i].types.sort()
              }
            });
            return mergedItems;
          }),
          // Datum an Files anfügen alle durchgehen stats holen Stats ans file heften alles zusammen rausgeben
          rxjsoperators.map((files: Array<Picture>) => {
            return rxjs.merge(files.map(file => {
              return statAsObservable(generateFilePath(file, ['RAF', 'ORF'])).pipe(rxjsoperators.map((stats) => { file.stats = stats; return file; }), rxjsoperators.first())
            })).pipe(rxjsoperators.mergeMap((v) => v), rxjsoperators.take(files.length), rxjsoperators.toArray());

          }),
          rxjsoperators.mergeMap((v) => v)
        ).subscribe(
          files => {
            event.sender.send('set-files', { 'files': (files as Array<Picture>).sort((a, b) => a.stats.ctime - b.stats.ctime) })
            state.files = files as Picture[];
          }
        )
      }
    }
  })
})

ipcMain.on('load-pic', (event, arg) => {
  const NodeCache = require("node-cache");
  if (picCache === null) {
    picCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
  }
  sharp = require('sharp');
  preloadBreak = true;
  const filePath = generateFilePath(arg.pic)
  let base64Pic = picCache.get(filePath);
  if (base64Pic === undefined) {
    readFileAsObs(filePath).subscribe(
      x => {
        if (arg.fullres) {
          sharp(x).rotate().toBuffer().then(x => {
            ipcSendPic(event, x.toString('base64'), filePath, arg.pic.name, 'set-pic')
          })
        } else {
          sharp(x).rotate().resize(getMaxPixel()).toBuffer().then(x => {
            ipcSendPic(event, x.toString('base64'), filePath, arg.pic.name, 'set-pic')
          })
        }
      }
    )
  } else {
    event.sender.send('set-pic', { type: path.extname(generateFilePath(arg.pic)), name: arg.pic.name, data: base64Pic });
  }
  state.activeFile = arg.pic;
  preloadBreak = false;
  preloadNextPics();
  // Nutzlos?
  //state.activeFile = state.files[state.files.map(x => x.name).indexOf(args.name)]
  //event.sender.send('set-active', state.activeFile)
})

ipcMain.on('load-additional-pic', (event, arg) => {
  const NodeCache = require("node-cache");
  if (picCache === null) {
    picCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
  }
  sharp = require('sharp');
  preloadBreak = true;
  const filePath = generateFilePath(arg.pic)
  let base64Pic = picCache.get(filePath);
  if (base64Pic === undefined) {
    readFileAsObs(filePath).subscribe(
      x => {
        if (arg.fullres) {
          sharp(x).rotate().toBuffer().then(x => {
            ipcSendPic(event, x.toString('base64'), filePath, arg.pic.name, 'add-pic')
          })
        } else {
          sharp(x).rotate().resize(getMaxPixel()).toBuffer().then(x => {
            ipcSendPic(event, x.toString('base64'), filePath, arg.pic.name, 'add-pic')
          })
        }
      }
    )
  } else {
    event.sender.send('add-pic', { type: path.extname(generateFilePath(arg.pic)), name: arg.pic.name, data: base64Pic });
  }
  state.activeFile = arg.pic;
  preloadBreak = false;
  preloadNextPics();
})



ipcMain.on('do-action', (event, action: Actions) => {
  var current = state.files.map(x => x.name).indexOf(state.activeFile.name);
  const pic = state.files[current]
  state.files[current].types
    .filter(type => allowedEndings.includes(type.toLowerCase()))
    .forEach((type, index, array) => {
      fs.copyFile(path.join(pic.folder, pic.name + "." + type),
        path.join(state.toFolder, pic.name + "." + type), err => {
          if (err) throw err;
          state.files[current].copiedTypes.push(type);
          event.sender.send('set-files', { 'files': state.files })
        })
    })
})

function getMaxPixel() {
  return screen.getPrimaryDisplay().workAreaSize.width * 2;
}

function ipcSendPic(event, base64PicData: string, fullpath: string, name: string, channel: string): void {
  picCache.set(fullpath, base64PicData);
  event.sender.send(channel, { data: base64PicData, type: path.extname(fullpath), name: name });
  console.log(picCache.getStats());
}

function preloadNextPics() {
  const offsetActive = state.files.map(x => x.name).indexOf(state.activeFile.name)
  for (let index = -2; index < 4 && index + 1 + offsetActive >= 0 && index + 1 + offsetActive < state.files.length; index++) {
    if (preloadBreak) break;
    const pic = state.files[index + 1 + offsetActive];
    const picpath = generateFilePath(pic);
    if (!picCache.has(picpath)) {
      readFileAsObs(picpath).subscribe(
        x => {
          sharp(x).rotate().toBuffer().then(x => {
            picCache.set(picpath, x.toString('base64'));
          })
        })
    }
  }
}




