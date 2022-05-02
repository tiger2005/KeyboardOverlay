var { app, BrowserWindow, screen, ipcMain } = require('electron');

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});
app.allowRendererProcessReuse = false;
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
app.commandLine.appendSwitch("disable-renderer-backgrounding");

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 9999,
    height: 9999,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: false,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  mainWindow .hookWindowMessage(278, function(e) {
    mainWindow.blur();
    mainWindow.focus();
    mainWindow.setEnabled(false);
    setTimeout(() => {
      mainWindow.setEnabled(true);
    }, 100);
    return true;
  })
  mainWindow.setMenu(null)
  mainWindow.setMaximizable(false)
  mainWindow.setResizable(false)
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  // mainWindow.openDevTools({mode: 'detach'});
  mainWindow.setAlwaysOnTop(true);
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  ipcMain.on('window-close', function() {
      mainWindow.close();
  })
  mainWindow.on('maximize', function () {
   mainWindow.webContents.send('main-window-max');
  })
  mainWindow.on('unmaximize', function () {
    mainWindow.webContents.send('main-window-unmax');
  })
  mainWindow.on('ready-to-show', function () {
    mainWindow.show();
  })
});