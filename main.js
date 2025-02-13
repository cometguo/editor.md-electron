// Modules to control application life and create native browser window
//main.js
const fs = require("fs")
const tool = require('./renderer/js/tool');
global.notSave = false;//true;
global.wkhtmltopdf = __dirname + '/renderer/lib/bin/wkhtmltopdf';
const util = require('./renderer/js/util');
global.basePath = util.mkDefaultDir();
global.config = util.readConfig('default');
const port = 42495; // util.randNum(32000, 55000);
global.baseUrl = 'http://127.0.0.1:' + port;

const server = require('node-http-server');
server.deploy({
	port: port,
	root: __dirname + "/renderer",
	contentType: {
		html: 'text/html',
		css: 'text/css',
		js: 'text/javascript',
		json: 'application/json',
		txt: 'text/plain',
		jpeg: 'image/jpeg',
		jpg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		ico: 'image/x-icon',
		appcache: 'text/cache-manifest',
		woff2: "text/plain",
		md: "text/plain",
		woff: "text/plain",
		ttf: "text/plain"
	},
}, serverReady);

function serverReady(server) {
	// console.log( `Server on port ${server.config.port} is now up`);

	const {
		app,
		BrowserWindow,
		Menu,
        shell,
		ipcMain,
		dialog
	} = require('electron')

	// Keep a global reference of the window object, if you don't, the window will
	// be closed automatically when the JavaScript object is garbage collected.
	let mainWindow

	ipcMain.on('editor-init', (event, arg) => {
		const content = util.readMd();
		const local = util.readLocal();
		//if (global.config.fileName) {
			if (local === content) {
				event.returnValue = local;
			} else {
				dialog.showMessageBox({
					type: 'question',
					title: 'Reload Info',
					buttons: ["Yes", "No"],
					message: 'This File Is Modified By Another Program\nSure To Reload? '
				}, (response) => {
					// YES
					if (response === 0) {
						event.returnValue = content;
					} else {
						event.returnValue = local;
					}
				});
			}
		//} else {
		//	event.returnValue = local;
		//}
	});
    
	ipcMain.on('list-image', (event, arg) => {
        event.returnValue = util.listImages();
    })

	ipcMain.on('save-local-md', (event, arg) => {
        /*if('_del_blank_doc'==arg){
            if(global.config.current=='default')
                event.returnValue = '����default����ɾ��';
            else
                .docs.m
        }
        else{*/
            util.saveLocal(arg);
		//if (global.config.fileName) {
			let content = util.readMd();//readFile(global.config.fileName);
			if (arg === content) {
				global.notSave = false;
				mainWindow.setTitle('Markdown Editor - ' + global.config.currentName);
			} else {
				global.notSave = false;//true;
				mainWindow.setTitle('Markdown Editor - *' + global.config.currentName);
			}
		//} else {
		//	global.notSave = true;
		//	mainWindow.setTitle('Markdown Editor - *New File');
		//}
        //}
	});
    
    ipcMain.on('deepseek-chat', (event, arg) => {
		/*const win2 = new BrowserWindow({ width: 800, height: 600,webPreferences: {
				nodeIntegration: true,contextIsolation: false
			} })
        win2.loadURL('https://chat.deepseek.com')
        //win2.loadURL('https://www.deepseek.com')
        win2.webContents.openDevTools()*/
        shell.openExternal('https://chat.deepseek.com');
	});

	ipcMain.on('drag-open', (event, arg) => {
		tool.drapOpen(mainWindow,arg);
	});

	function createWindow() {
		// Create the browser window.
		mainWindow = new BrowserWindow({
			title: 'Markdown Editor',
			width: 1366,
			height: 768,
			webPreferences: {
				nodeIntegration: true
			}
		})

		const menuInfo = require('./renderer/js/menu');
		menuInfo.init(mainWindow);
		const menu = Menu.buildFromTemplate(menuInfo.template)
		Menu.setApplicationMenu(menu)

		// and load the index.html of the app.
		// mainWindow.loadFile('index.html')
		mainWindow.loadURL(global.baseUrl)
		mainWindow.webContents.on('did-finish-load', () => {
			mainWindow.webContents.send('change-theme', global.config)
		})
		// Open the DevTools.
		 mainWindow.webContents.openDevTools()

		// Emitted when the window is closed.
		mainWindow.on('closed', function () {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			mainWindow = null
		})
	}

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', createWindow)

	// Quit when all windows are closed.
	app.on('window-all-closed', function () {
		// On macOS it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (mainWindow === null) {
			createWindow()
		}
	})

	// In this file you can include the rest of your app's specific main process
	// code. You can also put them in separate files and require them here.
}
