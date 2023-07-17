/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, globalShortcut, desktopCapturer } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
import { OverlayController, OVERLAY_WINDOW_OPTS } from 'electron-overlay-window'
import fs from "fs";
import { AppTray } from './AppTray'
import { PNG } from 'pngjs';
import {handle_image} from './modules/ImageProcessor'

export interface ImageData {
  width: number
  height: number
  data: Uint8Array
}

const appName = "Sourcetree" || '디아블로 IV'

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  // import sourceMapSupport from 'source-map-support'
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

// const isDebug =
  // process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const isDebug = false

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  mainWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: 600,
    icon: getAssetPath('icon.png'),
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    ...OVERLAY_WINDOW_OPTS
  });

  addInteractiveKey()

  OverlayController.attachByTitle(
    mainWindow,
    process.platform === 'darwin' ? appName : appName,
    { hasTitleBarOnMac: true }
  )

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.setFocusable(true)

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
  mainWindow.setFocusable(true)
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

function addInteractiveKey () {
  const toggleMouseKey = 'CmdOrCtrl + Alt + X'
  const captureKey = 'CmdOrCtrl + Alt + C'
  const captureKey2 = 'CmdOrCtrl + Alt + D'
  if (!mainWindow) return;

  let isInteractable = false

  function toggleOverlayState () {

    if (!mainWindow) return;

    if (isInteractable) {
      isInteractable = false
      OverlayController.focusTarget()
      mainWindow.webContents.send('focus-change', isInteractable)
    } else {
      isInteractable = true
      OverlayController.activateOverlay()
      mainWindow.webContents.send('focus-change', isInteractable)
    }

  }

  mainWindow.on('blur', () => {
    if (!mainWindow) return;
    isInteractable = false
    mainWindow.webContents.send('focus-change', isInteractable)
  })
  const captureScreen = async () => {

    if (mainWindow){
      const captureImg = await mainWindow.webContents.capturePage(OverlayController.targetBounds)

      fs.writeFileSync('captureScreen.png', captureImg.toPNG(), 'base64');
    }
  }
  const saveScreen = async () => {
    try{
      if (mainWindow){
        const {width, height, x, y} = OverlayController.targetBounds
        const bitmapBuffer = OverlayController.screenshot()
        const png = new PNG({ width, height });
        png.data = Buffer.from(bitmapBuffer);
        // Save the PNG image to a file

        const pngBuffer = PNG.sync.write(png)
        const outputFile = 'output/output.png';
        fs.writeFileSync(outputFile, pngBuffer)
        await handle_image(outputFile);

        // const imageFromMain = {
        //   width: width,
        //   height: height,
        //   data: pngBuffer
        // }
        // // mainWindow.webContents.send('MAIN->CLIENT::buffer-captured', pngBuffer)
        // mainWindow.webContents.send('MAIN->CLIENT::image-captured', imageFromMain)
        console.log("sended_")
      }
    }catch (e){
      console.log('Error at saveScreen: ', e)
    }

  }
  globalShortcut.register(toggleMouseKey, toggleOverlayState)
  globalShortcut.register(captureKey, saveScreen)
  globalShortcut.register(captureKey2, captureScreen)
}



/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  new AppTray()
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });

})
