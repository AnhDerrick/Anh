const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");
module.exports = {
	config: {
		name: "bye",
		aliases: ["l"],
		version: "1.0",
		author: "Sandy",
		countDown: 5,
		role: 2,
		shortDescription: "bot will leave gc",
		longDescription: "",
		category: "admin",
		guide: {
			vi: "{pn} [tid,blank]",
			en: "{pn} [tid,blank]"
		}
	},

	onStart: async function ({ api,event,args, message }) {
 var id;
 if (!args.join(" ")) {
 id = event.threadID;
 } else {
 id = parseInt(args.join(" "));
 }
 return api.sendMessage(".....↫𝕊𝔸𝕀𝔻𝕐𝕃↬............ \n \n🌹Un message pour vous: \n↣ 𝑴'𝒆𝒏 𝑽𝒂𝒊𝒔. 𝑩𝒀𝑬.. ✌️", id, () => api.removeUserFromGroup(api.getCurrentUserID(), id))
		}
	};
