var fs = require("fs"), image = require("imageinfo");
const util = {
	randNum:(n,m) => {
		return Math.floor(Math.random()*(m-n+1)+n);
	},
	mkDefaultDir:() => {
		var fs = require('fs');
		// var basePath = process.env['APPDATA'] + '\\Exam Client\\Records\\' + userId +'\\' + examId + '\\'
		var basePath = process.env['APPDATA'] + '/Editor.md/';
		if(!fs.existsSync(basePath)){
			fs.mkdirSync(basePath)
		}
		if(!fs.existsSync(basePath+'/config')){
			fs.mkdirSync(basePath+'/config')
		}
		if(!fs.existsSync(basePath+'/temp')){
			fs.mkdirSync(basePath+'/temp')
		}
		return basePath
	},
	readConfig:(name) => {
		const configPath = global.basePath + "/config/" + name + ".cnf";
		let config = {
            current: 'default',
            currentName: 'Default',
            docs:[
            {
			name: 'Default',
			key: 'default',
			theme:'default',
			previewTheme: 'default',
			editorTheme: "default"
            }]
		};
		if(!fs.existsSync(configPath)){
			util.saveConfig(name,config);
		}else{
			config = JSON.parse(fs.readFileSync(configPath));
		}
		return config;
	},
    curDir:()=>{
        let _curDir=global.basePath+"/temp/docs/"+global.config.current;
        if (!fs.existsSync(_curDir)) fs.mkdirSync(_curDir)
        return _curDir;
    },
    delDoc:()=>{
        let _curDir=global.basePath+"/temp/docs/"+global.config.current;
        if (!fs.existsSync(_curDir)) fs.mkdirSync(_curDir)
        return _curDir;
    },
    curDoc:()=>{
        let curDocDir = util.curDir(),mdFile=curDocDir+"/local.md";
        return mdFile;
    },
	saveConfig:(name,config) => {
		const configPath = global.basePath+"/config/" + name + ".cnf";
		fs.writeFileSync(configPath, JSON.stringify(config));
	},
	readLocal:() => {
		const localPath = util.curDoc();
		let content = '';
		if(fs.existsSync(localPath)){
			content = fs.readFileSync(localPath,"utf8");
		}
		return content;
	},
    listImages:()=>{
        let path = __dirname.replace('\\js','\\docs\\'+global.config.current), files,imageList=[];
		if(!fs.existsSync(path)){
			fs.mkdirSync(path)
		}        
        files = fs.readdirSync(path),files.forEach(function (itm, index) {
            var stat = fs.statSync(path+'/' + itm);
            if (!stat.isDirectory()) {
                var ms = image(fs.readFileSync(path+'/' + itm));
                ms.mimeType && (imageList.push('docs\\'+global.config.current+'\\'+itm))
            }

        })        
        return {path:path, list:imageList};        
    },
    listDocs:()=>{
        return global.config.docs;
    },
	saveLocal:(content) => {
        let curDoc = util.curDoc();
		fs.writeFileSync(curDoc, content);
	},
	readMd:() => {
        let mdFile = util.curDoc();
		let content = '';
		if(fs.existsSync(mdFile)){
			content = fs.readFileSync(mdFile,"utf8");
		}
		return content;
	},
	readFile:(fileName) => {
		let content = '';
		if(fs.existsSync(fileName)){
			content = fs.readFileSync(fileName,"utf8");
		}
		return content;
	},
	genHtml:(content) => {
		let html = '<head>';
		html += '<meta charset="utf-8" />';
		html += '<link rel="stylesheet" href="'+global.baseUrl+'/css/editormd.css" />';
		html += '<link rel="stylesheet" href="'+global.baseUrl+'/css/katex.min.css" />';
		html += '<link rel="shortcut icon" href="" type="image/x-icon" />';
		html += '</head>';
		html += '<div class="markdown-body editormd-preview-container" previewcontainer="true" style="padding: 20px;">';
		html += content;
		html += '</div>';
		return html;
	},

}
module.exports = util;