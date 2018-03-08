/*
  CODIGO DO CHAT BOT
  */

const Nightmare = require('nightmare');
const waitTimeInterval = 1000;
const tipo= 'image'
const url_feup= 'https://i.imgur.com/ACXGsNC.jpg'
const url_fmup= 'https://i.imgur.com/Xp68s5h.jpg'
const _ = require('lodash')


listaDeCursos = []
cursos = undefined
faculdades = undefined
cursosCarregados = false

let nightmareCursos = Nightmare({show: false, waitTimeout: 15000 });

nightmareCursos.goto('https://ni.fe.up.pt/tts/api/courses')
        .evaluate(function() {
            return document.body.innerText
        })
        .end()
        .then(function(texto) {
            listaDeCursos = JSON.parse(texto)
            cursos = Array(Math.max.apply(Math, listaDeCursos.map(function(curso){return curso.faculty_id;})))
            faculdades = new Array(cursos.length)

            listaDeCursos.forEach(function(curso){
                if(typeof cursos[curso.faculty_id] === 'undefined'){
                    cursos[curso.faculty_id] = new Array();
                    faculdades[curso.faculty_id] = curso.plan_url.substring(curso.plan_url.indexOf('up.pt/')+6, curso.plan_url.indexOf('/pt/cur'))

                }
                cursos[curso.faculty_id].push( { name: curso.name, acronym : curso.acronym } ); //sera que incluo o tipo??
            });

            console.log('Lista de cursos recebida a partir do TTS')
            console.log('Existem ' + listaDeCursos.length + ' cursos')
            cursosCarregados = true
        });

module.exports = function(bp) {

	bp.middlewares.load()

	bp.hear({
		type: /message|text/i
	},
	(event, next) => {
		console.log("(" + event.user.id + ") " + event.user.first_name + " " + event.user.last_name + ": "+ (event.text))
		next()
	})

	// Listens for a first message (this is a Regex)
	// GET_STARTED is the first message you get on Facebook Messenger

	bp.hear(/GET_STARTED|test|hey|holla/i, (event, next) => {
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

//	bp.hear({
//	  type: /message|text/i,
//	  text: /feup|site/i
//	}, (event, next) => {
//	  event.reply('#feup')
//	})

	bp.hear({
	  type: /message|text/i,
	  text: /moodle/i
	}, (event, next) => {
		console.log(next);
	  event.reply('#moodle')
	})

	bp.hear({
	  type: /message|text/i,
	  text: /ajuda|help/i
	}, (event, next) => {
	  event.reply('#ajuda')
	})

	bp.hear({
		type: /message|text/i,
		text: /cursos/i
	}, (event, next) => {

		mostrarCursos(event.text.split(' '), function(param){ bp.messenger.sendText(event.user.id, param)})  //passar o texto tirado do site do sigarra para enviar
	})

	bp.hear({
	        type: /message|text/i,
        text: /numero/i
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


    bp.hear({
        type: /message|text/i,
        text: /ementa/i
    }, (event, next) => {
        event.reply('#ementa')
})

    bp.hear({
        type: 'quick_reply',
        text: 'CANTINA_FEUP'
    },(event, next) => {
        bp.messenger.sendAttachment(event.user.id,tipo,url_feup)
})

    bp.hear({
        type: 'quick_reply',
        text: 'CANTINA_FMUP'
    },(event, next) => {
        bp.messenger.sendAttachment(event.user.id,tipo,url_fmup)
})

	bp.fallbackHandler = (event, next) => {
		if(event.type == 'message' || event.type == 'text'){
			event.reply('#fallback')
		}
	}



  const utterances = {
    good: /good|great|fine|ok|excellent|fantastic/i,
    bad: /bad|sad|not good|not great|bof/i,
    stop: /stop|cancel|abort/i
  }

  const variants = {
    feeling_good: () => _.sample(['Glad to hear that!', 'Fantastic!', 'Yay!']),
    feeling_bad: () => _.sample(['So sorry to hear that', ':('])
  }

  bp.hear(utterances.stop, (event, next) => {
    const convo = bp.convo.find(event)
    convo && convo.stop('aborted')
  })

  bp.hear(/hello/i, (event, next) => {

    const txt = txt => bp.messenger.createText(event.user.id, txt)

    bp.convo.start(event, convo => {

      convo.threads['default'].addMessage(txt('Hello!'))
      convo.threads['default'].addQuestion(txt('How are you?'), [
        {
          pattern: utterances.good,
          callback: () => {
            convo.set('feeling', 'good')
            convo.say(txt(variants.feeling_good()))
            convo.switchTo('age')
          }
        },
        {
          pattern: utterances.bad,
          callback: () => {
            convo.set('feeling', 'bad')
            convo.say(txt(variants.feeling_bad()))
            convo.say(txt('Anyway..!'))
            convo.switchTo('age')
          }
        },
        {
          default: true,
          callback: () => {
            // Example of sending a custom message other than text
            const imageMessage = bp.messenger.createAttachment(event.user.id, 'image', 'https://s3.amazonaws.com/botpress-io/images/grey_bg_primary.png')
            convo.say(imageMessage)

            // Order of messages are preserved, i.e. this message will show up after the image has been sent
            convo.say(txt('Sorry I dont understand'))

            // Repeats the last question / message
            convo.repeat()
          }
        }
      ])

      convo.createThread('age')
      convo.threads['age'].addQuestion(txt('What is your age?'), [
        {
          pattern: /(\d+)/i,
          callback: (response) => { // Using the response event
            convo.set('age', response.match) // Captured group is stored in event
            convo.say(txt('Got your age. ' + response.match + ' is pretty old!'))
            convo.next()
          }
        },
        {
          default: true,
          callback: () => {
            convo.say(txt('Hrm.. Im expecting a number!'))
            convo.repeat()
          }
        }
      ])

      convo.on('done', () => {
        convo.say(txt(`So... you are feeling ${convo.get('feeling')} and you are ${convo.get('age')} years old.`))
        convo.say(txt('Thats great!'))
      })

      convo.on('aborted', () => {
        convo.say(txt('You aborted this conversation. Bye!'))
      })

    })

  })


	bp.hear(/erasmus/i, (event, next) => {

    const txt = txt => bp.messenger.createText(event.user.id, txt)

    bp.convo.start(event, convo => {

			convo.threads['default'].addMessage(txt('Para sair desta conversa escreve "cancel".'))
      convo.threads['default'].addQuestion(txt('Erasmus para que curso? (sigla curso)'), [
        {
          pattern: /(\w+)/i,
          callback: (response) => {
            convo.set('curso', response.match)
            convo.switchTo('pais')
          }
        },
        {
          default: true,
          callback: () => {
            convo.say(txt('Desculpa, isso não parece a sigla de um curso'))
            convo.repeat()
          }
        }
      ])

      convo.createThread('pais')
      convo.threads['pais'].addQuestion(txt('E para que pais? (Para a lista de paises disponiveis do curso responde "pais")'), [
        {
          pattern: /pais/i,
          callback: (response) => { // Using the response event
            convo.set('pais', response.text) // Captured group is stored in event
            convo.say(txt('A procurar pelos paises com erasmus para o curso ' + convo.get('curso')))
						scrapeSigarra(convo.get('curso'), 'nothing' , function(informacao){convo.say(txt(informacao))})
            convo.repeat()
          }
        },
        {
          default: true,
          callback: (response) => {
						convo.set('pais', response.text)
            convo.say(txt(`A procurar por erasmus em ${convo.get('pais')} para o curso ${convo.get('curso')}`))
						scrapeSigarra(convo.get('curso'), convo.get('pais') , function(informacao){
								for (let i = 0; i < informacao.length; i++){
									convo.say(txt(informacao[i]))}})
            convo.next()
          }
        }
      ])

      convo.on('done', () => {
        convo.say(txt('Espero que tenha ajudado!'))
				convo.stop()
      })

      convo.on('aborted', () => {
        convo.say(txt('Foi cancelada a procura por erasmus'))
				convo.stop()
      })

    })

  })

}

function mostrarCursos(partes, callback){
	let nightmare = Nightmare({show: false, waitTimeout: 15000 }); //show: mostrar a janela do browser que esta a correr o scraper. waitTimeout: tempo maximo que o scraper pode demorar.

    if(!cursosCarregados){
        callback('Ainda nao carreguei os cursos fam squad')
        return;
    }

	switch(partes.length){
		case 1:
			callback('Escreve \'cursos faculdade\' para veres os cursos por faculdade')
			let mensagem_zero = 'Tens disponivel as seguintes:\n'
			faculdades.forEach(function(faculdade){
				mensagem_zero += faculdade + '\n'
			})
			callback(mensagem_zero)
			break
		case 2:
			let indiceFaculdade = faculdades.indexOf(partes[1])
			if(indiceFaculdade == -1){
				callback('Nao conheco a faculdade ' + partes[1] + '\nPor favor tenta outra vez')
			}
			else{
				let mensagem = 'Estes sao os cursos disponiveis:\n'
				cursos[indiceFaculdade].forEach(function(curso) {
					if((mensagem.length + curso.acronym.length + curso.name.length + 4) <= 300){
						mensagem += curso.acronym + ' - ' + curso.name + '\n'
					}
					else{
						callback(mensagem)
						mensagem = curso.acronym + ' - ' + curso.name + '\n'
					}
				} )
			}
				break
			default:
				console.log('lmao')

		}
}


function scrapeSigarra(cursoUser, paisUser, callback){

    if(!cursosCarregados){
        callback('Eu gosto e do verao')
        return;
    }

	var cheerio = require('cheerio');

	let nightmare = Nightmare({show: false, waitTimeout: 15000 }); //show: mostrar a janela do browser que esta a correr o scraper. waitTimeout: tempo maximo que o scraper pode demorar.

	cursoUser = cursoUser.toString().toUpperCase();
	paisUser = RemoveAccents(paisUser.toString().toLowerCase());

	let ncurso = -1;
	let nomeCurso = "";
	let cursosFeup = cursos[faculdades.indexOf('feup')];

	for (let i = 0; i < cursosFeup.length; i++){
		if (cursoUser == cursosFeup[i].acronym){
			nomeCurso = cursosFeup[i].name;
			break;
		}
	}

	if (nomeCurso === ""){
		callback(['Nao existe um curso com essa sigla.\nExemplos: mieic, miem, mieq, ...']);
		return;
	}

	var lista = [];

		nightmare.goto('https://sigarra.up.pt/feup/en/web_page.inicial') //vai a pagina inicial do sigarra
							.wait('#user', waitTimeInterval)  //espera para que carregue
							.insert('#user', process.env.USER_SIGARRA )  //utilizador para login
							.insert('#pass', process.env.PASS_SIGARRA )  //pass para login
							.click('button[title="Iniciar sessão"]')  //clicar no butao de iniciar sessao
							.wait('.nomelogin', waitTimeInterval)  //esperar carregar
							.goto("https://sigarra.up.pt/feup/pt/coop_candidatura_geral.ver_vagas")  //carregar pagina dos erasmus
							.wait('.nomelogin', waitTimeInterval)  //esperar carregar
							.evaluate(function() {
								return document.body.innerHTML  //retornar o html da pagina
							})
							.end()  //acabar com o processo do browser
							.then(function(html) {

								var $ = cheerio.load(html); //fazer load do html para o modulo cheerio

									$('h2', '#conteudoinner').each(function(i, cur){
										//console.log(cur);
										if ($(cur).text() === nomeCurso){
											ncurso = i;
										}
									});

									$('.d', $('.dados').eq(ncurso)).each(function(x, elem) { //por cada universidade do curso a chamar a funcao
										var pais = $('.t.k', elem).eq(0).text(); //pais da universidade
										pais = pais.replace(/\n/g, "");  //retirar os newline's indesejados
										var universidade = $('.t.k', elem).eq(2).text();  //nome da universidade
										universidade = universidade.replace(/\n/g, "");  //retirar os newline's indesejados
										var vagas = $('.n', elem).eq(1).text();  //vagas da universidade
										if (paisUser === "nothing" && pais !== lista[lista.length-1]){
											lista.push(pais);
										} else if (RemoveAccents(pais.toString().toLowerCase()) == paisUser && vagas != "0"){  //se os paises coincidirem e houver vagas
											lista.push(universidade + " | Vagas-" + vagas); //adicionar a lista informacao
										}
								});
								if (lista.length == 0	){
									var correto = [];
									correto.push("Não existem universidades com essas caracteristicas com vagas")
									callback(correto); //Caso nao se encontrem universidades com as caracteristicas desejadas
								} else {
									if (paisUser=='nothing'){
								 		callback(lista.join('\n'));
								 	} else {
										var correto = [];
												for (var i = 0; i < lista.length; i+=4){
													correto.push(lista.slice(i, Math.min(i+4, lista.length)).join('\n'));
												}
												callback(correto);
									}
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
