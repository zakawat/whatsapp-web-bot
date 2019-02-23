(() => {
	//
	// GLOBAL VARS AND CONFIGS
    //
    const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
	var lastMessageOnChat = false;
	var convo_id = null;
	var ignoreLastMsg = {};
	var elementConfig = {
		"chats": [1, 0, 5, 2, 0, 3, 0, 0, 0],
		"chat_icons": [0, 0, 1, 1, 1, 0],
		"chat_title": [0, 0, 1, 0, 0, 0, 0],
		"chat_lastmsg": [0, 0, 1, 1, 0, 0],
		"chat_active": [0, 0],
		"selected_title": [1, 0, 5, 3, 0, 1, 1, 0, 0, 0, 0]
	};

	const funFactsList = [
		`Oxford University Was Founded Before Aztec Civilization Began !!`,

		`Neil Armstrong Had to Go Through U.S. Customs after Returning from the Moon`,

		`Saudi Arabia Imports Camels from Australia`,

        `The Current U.S. Flag Was Designed by a 17-Year-Old for a School Project.`,
        
        `If Cars Drove Upwards You Could Drive to Space in an Hour !!`,

        `Firefighters use wetting agents to make water wetter.`,

        `The longest English word is 189,819 letters long.`,
        
        `Kleenex tissues were originally intended for gas masks`

        
	]


	//
	// FUNCTIONS
	//

	// Get random value between a range
	function rand(high, low = 0) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	}
	
	function getElement(id, parent){
		if (!elementConfig[id]){
			return false;
		}
		var elem = !parent ? document.body : parent;
		var elementArr = elementConfig[id];
		elementArr.forEach(function(pos) {
			if (!elem.childNodes[pos]){
				return false;
			}
			elem = elem.childNodes[pos];
		});
		return elem;
	}
	
	function getLastMsg(){
		var messages = document.querySelectorAll('.msg');
		var pos = messages.length-1;
		
		while (messages[pos] && (messages[pos].classList.contains('msg-system') || messages[pos].querySelector('.message-in'))){
			pos--;
			if (pos <= -1){
				return false;
			}
		}
		if (messages[pos] && messages[pos].querySelector('.selectable-text')){
			return messages[pos].querySelector('.selectable-text').innerText.trim();
		} else {
			return false;
		}
	}
	
	function getUnreadChats(){
		var unreadchats = [];
		var chats = getElement("chats");
		if (chats){
			chats = chats.childNodes;
			for (var i in chats){
				if (!(chats[i] instanceof Element)){
					continue;
				}
				var icons = getElement("chat_icons", chats[i]).childNodes;
				if (!icons){
					continue;
				}
				for (var j in icons){
					if (icons[j] instanceof Element){
						if (!(icons[j].childNodes[0].getAttribute('data-icon') == 'muted' || icons[j].childNodes[0].getAttribute('data-icon') == 'pinned')){
							unreadchats.push(chats[i]);
							break;
						}
					}
				}
			}
		}
		return unreadchats;
	}
	
	function didYouSendLastMsg(){
		var messages = document.querySelectorAll('.msg');
		if (messages.length <= 0){
			return false;
		}
		var pos = messages.length-1;
		
		while (messages[pos] && messages[pos].classList.contains('msg-system')){
			pos--;
			if (pos <= -1){
				return -1;
			}
		}
		if (messages[pos].querySelector('.message-out')){
			return true;
		}
		return false;
	}

	// Call the main function again
	const goAgain = (fn, sec) => {
		// const chat = document.querySelector('div.chat:not(.unread)')
		// selectChat(chat)
		setTimeout(fn, sec * 500)
	}

	// Dispath an event (of click, por instance)
	const eventFire = (el, etype) => {
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(etype, true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
		el.dispatchEvent(evt);
	}

	// Select a chat to show the main box
	const selectChat = (chat, cb) => {
		const title = getElement("chat_title",chat).title;
		eventFire(chat.firstChild.firstChild, 'mousedown');
		if (!cb) return;
		const loopFewTimes = () => {
			setTimeout(() => {
				const titleMain = getElement("selected_title").title;
				if (titleMain !== undefined && titleMain != title){
					console.log('not yet');
					return loopFewTimes();
				}
				return cb();
			}, 300);
		}

		loopFewTimes();
	}

	// Send a message
	const sendMessage = (chat, message, cb) => {
		//avoid duplicate sending
		var title;

		if (chat){
			title = getElement("chat_title",chat).title;
		} else {
			title = getElement("selected_title").title;
		}
		ignoreLastMsg[title] = message;
		
		messageBox = document.querySelectorAll("[contenteditable='true']")[0];

		//add text into input field
		messageBox.innerHTML = message.replace(/  /gm,'');

		//Force refresh
		event = document.createEvent("UIEvents");
		event.initUIEvent("input", true, true, window, 1);
		messageBox.dispatchEvent(event);

		//Click at Send Button
		eventFire(document.querySelector('span[data-icon="send"]'), 'click');

		cb();
	}

	//
	// MAIN LOGIC
	//
	const start = (_chats, cnt = 0) => {
		// get next unread chat
		const chats = _chats || getUnreadChats();
		const chat = chats[cnt];
		
		var processLastMsgOnChat = false;
		var lastMsg;
		
		if (!lastMessageOnChat){
			if (false === (lastMessageOnChat = getLastMsg())){
				lastMessageOnChat = true; //to prevent the first "if" to go true everytime
			} else {
				lastMsg = lastMessageOnChat;
			}
		} else if (lastMessageOnChat != getLastMsg() && getLastMsg() !== false && !didYouSendLastMsg()){
			lastMessageOnChat = lastMsg = getLastMsg();
			processLastMsgOnChat = true;
		}
		
		if (!processLastMsgOnChat && (chats.length == 0 || !chat)) {
			//console.log(new Date(), 'nothing to do now... (1)', chats.length, chat);
			return goAgain(start, 3);
		}

		// get infos
		var title;
		if (!processLastMsgOnChat){
			title = getElement("chat_title",chat).title + '';
			lastMsg = (getElement("chat_lastmsg", chat) || { innerText: '' }).innerText.trim(); //.last-msg returns null when some user is typing a message to me
		} else {
			title = getElement("selected_title").title;
		}
		// avoid sending duplicate messaegs
		if (ignoreLastMsg[title] && (ignoreLastMsg[title]) == lastMsg) {
			//console.log(new Date(), 'nothing to do now... (2)', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		// what to answer back?
        let sendText
        var regex = /@[A-Z|a-z|_]*$/;
        let botName = "*Zaki’s BOT:*"
		let aiURL = "https://localhost/Program-O/chatbot/conversation_start.php";

		
		//console.log(lastMsg);
		

		
		if(lastMsg.toUpperCase().startsWith('@BOT')){
			console.log("@BOT is triggered");
			var chk = lastMsg.toUpperCase().split("@BOT")[1];
			chk = chk.trim();
			if( chk.length >= 1 ){ //means there is some text after @BOT
				
				aiURL += `?say=${chk}`;

				if (convo_id != null) {
					aiURL += `&convo_id=${convo_id}`;
				}

				console.log("Sending request....");
				var request = new XMLHttpRequest();
				request.open('GET', aiURL, false);  // `false` makes the request synchronous
				request.send(null);
				
				if (request.status === 200) {
					var r = JSON.parse(request.responseText);
					convo_id = r.convo_id;
					sendText = `${botName} ${r.botsay}`;

				}
				else{
					console.log(request);
					sendText = `${botName} I am so sorry, the AI part of BOT is currently offline, please try again later !!`;
				}
			}else{
				console.log("Else trigged.......")
				sendText = `${botName} Please type something...\nI can’t answer a question that is not yet written !!` ;
			}
		}
		



		else if (lastMsg.toUpperCase().endsWith('@HELP')){
            if (title == null) {
                title = ``;
            }else { 
                title = `“${title}”`; 
            }
            sendText = `${botName} Hi ${title}!! I am a simple chat bot !!
            
            Some commands that you can send me are as follow:
            *@TIME*
            *@FACT* ⠀⠀  `
		}

		else if (lastMsg.toUpperCase().endsWith('@TIME')){
            let current_datetime = new Date();
            sendText = `${botName} Well, the current time is:
            *${months[current_datetime.getMonth()]} ${current_datetime.getDate()}, ${current_datetime.getFullYear()} - ${current_datetime.getHours()}:${current_datetime.getMinutes()<10?'0':''}${current_datetime.getMinutes()} PST*`
		}

		else if (lastMsg.toUpperCase().endsWith('@FACT')){
			sendText = `${botName} ${funFactsList[rand(funFactsList.length - 1)]}`;
        }


        

        else if (regex.test(lastMsg)) {

            var res = lastMsg.split('\n')[lastMsg.split('\n').length - 1];

            sendText = `${botName} Did you tried to invoke me _(with the message of “${res}”)_ ??
            I can only work with the following commands:
            *@TIME*
            *@FACT*
            *@HELP* ⠀⠀⠀ `;
        }

		
		// that's sad, there's not to send back...
		if (!sendText) {
			ignoreLastMsg[title] = lastMsg;
			//console.log(new Date(), 'new message ignored -> ', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		console.log(new Date(), 'new message to process, uhull -> ', title, lastMsg);

		// select chat and send message
		if (!processLastMsgOnChat){
			selectChat(chat, () => {
				sendMessage(chat, sendText.trim(), () => {
					goAgain(() => { start(chats, cnt + 1) }, 1);
				});
			})
		} else {
			sendMessage(null, sendText.trim(), () => {
				goAgain(() => { start(chats, cnt + 1) }, 1);
			});
		}
	}
	start();
})()