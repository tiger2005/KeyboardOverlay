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
  const os = require("os")

  function getNativeWindowHandle_Int(win) {
      let hbuf = win.getNativeWindowHandle()
      if (os.endianness() == "LE")
          return hbuf.readInt32LE()
      else
          return hbuf.readInt32BE()
  }

  mainWindow.setMenu(null)
  mainWindow.setMaximizable(false)
  mainWindow.setResizable(false)
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  // mainWindow.openDevTools({mode: 'detach'});
  mainWindow.setAlwaysOnTop(true);
  if(process.platform === "win32")
    mainWindow .hookWindowMessage(278, function(e) {
      mainWindow.blur();
      mainWindow.focus();
      mainWindow.setEnabled(false);
      setTimeout(() => {
        mainWindow.setEnabled(true);
      }, 100);
      return true;
    });
  let windowOnReady = false;
  let requireLevel = false;
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  ipcMain.on('window-close', function() {
    mainWindow.close();
  });
  const superLevel = () => {
    if(process.platform === "win32"){
      const handleId = getNativeWindowHandle_Int(mainWindow);
      require('child_process').exec(`windowTop\\win_x64.exe ${handleId}`, {
        windowsHide: true
      }, (error, stdout) => {
        console.log("Windows API monitor quited (error: " + error + ", stdout: " + stdout + ")");
      });
    }
    else{
      mainWindow.setAlwaysOnTop(true, "screen-saver");
      mainWindow.setVisibleOnAllWorkspaces(true);
    }
  };
  ipcMain.on('window-super-top', function() {
    if(windowOnReady === true)
      superLevel();
    else
      requireLevel = true;
  });

  mainWindow.on('maximize', function () {
   // mainWindow.webContents.send('main-window-max');
  })
  mainWindow.on('unmaximize', function () {
    // mainWindow.webContents.send('main-window-unmax');
  })
  mainWindow.on('ready-to-show', function () {
    mainWindow.show();
    windowOnReady = true;
    if(requireLevel === true){
      superLevel();
      requireLevel = false;
    }
  })
});