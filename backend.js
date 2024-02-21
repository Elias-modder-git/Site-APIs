const http = require('http')
const path = require('path')

const express =  require('express')
const fs = require("fs");
var session = require('express-session')
const moment = require("moment-timezone");
const translate = require('translate-google-api');
const Logins = fs.readFileSync('./usuarios.json');
const keyprem = JSON.parse(Logins);
var { LetradaMusica, ytSearch, gerarpessoas, GDriveDl, ssweb, PlayStoreSearch } = require('./scrapers/scraper.js');
const app = express()
const server = http.createServer(app)
app.use(express.json());
app.use(express.urlencoded());
app.use(session({secret:"abc"}));

   // configuraçoes
   app.set('port', process.env.PORT || 3000)


// secção de login
app.use('/acesso-restrito/*', (req, res, next) => {
    if( req.session.nome ){
        next();
    }else{
        res.redirect('/index.html')
    }
      });


      // artigos estaticos
app.use(express.static(path.join(__dirname, 'public')))

//start do server
server.listen(app.get('port'), () => {
    console.log('server na porta', app.get('port'))
   
   
})

async function puxar(url) {
he = await fetch(url).then(c => c.json())
 return he
}

function ping() {
  const speed = require('performance-now');
  const timestampm = speed();
  const latency = speed() - timestampm;
  const ms = latency.toFixed(4);
    return ms
}

function muptime(seconds){
function pad(s){
return (s < 10 ? '0' : '') + s;
}
var hours = Math.floor(seconds / (60*60));
var minutes = Math.floor(seconds % (60*60) / 60);
var seconds = Math.floor(seconds % 60);
return 'Horas: ' + pad(hours) + ' : ' + 'Minutos: ' + pad(minutes) + ' : ' + 'Segundos: ' +  pad(seconds)
}

function ApiRegistro(req, res, next) {
const nome = req.query.nome;
const senha = req.query.senha;
const ApiKeyA = keyprem.find(key => key.nome === nome);
const ApiKeyB = keyprem.find(key => key.senha === senha);
if (!nome) {
return res.status(401).json({ message: '⚠️ falta do parâmetro nome - coloque o paramentro nome.' });
}
if (!senha) {
return res.status(401).json({ message: '⚠️ falta do parâmetro senha - coloque o paramentro senha.' });
}
if (!ApiKeyA) {
return res.status(401).json({ message: 'SEJA BEM VINDO(A) AO SITE DE RESET APIs ✔️\n\nNÃO ENCONTREI SEU NOME DE USUÁRIO E NEM A SENHA CADASTRADA NO MEU BANCO DE DADOS!!, POR GENTILEZA REVISE A SENHA E O NOME DE USUÁRIO CASO ESTEJA ERRADO ARRUME OU SE N TIVER CONTA CRIE UMA!!' });
}
if (!ApiKeyB) {
return res.status(401).json({ message: 'SEJA BEM VINDO(A) AO SITE DE RESET APIs ✔️\n\nNÃO ENCONTREI SEU NOME DE USUÁRIO E NEM A SENHA CADASTRADA NO MEU BANCO DE DADOS!!, POR GENTILEZA REVISE A SENHA E O NOME DE USUÁRIO CASO ESTEJA ERRADO ARRUME OU SE N TIVER CONTA CRIE UMA!!' });
}
next();
}

// secção de login 2


app.post('/login',(req, res) => {
    const usuarioscad =   fs.readFileSync('./usuarios.json')
    const usuariosparse = JSON.parse(usuarioscad)
    

    var nome = req.body.nomes
    var senha = req.body.senha


        for( var umUsuario of usuariosparse) {
            if(nome == umUsuario.nome && senha == umUsuario.senha ){
                    req.session.nome = umUsuario
                    res.send('conectado')
                    return
            }
                
            
        }
        res.send('falhou')
    
})

//registro

app.get('/registrar',(req, res) => {
nome = req.query.nome
senha = req.query.senha
if (!nome) { return res.status(401).json({ message: '⚠️ falta do parâmetro nome - coloque o paramentro nome.' });}
if (!senha) { return res.status(401).json({ message: '⚠️ falta do parâmetro senha - coloque o paramentro senha.' });}
const now = new Date();
keyprem.push({
nome: nome,
senha: senha,
});
fs.writeFileSync('./usuarios.json', JSON.stringify(keyprem))
res.json(`VOLTE PARA A TELA DE LOGIN E PÕE O USUÁRIO: ${nome} E A SENHA: ${senha}`)
console.log(`Usuário: ${nome}\nSenha: ${senha}`)
});


//rotas

app.get('/ip', ApiRegistro, async (req, res) => {
ip = req.query.ip;
if(!ip)return res.json({
status:false,
motivo:'Coloque o parâmetro: ip'
})
token = req.query.token;
auu = await puxar(`https://ipapi.co/${ip}/json`)
res.json({
resultado: {
criador: `@elias_grubert_2023`,
ip: `${ip}`,
cidade: `${auu.city}`,
regiao: `${auu.region}`,
regiao_código: `${auu.region_code}`,
País: `${auu.country}`,
nome_do_país: `${auu.country_name}`,
Código_do_país: `${auu.country_code}`,
país_código_iso3: `${auu.country_code_iso3}`,
país_capital: `${auu.country_capital}`,
país_tld: `${auu.country_tld}`,
código_continente: `${auu.continent_code}`,
latitude: `${auu.latitude}`,
longitude: `${auu.longitude}`,
org: `${auu.org}`,
timezone: `${auu.timezone}`,
utc_offset: `${auu.utc_offset}`,
país_calling_code: `${auu.country_calling_code}`,
moeda: `${auu.currency}`,
nome_da_moeda: `${auu.currency_name}`,
línguas: `${auu.languages}`,
área_do_país: `${auu.country_area}`,
país_população: `${auu.country_population}`,
asn: `${auu.asn}`
}
})
})

app.get('/letramusic', ApiRegistro, async (req, res) => {
const nome = req.query.nome;
LetradaMusica(nome).then(resultado => {
res.json({
criador: `@elias_grubert_2023`,
resultado
})
}).catch(e => {
res.json({erro:'Não achei, ou a api caiu'})
})	
})

app.get('/gdrive', ApiRegistro, async(req, res, next) => {
url = req.query.url
if (!url) return res.json({ status : false,  message: "Coloque o parametro: url"})
GDriveDl(url).then(data => {
res.json({
criador: `@elias_grubert_2023`,
resultado: data})
}).catch(e => {
res.json({message: `Não achei, ou a api caiu`})
})
})


app.get('/translate', ApiRegistro, async (req, res, next) => {
text = req.query.text;
ling = req.query.ling;
	if (!text ) return res.json({ status : false, message : "digite o parâmetro de texto."})  
	if (!ling ) return res.json({ status : false, message : "parâmetro de entrada: ling. Você pode ver a lista de idiomas em https://cloud.google.com/translate/docs/languages"})  
defaultLang = 'en'
tld = 'pt'
let result
try {
result = await translate(`${text}`, {
tld,
to: ling,
})
} catch (e) {
result = await translate(`${text}`, {
tld,
to: defaultLang,
})
} finally {
res.json({
status: true,
result: result[0]
})}})

app.get('/velocidade', async (req, res, next) => {
var hora = moment.tz("America/Sao_Paulo").format("HH:mm:ss");
var data = moment.tz("America/Sao_Paulo").format("DD/MM/YY");
var old = performance.now();
var neww = performance.now();
var ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB`;
var json = await (await fetch('https://api.ipify.org/?format=json')).json();
status = {
status: 'ONLINE',
uso_ram: ram,
local: 'replit.com',
ip: json.ip,
hora: hora,
data: data,
speed: ping(),
online: muptime(process.uptime()),
info:{       
criador: 'ELIAS',
whatsapp: 'https://wa.me/5544920016171'
}
}
res.json(status)
});


app.get('/index.css', function(req, res){
    res.sendFile(__dirname + "/public/css/index.css")
});

app.get('/jquery.min.js', function(req, res){
    res.sendFile(__dirname + "/public/js/jquery.min.js")
});

app.get('/bootstrap.bundle.min.js', function(req, res){
    res.sendFile(__dirname + "/public/js/bootstrap.bundle.min.js")
});

app.get('/jquery.easing.min.js', function(req, res){
    res.sendFile(__dirname + "/public/js/jquery.easing.min.js")
});

app.get('/ruang-admin.min.js', function(req, res){
    res.sendFile(__dirname + "/public/js/ruang-admin.min.js")
});

app.get('/ruang-admin.min.js', function(req, res){
    res.sendFile(__dirname + "/public/js/ruang-admin.min.js")
});
