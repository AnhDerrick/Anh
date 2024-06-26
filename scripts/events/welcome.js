const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "",
			session2: "",
			session3: "",
			session4: "",
			welcomeMessage: "𝑱𝒆 𝑴𝒆 𝑹𝒆𝒕𝒓𝒐𝒖𝒗𝒆 𝒎𝒂𝒊𝒏𝒕𝒆𝒏𝒂𝒏𝒕 𝒂𝒗𝒆𝒄 𝑽𝒐𝒖𝒔. 𝑱'𝒆𝒏 𝒔𝒖𝒊𝒔 𝑹𝒂𝒗𝒊𝒆. 𝑱'𝑬𝒔𝒑𝒆̀𝒓𝒆 𝒔𝒖𝒓𝒕𝒐𝒖𝒕 𝒒𝒖𝒆 𝑽𝒐𝒖𝒔 𝑴'𝑼𝒕𝒊𝒍𝒊𝒔𝒆𝒓𝒂𝒊 𝑩𝒊𝒆𝒏 𝒒𝒖'𝑶𝒏 𝑷𝒂𝒔𝒔𝒆𝒓𝒂 𝒅𝒆𝒔 𝑩𝒐𝒏𝒔 𝑴𝒐𝒎𝒆𝒏𝒕𝒔 𝑬𝒏𝒔𝒆𝒎𝒃𝒍𝒆. \n \n 🅿🆁🅴🅵🅸🆇:  ➪   %1 ",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: " {userName} , \n 𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖(𝒆)(𝒔)(𝒆𝒔) 𝒅𝒂𝒏𝒔 𝒍𝒆 𝒈𝒓𝒐𝒖𝒑𝒆  {boxName}. \n 𝑱'𝑬𝒔𝒑𝒆̀𝒓𝒆 𝒒𝒖𝒆 𝑻𝒖 𝑹𝒆𝒔𝒑𝒆𝒄𝒕𝒆𝒓𝒂𝒔 𝒍𝒆𝒔 𝑹𝒆̀𝒈𝒍𝒆𝒔 𝒅𝒖 𝒈𝒓𝒐𝒖𝒑𝒆 𝒆𝒕 𝒒𝒖'𝑶𝒏 𝑷𝒂𝒔𝒔𝒆𝒓𝒂 𝒅𝒆𝒔 𝑩𝒐𝒏𝒔 𝑴𝒐𝒎𝒆𝒏𝒕𝒔."
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
