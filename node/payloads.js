export class Payloads {
    
    constructor(){
        this.messages = new Map() 
        this.payloads = new Map()
    }

    createMessage(id, text){

        //If message exists then throw an error
        let message = this.messages.get(id);
        if(message !== undefined)
            throw new Error('%s already exists', id)

        this.messages.set(id, {"text": text, "quick_replies": []})
    }

    addOption(id, text, payload, callback){

        //Makes sure the message exists before addign anything
        this.payloads.set(payload, callback);
        let message = this.messages.get(id);
        
        if(message == undefined){
            throw new Error('Message %s does not exist yet! Time to create', id);
        }

        message.quick_replies.push({
            "content_type":"text",
            "title": text,
            "payload": payload
        });
    }

    getMessage(id){
        return this.messages.get(id);
    }

    dispatcher(payload){
        
        let func = this.payloads.get(payload);
        if(func == undefined)
            return undefined;

        return func.call();
    }
}
