/*
  CODIGO DO CHAT BOT
  */

module.exports = function(bp) {
  // Listens for a first message (this is a Regex)
  // GET_STARTED is the first message you get on Facebook Messenger
	bp.hear(/GET_STARTED|hello|hi|test|hey|holla/i, (event, next) => {
    event.reply('#welcome') // See the file `content.yml` to see the block
  })

	// You can also pass a matcher object to better filter events
	bp.hear({
		type: /message|text/i,
		text: /exit|bye|goodbye|quit|done|leave|stop/i
	}, (event, next) => {
	 event.reply('#goodbye', {
		// You can pass data to the UMM bloc!
		reason: 'unknown'
	 })
	})

	bp.hear({
	  type: /message|text/i,
	  text: /feup|site/i
	}, (event, next) => {
	  event.reply('#feup')
	})

	bp.hear({
	  type: /message|text/i,
	  text: /moodle/i
	}, (event, next) => {
	  event.reply('#moodle')
	})

	bp.hear({
		type: /message|text/i,
		text: /erasmus/i
	}, (event, next) => {
		scrapeSigarra(function(informacao){
			event.reply('#fromSigarra', {
				texto: informacao })  //passar o texto tirado do site do sigarra para enviar
		})
	})

	bp.hear({
	  type: /message|text/i,
	  text: /ajuda|help/i
	}, (event, next) => {
	  event.reply('#ajuda')
	})

	bp.fallbackHandler = (event, next) => {
		if(event.type == 'message' || event.type == 'text'){
			event.reply('#fallback')
		}
	}
/*  bp.hear({
*    platform: 'facebook',
*    type: 'message',
*    text: /cat/i
*  }, (event, next) => {
*    event.reply('#cat')
*  })
*/
}

function scrapeSigarra(callback){
	const Nightmare = require('nightmare');
	const nightmare = Nightmare({show: false, waitTimeout: 15000 }); //show: mostrar a janela do browser que esta a correr o scraper. waitTimeout: tempo maximo que o scraper pode demorar.
	var cheerio = require('cheerio');

	var lista = [];

		nightmare.goto("https://sigarra.up.pt/feup/en/web_page.inicial") //vai a pagina inicial do sigarra
							.wait('#user')  //espera para que carregue
							.insert('#user', "")  //utilizador para login
							.insert('#pass', "")  //pass para login
							.click('button[title="Iniciar sessão"]')  //clicar no butao de iniciar sessao
							.wait('.nomelogin')  //esperar carregar
							.goto("https://sigarra.up.pt/feup/pt/coop_candidatura_geral.ver_vagas")  //carregar pagina dos erasmus
							.wait('.nomelogin')  //esperar carregar
							.evaluate(function() {
								return document.body.innerHTML  //retornar o html da pagina
							})
							.end()  //acabar com o processo do browser
							.then(function(html) {
								var $ = cheerio.load(html); //fazer load do html para o modulo cheerio
								$('.d' , '.dados').each(function(i, elem) {  //por cada universidade chamar a funcao
									var pais = $('.t.k', elem).eq(0).text(); //pais da universidade
									pais = pais.replace(/\n/g, "");  //retirar os newline's indesejados
									var universidade = $('.t.k', elem).eq(2).text();  //nome da universidade
									universidade = universidade.replace(/\n/g, "");  //retirar os newline's indesejados
									var vagas = $('.n', elem).eq(1).text();  //vagas da universidade

									lista[i] = pais + " | " + universidade + " | Vagas-" + vagas; //adicionar a lista informacao
								});
								callback(lista[0]);  //de momento envia a primeira universidade na lista do erasmus
							});
}
