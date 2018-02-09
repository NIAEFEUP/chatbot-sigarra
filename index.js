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
