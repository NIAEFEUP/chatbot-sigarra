/*
  CODIGO DO CHAT BOT
  */

module.exports = function(bp) {
	bp.hear({
		type: /message|text/i
	},
	(event, next) => {
		console.log("Mensagem Recebida: "+ (event.text))
		next()
    })
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
		console.log(next);
	  event.reply('#moodle')
	})

	bp.hear({
		type: /message|text/i,
		text: /erasmus (\S+) (.+)/i
	}, (event, next) => {
		var curso = event.captured[0];
		var pais = event.captured[1];
		scrapeSigarra(curso, pais, function(informacao){
			bp.messenger.sendText(event.user.id, informacao);
		})
	})

	bp.hear({
		type: /message|text/i,
		text: /erasmus (\S+)/i
	}, (event, next) => {
		var curso = event.captured[0];
		scrapeSigarra(curso, "nothing", function(informacao){
			bp.messenger.sendText(event.user.id, informacao);
		})
	})

	bp.hear({
		type: /message|text/i,
		text: /erasmus/i
	}, (event, next) => {
		bp.messenger.sendText(event.user.id, "Lista de paises que suportam o curso:\n> erasmus (sigla curso)\nLista de universidades do pais e do curso com vagas:\n> erasmus (sigla curso) (pais)");
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
	bp.hear({
        type: /message|text/i,
        text: /up|numero/i
    }, (event, next) =>{
		bp.messenger.sendText(event.user.id, 'Por favor escreve "O meu número UP é" seguido do teu número') //Explica como guardar o número Up
	})

	bp.hear({					//Função para guardar Numero  !! Ainda não 100% funcional
        text: /Meias (.+)/
    }, (event, next) => {
		var numeroUP = event.captured[0];
    	bp.messenger.sendText(event.user.id, "O número " + numeroUP + " foi guardado!")
        bp.db.kvs.set('numero_up', numeroUP)		//Guarda o número UP na DB com o Key Value numero_up

	})


	}

function scrapeSigarra(cursoUser, paisUser, callback){
	const Nightmare = require('nightmare');
	const nightmare = Nightmare({show: true, waitTimeout: 15000 }); //show: mostrar a janela do browser que esta a correr o scraper. waitTimeout: tempo maximo que o scraper pode demorar.
	var cheerio = require('cheerio');

	var cursos = ['meb', 'miegi', 'miea', 'mesg', 'mib', 'mci', 'lceemg', 'memg', 'miec', 'mieec', 'mieic', 'miem', 'miemm', 'mieq', 'mppu'];
	cursoUser = cursoUser.toString().toLowerCase();
	var ncurso = cursos.indexOf(cursoUser);
	paisUser = RemoveAccents(paisUser.toString().toLowerCase());

	if (ncurso === -1){
		callback('Nao existe um curso com essa sigla.\nExemplos: mieic, miem, mieq, ...');
		return;
	}


	var lista = [];

		nightmare.goto("https://sigarra.up.pt/feup/en/web_page.inicial") //vai a pagina inicial do sigarra
							.wait('#user')  //espera para que carregue
							.insert('#user', process.env.USER_SIGARRA )  //utilizador para login
							.insert('#pass', process.env.PASS_SIGARRA )  //pass para login
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
									$('.d', $('.dados').eq(ncurso)).each(function(x, elem) { //por cada universidade do curso a chamar a funcao
										var pais = $('.t.k', elem).eq(0).text(); //pais da universidade
										pais = pais.replace(/\n/g, "");  //retirar os newline's indesejados
										var universidade = $('.t.k', elem).eq(2).text();  //nome da universidade
										universidade = universidade.replace(/\n/g, "");  //retirar os newline's indesejados
										var vagas = $('.n', elem).eq(1).text();  //vagas da universidade
										if (paisUser === "nothing" && pais !== lista[lista.length-1]){
											lista.push(pais);
										} else if (RemoveAccents(pais.toString().toLowerCase()) == paisUser && vagas != "0"){  //se os paises coincidirem e houver vagas
											lista.push(pais + " | " + universidade + " | Vagas-" + vagas); //adicionar a lista informacao
										}
								});
								if (lista.length == 0	){
									callback("Não existem universidades com essas caracteristicas com vagas"); //Caso nao se encontrem universidades com as caracteristicas desejadas
								} else {
									callback(lista.slice(0, paisUser=='nothing'? lista.length : Math.min(lista.length, 4)).join('\n'));  //Envia a lista das universidades ou paises separados por \n
								}
							});
}

//Funcao para normalizar strings. Made by alisterlf
function RemoveAccents(str) {
  var accents    = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
  var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
  str = str.split('');
  var strLen = str.length;
  var i, x;
  for (i = 0; i < strLen; i++) {
    if ((x = accents.indexOf(str[i])) != -1) {
      str[i] = accentsOut[x];
    }
  }
  return str.join('');
}
