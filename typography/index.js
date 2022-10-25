var https = require('https');
var fs = require('fs');

var download = function(url, dest) {
	return new Promise((resolve, reject) => {
		var file = fs.createWriteStream(dest);
		var request = https.get(url, function(response) {
			response.pipe(file);
			file.on('finish', function() {
				file.close();
				return resolve('success');
			});
		}).on('error', function(err) {
			fs.unlink(dest);
			console.log(err);
			return reject (err);
		});
	});
};

var url = 'https://studio.cmsmart.net/v1/typo';
var dest = './typography.json';
var baseUrl = 'https://dpeuzbvf3y4lr.cloudfront.net/typography/';

var downloadDesign = async (typo) => {
	const folder = `./designs/${typo.folder}/`;
	const targetfolder = `${baseUrl}${typo.folder}/`;
	
	await fs.promises.mkdir(folder);
	await Promise.all([
		await download(targetfolder + 'preview.png', folder + 'preview.png'),
		await download(targetfolder + 'design.json', folder + 'design.json'),
		await download(targetfolder + 'used_font.json', folder + 'used_font.json')
	]);
	console.log(typo.folder);
};

var downloadDesigns = () => {
	return new Promise((resolve, reject) => {
		fs.readFile(dest, 'utf8', (err, data) => {
			if (err){
				console.log(err);
				return reject (err);
			}
			const typos = JSON.parse(data).data;
			return resolve({flag: 1, typos});
		});
	});
};

var start = async () => {
	const res = await download(url, dest);
	if( res === 'success' ){
		res2 = await downloadDesigns();
		if( res2.flag ){
			const typos = res2.typos;
			for(i = 0; i < typos.length; i++){
				await downloadDesign(typos[i]);
			}
		}
	}
}
start();