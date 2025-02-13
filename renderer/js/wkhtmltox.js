'use strict'

let os = require('os');
let childprocess = require('child_process');
const wkhtmltox = {
	wkhtmltopdf: 'wkhtmltopdf',
	wkhtml:(from,to,args) => {
		if(!from){
			console.error("the html url/from is null");
			return;
		}

		if(typeof(to) == "object"){
			args = to;
			to = os.tmpdir()+"/"+Date.now()+".pdf";
		}

		let options = [];
		for(var i in args){
			options.push("--"+i);
			options.push(args[i]);
		}
		options.push(from);
		options.push(to);

		let process = childprocess.spawn(wkhtmltox.wkhtmltopdf,options),ss='',Uint8ArrayToString=function(fileData){
  var dataString = "";
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
 
  return dataString

};
        
// 监听子进程的标准输出
process.stdout.on('data', (data) => {
    console.log(Uint8ArrayToString(data))
});

// 监听子进程的标准错误流
process.stderr.on('data', (data) => {
    ss+=Uint8ArrayToString(data)
});

// 子进程退出时触发的事件
process.on('close', (code) => {
    console.log(code)
});        
        

        return process.stdout;
	},
	pdf:(from,to,options) => {
		return wkhtmltox.wkhtml(from,to,options);
	}
};

module.exports = wkhtmltox;