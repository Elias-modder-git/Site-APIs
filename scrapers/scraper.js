const axios = require('axios')
const cheerio = require('cheerio')
const qs = require("qs")
const fs = require('fs-extra')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const encodeUrl = require('encodeurl');
const yts = require("yt-search")

function LetradaMusica(musica){
	return new Promise(async(resolve, reject) => {
   		axios.get('https://www.musixmatch.com/search/' + musica)
   		.then(async({ data }) => {
   		const $ = cheerio.load(data)
   		const resultado = {};
   		let limk = 'https://www.musixmatch.com'
   		const link = limk + $('div.media-card-body > div > h2').find('a').attr('href')
	   		await axios.get(link)
	   		.then(({ data }) => {
		   		const $$ = cheerio.load(data)
		   		resultado.ImagemMusic = 'https:' + $$('div.col-sm-1.col-md-2.col-ml-3.col-lg-3.static-position > div > div > div').find('img').attr('src')
		  		$$('div.col-sm-10.col-md-8.col-ml-6.col-lg-6 > div.mxm-lyrics').each(function(a,b) {
		   resultado.LetraDaMusica = $$(b).find('span > p > span').text() +'\n' + $$(b).find('span > div > p > span').text()
		   })
	   })
	   resolve(resultado)
   })
   .catch(reject)
   })
}

async function ytSearch(q) {
  return new Promise((resolve, reject) => {
  try {
  const cari = yts(q).then((data) => {
  res = data.all
  return res })
  resolve(cari)
  } catch (error) {
  reject(error)
  }
  console.log(error)
  })
  }
  
  function gerarpessoas() {
    return new Promise((resolve, reject) => {
        axios.get('https://www.invertexto.com/gerador-de-pessoas').then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);
            const secoes = ['DADOS PESSOAIS', 'NASCIMENTO', 'ENDEREÇO', 'ONLINE', 'CARTÃO DE CRÉDITO', 'CARACTERÍSTICAS FÍSICAS'];
            const resultado = [];

            secoes.forEach((secao) => {
                const secaoDados = $(`section:has(h2:contains("${secao}"))`);
                const supraDeEntrada = secaoDados.find('input[type="text"]');

                supraDeEntrada.each((index, element) => {
                   
                    const valor = $(element).val().trim();
                    
                    resultado.push({ valor: valor });
                });
            });

            
            resolve(resultado);
        }).catch((error) => {
            console.error('Ocorreu um erro ao fazer a requisição:', error);
            reject(error);
        });
    });
}

function parseFileSize(size) {
return parseFloat(size) * (/GB/i.test(size) ? 1000000 : /MB/i.test(size) ? 1000 : /KB/i.test(size) ? 1 : /bytes?/i.test(size) ? 0.001 : /B/i.test(size) ? 0.1 : 0);
}

async function GDriveDl(url) {
let id;
if (!(url && url.match(/drive\.google/i))) throw "O url fornecido está inválido.";
id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1];
if (!id) throw "Error - [ID NOT FOUND] - Possível motivo: O arquivo pode estar privado.";
let res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
    method: "post",
    headers: {
      "accept-encoding": "gzip, deflate, br",
      "content-length": 0,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      origin: "https://drive.google.com",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
      "x-client-data": "CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=",
      "x-drive-first-party": "DriveWebUi",
      "x-json-requested": "true",
    },
});
let {fileName, downloadUrl} = JSON.parse((await res.text()).slice(4));
if (!downloadUrl) throw "Limite de download de links!";
let data = await fetch(downloadUrl);
if (data.status !== 200) throw data.statusText;
return {downloadUrl, fileName, mimetype: data.headers.get("content-type")};
}

function ssweb (url, device = 'desktop')  {
		return new Promise((resolve, reject) => {
			 const base = 'https://www.screenshotmachine.com'
			 const param = {
			   url: url,
			   device: device,
			   cacheLimit: 0
			 }
			 axios({url: base + '/capture.php',
				  method: 'POST',
				  data: new URLSearchParams(Object.entries(param)),
				  headers: {
					   'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
				  }
			 }).then((data) => {
				  const cookies = data.headers['set-cookie']
				  if (data.data.status == 'success') {
					   axios.get(base + '/' + data.data.link, {
							headers: {
								 'cookie': cookies.join('')
							},
							responseType: 'arraybuffer'
					   }).then(({ data }) => {
							resolve(data)
					   })
				  } else {
					   reject()
				  }
			 }).catch(reject)
		})
   }

const PlayStoreSearch = (q) => new Promise((resolve, reject) => {
  axios.get(`https://play.google.com/store/search?q=${(q)}&c=apps`)
    .then((res) => {
      const $ = cheerio.load(res.data);
      const dados = [];
      $('.VfPpkd-aGsRMb').each((i, e) => {
        dados.push({
          nome: $(e).find('.DdYX5:first').text().trim(),
          imagem: (($(e).find('img:first').attr('srcset') ? (linkfy.find($(e).find('img:first').attr('srcset'))?.pop()?.href || $(e).find('img:first').attr('src')) : $(e).find('img:first').attr('srcset')) || $(e).find('img:last').attr('srcset') ? (linkfy.find($(e).find('img:last').attr('srcset'))?.pop()?.href || $(e).find('img:last').attr('src')) : $(e).find('img:last').attr('srcset')).trim(),
          desenvolvedor: $(e).find('.wMUdtb:first').text().trim(),
          estrelas: $(e).find('.w2kbF:first').text().trim(),
          link: 'https://play.google.com' + $(e).find('a:first').attr('href')
        });
      });
      resolve({
        status: res.status,
        criador: "elias",
        resultado: dados
      });
    })
    .catch((e) => {
      reject(e)
    });
});

module.exports = { LetradaMusica, ytSearch, gerarpessoas, GDriveDl, ssweb, PlayStoreSearch }