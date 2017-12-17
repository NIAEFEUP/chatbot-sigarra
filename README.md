# Chatbot-Sigarra
Este chatbot foi criado com o intuito de facilitar a interação dos alunos da FEUP com o sistema 
SIGARRA. Permite obter diversas informações presentes no website fe.up.pt de maneira fácil e direta.

# Como configurar o Bot
Para configurar o bot precisamos de uma maneira de o conectar aos servidores 
do Facebook. Para isso vamos usar Node.JS e o Herku. Alternativamente, podemos usar 
o nosso próprio servidor, ou até mesmo projetá-lo na web usando o 
**localtunnel** ou o **ngrok**.

1. Instalar o Node
* Para utilizadores de macOS, utilizando o Homebrew:
```bash
$ brew install node
```
* Para utilizadores de Linux, usando o gestor de pacotes **apt**:
```bash
$ sudo apt-get update
$ sudo apt-get install nodejs
```
2. Criar diretório do projeto e configurar servidor da aplicação
```bash
$ mkdir chatbot_sigarra
$ cd chatbot_sigarra/
$ npm init
```
3. Instalar pacotes úteis do Node
```bash
$ npm install express body-parser request --save
```
Fazer isto permite incluir as dependências do ficheiro **package.json**. Desta forma o Heroku consegue saber como fazer deploy dos ficheiros corretamente, bem como saber como correr a app.

4. Adicionar a linha *"start": "node index.js"* dentro do bloco de código *"scripts"*
```javascript
{
  "name": "testbot",
  "version": "1.0.0",
  "description": "Chatbot Sigarra Server App",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  },
  "author": "NIAEFEUP",
  "license": "ISC",
  "dependencies": {
    "body-parser": "^1.15.0",
    "express": "^4.13.4",
    "request": "^2.72.0"
  }
}
```
5. Criar o ficheiro **index.js** no diretório do projeto e preenchê-lo
    ```bash
    $ touch index.js
    ```
A seguir vamos copiar o seguinte bloco de código:
    ```javascript
    var express = require('express');  
    var bodyParser = require('body-parser');  
    var request = require('request');  
    var app = express();
    
    app.use(bodyParser.urlencoded({extended: false}));  
    app.use(bodyParser.json());  
    app.listen((process.env.PORT || 3000));
    
    // Server frontpage
    app.get('/', function (req, res) {  
        res.send('This is TestBot Server');
    });
    
    // Facebook Webhook
    app.get('/webhook', function (req, res) {  
        if (req.query['hub.verify_token'] === 'niaefeup') {
            res.send(req.query['hub.challenge']);
        } else {
            res.send('Invalid verify token');
        }
    });
    ```
6. Griar um repositório Git 
Primeiro criamos um ficheiro **.gitignore** para que o Git não inclua esses ficheiros no repositório, neste caso os módulos do Node:
    ```
    node_modules/  
    ```
Depois criamos o repositório, adicionando todos os ficheiros e fazendo commit: 
    ```bash
    $ git init
    $ git add .
    $ git commit -m 'Configuração do webhook'
    ```
7. Configurar o Heroku
Para isto temos que criar uma conta gratuita no Heroku (http://heroku.com). Depois disso instalamos o Heroku Toolbelt (CLI - command line interface): 
+ Para utilizadores do macOS, usando o Homebrew:
    ```bash
    $ brew install heroku/brew/heroku
    ```
+ Para utilizadores do Ubuntu: 
    ```bash
    $ wget -qO- https://cli-assets.heroku.com/install-ubuntu.sh | sh
    ```
+ Para utilizadores do Windows: Oh meu... por favor...
A seguir fazemos push para o server do Heroku (substituam o appname por um nome à vossa escolha):
    ```bash
    $ heroku login
    $ heroku create appname
    creating app... done, stack is cedar-14  
    https://appname.herokuapp.com/ | https://git.heroku.com/appname.git  
    $ git push heroku master
    https://appname.herokuapp.com/ deployed to Heroku  
    ```

8. Criar página no Facebook
Para criar a página acedemos a este link: https://www.facebook.com/pages/create/.
O tipo da página é irrelevante, já que só estamos a usar esta página para testes 
(organização, instituição, software... é indiferente).

9. Criar Facebook App
Para criar a app, acedemos a este link: https://developers.facebook.com/quickstarts/, clicamos em 
"basic setup" e preenchemos os campos com a seguinte informação:
    ```
    Display Name -> nome da app
    Contact email -> email da vossa conta
    ```
Após isso, na Dashboard, vamos a Product Settings -> Add Product section -> Get started with Messenger.


10. Gerar o Page Access Token e configurar o webhook 
Na aba *Messenger* da página da nossa aplicação do Facebook, na secção *Token Generation*, 
escolhemos a página que queremos associar à app. Após isso será gerado o PAGE_ACCESS_TOKEN. Vamos 
guardar este código para o usar a seguir.
Na secção *Webhooks*, clicamos em *Setup webhooks*, colamos o URL que guardámos (não esquecer de colocar 
HTTPS no início do endereço!), o verify token (que em cima definimos como *niaefeup*) e selecionamos as seguintes checkboxes: *message_deliveries*, . Por fim clicamos em "Verify" e depois "Save".
NOTA: O webhook precisa de ser acessível via HTTPS, por isso precisaremos de um certificado para o 
domínio na altura de dar deploy no servidor do NI. Podemos fazê-lo facilmente usando o **nginx** e o 
**Let's Encrypt**, caso o servidor ainda não o tenha.


11. Subscrever a nossa app à página 
A maneira mais simples de o fazer é correr o seguinte código no terminal, substituindo *PAGE_ACCESS_TOKEN* pelo token que gerámos: 
    ```bash
    $ curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=PAGE_ACCESS_TOKEN"
    ```
Se tudo correr bem, obtemos a seguinte resposta do servidor: 
    ```bash
    {"success": true}
    ```


12. Definir o PAGE_ACCESS_TOKEN no Heroku
Na página da nossa app no site do Heroku, clicamos em *Settings* e depois em *Config Variable*. 
Na primeira caixa preenchemos com *PAGE_ACCESS_TOKEN* e na segunda com o token gerado.


13. Criar um bot que faça echo do input que recebe


Se tudo correu bem, estamos agora prontos para criar o bot.

Começamos por adicionar a seguinte função no final do ficheiro **index.js**: 

    ```javascript
    // handler receiving messages
    app.post('/webhook', function (req, res) {  
        var events = req.body.entry[0].messaging;
        for (i = 0; i < events.length; i++) {
            var event = events[i];
            if (event.message && event.message.text) {
                sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
            }
        }
        res.sendStatus(200);
    });
    ```

O post handler percorre todas as mensagens recebidas e faz echo delas se existirem, usando para isso 
a seguinte função, que devemos colar no final do ficheiro.

    ```javascript
    // generic function sending messages
    function sendMessage(recipientId, message) {  
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: {
                recipient: {id: recipientId},
                message: message,
            }
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    };
    ```
Por cada pedido feito pelo facebook ao servidor, precisamos sempre da mensagem e do token de accesso.
Vamos agora guardar o ficheiro **index.js**, fazer commit e dar deploy no nosso servidor do Heroku: 
    ```bash
    $ git add .
    $ git commit -m 'Create Echo Bot'
    $ git push heroku master
    ```

Podemos agora enviar uma mensagem ao bot! Para isso procuramos o nome do bot no Messenger e 
enviamos a mensagem.

Se os passos anteriores foram feitos corretamente, o bot vai fazer echo da mensagem que enviarmos!

