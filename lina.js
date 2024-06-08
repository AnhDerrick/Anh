const axios = require("axios")
module.exports = {
	config: {
		name: 'lina',
        aliases: ["loft"],
		version: '1.2',
		author: 'Luxion/fixed by Riley',
		countDown: 0,
		role: 0,
		shortDescription: 'AI CHAT',
		longDescription: {
			en: 'Chat with Xae'
		},
		category: 'Ai chat',
		guide: {
			en: '   {pn} <word>: chat with lina'
				+ '\nExample:{pn} hi'
		}
	},

	langs: {
		en: {
			turnedOn: "𝒋'𝒗𝒂𝒊𝒔 𝒎𝒆 𝒕𝒂𝒑𝒆𝒓 𝒖𝒏𝒆 𝒅𝒆 𝒄𝒆𝒔 𝒑𝒕𝒊𝒕𝒆𝒔 𝒄𝒂𝒖𝒔𝒆𝒕𝒕𝒆𝒔 𝒃𝒊𝒆𝒏 𝒔𝒆𝒓𝒓𝒆𝒆𝒔 𝒂𝒗𝒆𝒄 𝒆𝒖𝒙.. 😈",
			turnedOff: "𝒂𝒂𝒉.. 𝒅𝒆𝒋𝒂.. 𝑻'𝒆𝒔 𝒑𝒂𝒔 𝒄𝒐𝒐𝒍,𝒕𝒐𝒊",
			chatting: 'Already Chatting with 𝗟𝗢𝗙𝗧...',
			error: 'Tu ne sais pas écrire?🙂'
		}
	},

	onStart: async function ({ args, threadsData, message, event, getLang }) {
		if (args[0] == 'on' || args[0] == 'off') {
			await threadsData.set(event.threadID, args[0] == "on", "settings.simsimi");
			return message.reply(args[0] == "on" ? getLang("turnedOn") : getLang("turnedOff"));
		}
		else if (args[0]) {
			const yourMessage = args.join(" ");
			try {
				const responseMessage = await getMessage(yourMessage);
				return message.reply(`${responseMessage}`);
			}
			catch (err) {
        console.log(err)
				return message.reply(getLang("error"));
			}
		}
	},

	onChat: async ({ args, message, threadsData, event, isUserCallCommand, getLang }) => {
		if (args.length > 1 && !isUserCallCommand && await threadsData.get(event.threadID, "settings.simsimi")) {
			try {
				const langCode = await threadsData.get(event.threadID, "settings.lang") || global.GoatBot.config.language;
				const responseMessage = await getMessage(args.join(" "), langCode);
				return message.reply(`${responseMessage}`);
			}
			catch (err) {
				return message.reply(getLang("error"));
			}
		}
	}
};

async function getMessage(yourMessage, langCode) {
	const res = await axios.post(
    'https://api.simsimi.vn/v1/simtalk',
    new URLSearchParams({
        'text': yourMessage,
        'lc': 'fr'
    })
);

	if (res.status > 200)
		throw new Error(res.data.success);

	return res.data.message;
      }
