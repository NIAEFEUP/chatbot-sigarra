# chatbot-sigarra

chatbot-sigarra is an open-source chatbot created to help students get information 
from [FEUP](https://www.fe.up.pt/) web infrastructure SIGARRA in a more easy and 
immediate way. It is powered by the [Botpress](https://www.google.com) framework 
and by the Messenger Platform. Written in JavaScript. Made with ❤️ by NIAEFEUP.

_______________________________________________________________________________________

#### Follow us
Check our website for more information on what we do and who we are:

🖥 [Website](https://ni.fe.up.pt) | 💬 [Facebook](https://www.facebook.com/NIAEFEUP/)

_______________________________________________________________________________________

## How does it work

When you start a conversation with **chatbot-sigarra**, the bot will intelligently 
divide your sentence into words. Depending on which words you type, the bot will 
understand the context of the conversation by using regular expressions (and other 
processes manually designed by the team). It will also proactively engage with the 
user in order to, for example, offer help or list all of the things he's able to do.


## Instalation

### Requirements
* Node.JS (version >= 4.6) 
```bash
npm install -g botpress
```

### Creating a Facebook Page

We'll need to create a Facebook page for our bot. You can easily create it by 
following 
[these instructions](https://www.facebook.com/help/104002523024878?helpref=about_content).


### Setting up the Facebook app

You can click [here](https://developers.facebook.com/docs/apps/register) for a 
tutorial on how to setup a Facebook Developer account and create your app.

### Creating and starting the bot
To create a bot, we'll be following the instructions that the Botpress team 
provided on their GitHub page:

* Run the command `botpress init` in a terminal inside an empty directory:

```bash
botpress init chatbot-sigarra
```

* Once your bot is created, you need to run `botpress start` to start your bot: 

```bash
botpress start
```

This will provide you locally a web interface available at http//localhost:3000.

Because our bot is built to run on the Messenger platform, you'll need to 
install the messenger module on the Botpress user interface.  You can do so 
on the web interface or, alternatively, run the following command on your 
terminal: 

```bash
botpress install messenger
```

### Projecting your localhost onto the web

In order to Facebook be able to use our code, we will it to access our localserver. 
We'll be using ngrok for this, but you can also use other alternatives, such as 
localtunnel.

```bash
ngrok http 3000
```

### Connecting the bot with the Messenger Platform

Now that our bot is up and running, we'll make the bridge between the Botpress 
framework and the messenger platform. To do so, you must access the Botpress 
localhost, click on **Messenger** on the column on the left, and then fill the 
**Connexion** box with the following information: 

* **Application ID**
* **Access Token**
* **App Secret**
* **Hostname** - note that the link you'll use here is the one being forwarded 
by **ngrok**

After that, click on **connect** and then **save**.

⚠️ WARNING - Note that if you close the terminal window running ngrok, you'll have to 
run it again, which will change the addess being used by ngrok to forward your local 
server. Thus, it is important that you **DO NOT** close the window, or, if you do close 
it, change the address in the localserver UI.


## Examples

| Trigger command | Action
|-----------------|-----------------------------------------------
| feup            | Gets FEUP's website link
| moodle          | Get's FEUP's moodle link
| ajuda           | Displays all of the available trigger commands

