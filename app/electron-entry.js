
const electron = require('electron');
const app = electron.app;

const settings = {
  center: true,
  width: 650,
  height: 800,
  resizable: false,
  title: 'Code Analyser',
  icon: `${__dirname}/icon.png`
};

let mainWindow = null;

function createWindow() {
  mainWindow = new electron.BrowserWindow(settings);
  mainWindow.loadURL(`file:///${__dirname}/index.html`);
  mainWindow.setMenu(null);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
