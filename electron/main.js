const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn, execFile, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

const logFile = path.join(app.getPath('userData'), 'debug.log');

const _log   = console.log;
const _error = console.error;

const dbPath = path.join(app.getPath('userData'), 'db', 'remember-words-db');
const dbDir = path.dirname(dbPath);

function createWindow() {
  console.log('[INFO] Creating browser window');
  mainWindow = new BrowserWindow({ width: 1000, height: 800, show: false, webPreferences: { contextIsolation: true } });
  mainWindow.loadURL('http://localhost:8080');
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  mainWindow.on('closed', () => mainWindow = null);
}

app.whenReady().then(() => {
  console.log('[INFO] User data path:', app.getPath('userData'));
  startSpringBoot();
  waitForServerReady('http://localhost:8080')
    .then(() => {
      console.log('[INFO] Server ready, launching UI');
      createWindow();
      autoUpdater.checkForUpdatesAndNotify();
    })
    .catch((err) => {
      // Read accumulated log
      let logs = '';
      try {
        logs = fs.readFileSync(logFile, 'utf-8');
      } catch (e) {
        logs = `Unable to read log: ${e.message}`;
      }
      // Show error dialog with reason and logs
      dialog.showErrorBox(
        'Application Launch Error',
        `Reason: ${err.message}\n\nLogs:\n${logs}`
      );
      app.quit();
    });
});

autoUpdater.on('update-available', () => {
  console.log('[Updater] Update available');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update available',
    message: 'A new version is available. Downloading now...'
  });
});

autoUpdater.on('update-downloaded', () => {
  console.log('[Updater] Update downloaded');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update ready',
    message: 'Install and restart now?',
    buttons: ['Yes', 'Later']
  }).then(result => {
    if (result.response === 0) autoUpdater.quitAndInstall();
  });
});

autoUpdater.on('checking-for-update', () => {
  console.log('[Updater] Checking for update...');
});

autoUpdater.on('update-not-available', () => {
  console.log('[Updater] Update not available');
});

autoUpdater.on('error', (err) => {
  console.error('[Updater] Error during update:', err);
});

autoUpdater.on('download-progress', (progress) => {
  console.log(`[Updater] Download progress: ${progress.percent.toFixed(2)}%`);
});

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbUrl = `jdbc:h2:file:${dbPath}`;

const jarName = 'remember_words-0.0.1-SNAPSHOT.jar';
let jarPath;

const isDev = !app.isPackaged;

if (isDev) {
  jarPath = path.join(__dirname, 'java', jarName);
} else {
  const resJava      = path.join(process.resourcesPath, 'java', jarName);
  const unpackedJava = path.join(process.resourcesPath, 'app.asar.unpacked', 'java', jarName);
  const contentsJava = path.join(process.resourcesPath, '..', 'java', jarName);

  if (fs.existsSync(resJava)) {
    jarPath = resJava;
  } else if (fs.existsSync(unpackedJava)) {
    jarPath = unpackedJava;
  } else if (fs.existsSync(contentsJava)) {
    jarPath = contentsJava;
  } else {
    jarPath = resJava;
  }
}

console.log = (...args) => {
  _log(...args);
  try {
    fs.appendFileSync(logFile, args.map(String).join(' ') + '\n');
  } catch (e) {
    _log('[LOG ERROR]', e);
  }
};

console.error = (...args) => {
  _error(...args);
  try {
    fs.appendFileSync(logFile, args.map(String).join(' ') + '\n');
  } catch (e) {
    _error('[LOG ERROR]', e);
  }
};

let mainWindow, springBootProcess;

function startSpringBoot() {
  console.log(`[INFO] Launching JAR at: ${jarPath}`);
  const javaCmd = process.env.JAVA_HOME
    ? path.join(process.env.JAVA_HOME, 'bin', 'java')
    : '/usr/bin/java';
  springBootProcess = spawn(javaCmd, ['-jar', jarPath], {
    env: {
      ...process.env,
      PATH: `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin`,
      JDBC_DATABASE_URL: dbUrl
    },
    stdio: 'pipe'
  });
  springBootProcess.stdout?.on('data', data => console.log(`[SpringBoot]: ${data}`));
  springBootProcess.stderr?.on('data', data => {
    console.error(`[SpringBoot ERROR]: ${data}`);
    try {
      const logPath = path.join(app.getPath('userData'), 'boot-error.log');
      fs.appendFileSync(logPath, data.toString() + '\n');
    } catch (e) {
      console.error('[LOG WRITE ERROR]', e.message);
    }
  });
  springBootProcess.on('error', err => console.error(`[SpringBoot Spawn ERROR]: ${err.message}`));
}

function waitForServerReady(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function check() {
      console.log('[DEBUG] Checking server readiness at:', url);
      http.get(url, res => {
        if (res.statusCode === 200) resolve();
        else retry();
      }).on('error', retry);
    }
    function retry() {
      if (Date.now() - start > timeout) {
        console.error('[ERROR] Timed out waiting for Spring Boot to start.');
        reject(new Error('Timeout'));
      } else {
        console.log('[DEBUG] Server not ready yet, retrying…');
        setTimeout(check, 1000);
      }
    }
    check();
  });
}

app.on('window-all-closed', () => {
  if (springBootProcess) springBootProcess.kill();
  app.quit();
});