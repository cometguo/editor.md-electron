var fs = require('fs'),path = require('path'),util = require('./util');
const { dialog, ipcMain } = require('electron');
const file = {
	new: (mainWindow) => {
		// 未保存
		if (global.notSave) {
			dialog.showMessageBox({
				type: 'question',
				title: 'NotSave Info',
				buttons: ["Yes", "No"],
				message: 'This File Is Not Saved \nSure To Save? '
			}, (response) => {
				// YES
				if (response === 0) {
					file.save(mainWindow);
				} else {
					mainWindow.webContents.send('new', "");
					ipcMain.on('new-back', (event, msg) => {
						ipcMain.removeAllListeners('new-back');
						//global.config.fileName = null;
						util.saveConfig('default', global.config);
						mainWindow.setTitle('Markdown Editor - New File');
					});
				}
			});
		} else {
			mainWindow.webContents.send('new', "_pop_input");
			ipcMain.on('new-back', (event, msg) => {
				ipcMain.removeAllListeners('new-back');
                if (msg[0] && /^[a-zA-Z0-9\-]+$/.test(msg[0]) && msg[1]){
                    let found=0;
                    global.config.docs.map(d=>{d.key==msg[0]&&(found++)})
                    if(found)
                        event.returnValue = '错误：ID已经存在，请更换。';//TODO i18n
                    else{
                        global.config.docs.unshift({
                            name: msg[1],
                            key: msg[0],
                            theme:'default',
                            previewTheme: 'default',
                            editorTheme: "default"
                        })
                        global.config.current = msg[0];
                        global.config.currentName = msg[1];
                        util.saveConfig('default', global.config);
                        mainWindow.setTitle('Markdown Editor - '+msg[1]);
                        event.returnValue = '';
                    }
                }
                else
                    event.returnValue = '错误：请填写字母数字组成的ID。';//TODO i18n
			});
		}
	},
	open: (mainWindow) => {
		// 未保存
		if (global.notSave) {
			dialog.showMessageBox({
				type: 'question',
				title: 'NotSave Info',
				buttons: ["Yes", "No"],
				message: 'This File Is Not Saved \nSure To Save? TODO file.js 43!!!!!!!!!!!!!!!!!!'
			}, (response) => {
				// YES
				if (response === 0) {
					file.save(mainWindow);
				} else {
					dialog.showOpenDialog({
						title: "Open File",
						properties: ['openFile'],
						filters: [{
							name: 'Markdown',
							extensions: ['md']
						}]
					}, (fileName) => {
						if (fileName) {
							let savePath = fileName[0];
							mainWindow.webContents.send('open', '_pop_select');
							ipcMain.on('open-back', (event, msg) => {
								ipcMain.removeAllListeners('open-back');
								global.config.fileName = savePath;
								util.saveConfig('default', global.config);
								mainWindow.setTitle('Markdown Editor - ' + savePath);
							});
						}
					});
				}
			});
		} else {
            let docs = util.listDocs()
            mainWindow.webContents.send('open', {docs:docs});
            ipcMain.on('open-back', (event, msg) => {
                ipcMain.removeAllListeners('open-back');
                if(msg[0]!=global.config.current){
                    global.config.current = msg[0];
                    global.config.currentName = msg[1];
                    util.saveConfig('default', global.config);
                    mainWindow.setTitle('Markdown Editor - ' + msg[1]);
                    event.returnValue = util.readLocal();
                }
                else
                    event.returnValue = '====';
            });
			/*dialog.showOpenDialog({
				title: "Open File TODO file.js 72!!!!!!!!!!!!!!!!!!!!!",
				properties: ['openFile'],
				filters: [{
					name: 'Markdown',
					extensions: ['md']
				}]
			}, (fileName) => {
				if (fileName) {
					let savePath = fileName[0];
					mainWindow.webContents.send('open', util.readFile(savePath));
					ipcMain.on('open-back', (event, msg) => {
						ipcMain.removeAllListeners('open-back');
						global.config.fileName = savePath;
						util.saveConfig('default', global.config);
						mainWindow.setTitle('Markdown Editor - ' + savePath);
					});
				}
			});*/
		}
	},
	save: (mainWindow) => {
		//if (global.config.fileName) {
			mainWindow.webContents.send('save', "");
			ipcMain.on('save-back', (event, msg) => {
				ipcMain.removeAllListeners('save-back');
				if (!msg) {
					return;
				}
				fs.writeFile(util.curDoc(), msg, function (err) {
					if (err) {
						console.error(err);
					}
					global.notSave = false;
					mainWindow.setTitle('Markdown Editor - ' + global.config.current);
				})
			})
		//} else {
		//	file.saveAs(mainWindow);
		//}
	},
	saveAs: (mainWindow) => {
		mainWindow.webContents.send('save-as', "");
		ipcMain.on('save-as-back', (event, msg) => {
			ipcMain.removeAllListeners('save-as-back');
			if (!msg) {
				return;
			}
			dialog.showSaveDialog({
				filters: [{
					name: 'Markdown',
					extensions: ['md']
				}]
			}, (savedPath) => {
				if(savedPath){
					fs.writeFile(savedPath, msg, function (err) {
						if (err) {
							console.error(err);
						}
						//global.config.fileName = savedPath;
						util.saveConfig('default', global.config);
						global.notSave = false;
						mainWindow.setTitle('Markdown Editor - ' + savedPath);
					})
				}
			});
		})
	},
	importMSWord: (mainWindow) => {
		// 未保存
		if (global.notSave) {
			dialog.showMessageBox({
				type: 'question',
				title: 'NotSave Info',
				buttons: ["Yes", "No"],
				message: 'This File Is Not Saved \nSure To Save? '
			}, (response) => {
				// YES
				if (response === 0) {
					file.save(mainWindow);
				} else {
					dialog.showOpenDialog({
						title: 'Import MS Word',
						properties: ['openFile'],
						filters: [{
							name: 'Word',
							extensions: ['docx']
						}]
					}, (fileName) => {
						if (fileName) {
							let savePath = fileName[0];
							var mammoth = require("mammoth");
							mammoth.convertToMarkdown({ path: savePath })
								.then(function (result) {
									var md = result.value; // The generated HTML
									var messages = result.messages; // Any messages, such as warnings during conversion
									mainWindow.webContents.send('importMSWord', md);
									ipcMain.on('importMSWord-back', (event, msg) => {
										ipcMain.removeAllListeners('importMSWord-back');
										global.config.fileName = null;
										util.saveConfig('default', global.config);
										mainWindow.setTitle('Markdown Editor - *New File');
									});
								}).done();
						}
					});
				}
			});
		} else {
			dialog.showOpenDialog({
				title: 'Import MS Word',
				properties: ['openFile'],
				filters: [{
					name: 'Word',
					extensions: ['docx']
				}]
			}, (fileName) => {
				if (fileName) {
					let savePath = fileName[0];
					var mammoth = require("mammoth");
					mammoth.convertToMarkdown({ path: savePath })
						.then(function (result) {
							var md = result.value; // The generated HTML
							var messages = result.messages; // Any messages, such as warnings during conversion
							mainWindow.webContents.send('importMSWord', md);
							ipcMain.on('importMSWord-back', (event, msg) => {
								ipcMain.removeAllListeners('importMSWord-back');
								global.config.fileName = null;
								util.saveConfig('default', global.config);
								mainWindow.setTitle('Markdown Editor - *New File');
							});
						}).done();
				}
			});
		}
	},
	exportPdf: (mainWindow) => {
		mainWindow.webContents.send('export-pdf', "");
		ipcMain.on('export-pdf-back', (event, msg) => {
			ipcMain.removeAllListeners('export-pdf-back');
			if (!msg) {
				return;
			}
			dialog.showSaveDialog({
				title: 'Export PDF',
				filters: [{
					name: 'PDF',
					extensions: ['pdf']
				}]
			},(savedPath)=>{
				if (savedPath) {
					let localHtml= process.env['APPDATA'] + '/Editor.md/temp/docs/'+global.config.current+'/local.html';
                    while(msg.indexOf('docs\\'+global.config.current+'\\')>-1)
                        msg=msg.replace('docs\\'+global.config.current+'\\','');
                    while(msg.indexOf('docs/'+global.config.current+'/')>-1)
                        msg=msg.replace('docs/'+global.config.current+'/','');
					fs.writeFile(localHtml, util.genHtml(msg), function (err) {
						if (err) {
							console.error(err);
							return;
						}
                        
                        let dfrom = process.cwd()+'/renderer/docs/'+global.config.current,dto=process.env['APPDATA'] + '/Editor.md/temp/docs/'+global.config.current
                        fs.access(dto, (err) => {
                            if (err) {
                              // 若目标目录不存在，则创建
                              fs.mkdirSync(dto, { recursive: true });
                            }
                            fs.readdir(dfrom, (err, list) => {
                              if (err) {
                                callback(err);
                                return;
                              }
                              list.forEach((item) => {
                                const ss = path.resolve(dfrom, item);
                                fs.stat(ss, (err, stat) => {
                                  if (err) {
                                    callback(err);
                                  } else {
                                    const curSrc = path.resolve(dfrom, item);
                                    const curDest = path.resolve(dto, item);
                         
                                    if (stat.isFile()) {
                                      // 文件，直接复制
                                      fs.createReadStream(curSrc).pipe(fs.createWriteStream(curDest));
                                    }
                                  }
                                });
                              });

                                let wkhtmltox = require("./wkhtmltox");
                                wkhtmltox.wkhtmltopdf = global.wkhtmltopdf;
                                wkhtmltox.pdf(localHtml,savedPath,{
                                    "page-size":"A4"
                                }).on('end',() => {
                                    dialog.showMessageBox({
                                        type: 'info',
                                        title: 'Export Successfully!',
                                        message: 'Exported to ' + savedPath
                                    })
                                });
                            })
                        });

					})
				}
			});
			
		})
	}
}
module.exports = file;