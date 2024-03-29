const shell = require('shelljs');
const fs=require('fs')
const path=require('path')
const source_dir = './'
const symbolicatecrash_dir = './'
const app = async () =>{
    process.env.DEVELOPER_DIR = '/Applications/Xcode.app/Contents/Developer'


    await sleep(500)
    const files = getAllFilesByExtension(source_dir)
    console.log(files)
    // console.log(__dirname)
    // console.log(process.cwd() )
    if (!fs.existsSync('log')) {
        fs.mkdirSync('log', { recursive: true }); // 使用 recursive 选项以递归方式创建多级目录
    }

    if(Object.keys(files).length <= 0){ console.log('不存在日志文件')}


    for (let item in files) {
        try {
           // const command =   `./symbolicatecrash ${'./' +files[item][1]}  ${ files[item][0]  || './' + item+'.dSYM'}  > log/${item}.log `
            const command =  `./symbolicatecrash ${process.cwd() + '/' + files[item][1]}  ${process.cwd() + '/' + item+'.dSYM' } > log/${ item }.log`
            console.log("执行: " +command)
            const result =  await executeShellCommandAsync(command)
            console.log(`${item} >>> log/${item}.log`)
        }catch (error){
            console.error('Error:', error.message);
        }

    }


    console.log('执行结束');
    shell.exec('open log')

}


app()



async function executeShellCommandAsync(command) {
    return new Promise((resolve, reject) => {
        shell.exec(command,(code, stdout, stderr) => {
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(stderr));
            }
        });
    });
}


function getAllFilesByExtension(dir, filesByExtension = {}) {
    const files = fs.readdirSync(dir);
    let fileList = []
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            getAllFilesByExtension(filePath, fileList);
        } else {
            const ext = path.extname(file);
            const { name } = path.parse(file);
            if (ext.toLowerCase() === '.dsym') {
                if (!fileList[name]) {
                    fileList[name] = [];
                }
                fileList[name].unshift(filePath); // Add .ips files at the beginning
            } else if ( ext === '.ips') {
                if (!fileList[name]) {
                    fileList[name] = [];
                }
                fileList[name].push(filePath); // Add .dsym files at the end
            }
        }
    });

    return fileList;
}

function sleep(timer){new Promise(resolve => setTimeout(()=>resolve(),timer))}