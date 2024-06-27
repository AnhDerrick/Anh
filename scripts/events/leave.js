const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "1.4",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			leaveType1: "tự rời",
			leaveType2: "bị kick",
			defaultLeaveMessage: "{userName} đã {type} khỏi nhóm"
		},
		en: {
			session1: "",
			session2: "",
			session3: "",
			session4: "",
			leaveType1: "𝒂 𝑸𝒖𝒊𝒕𝒕𝒆́ 𝒍𝒆 𝑮𝒓𝒐𝒖𝒑𝒆.",
			leaveType2: "𝒂 𝒆́𝒕𝒆́ 𝒆́𝒋𝒆𝒄𝒕𝒆́ 𝒅𝒖 𝒈𝒓𝒐𝒖𝒑𝒆.",
			defaultLeaveMessage: "⚜️🌹.........❣𝐒𝐀𝐈𝐃𝐘𝐋❣............. \n \n{userName} 𝒂 𝑸𝒖𝒊𝒕𝒕𝒆́ 𝒍𝒆 𝑮𝒓𝒐𝒖𝒑𝒆. 𝑨𝒍𝒍𝒐𝒏𝒔-𝒀 𝑩𝒐𝒊𝒓𝒆 𝒖𝒏𝒆 𝑩𝒊𝒆̀𝒓𝒆. 𝑱'𝒂𝒊 𝒎𝒆̂𝒎𝒆 𝑷𝒂𝒔 𝑩𝒆𝒂𝒖𝒄𝒐𝒖𝒑 𝒅'𝑨𝒓𝒈𝒆𝒏𝒕..🍺 \n⚜️🌹.................................. "
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType == "log:unsubscribe")
			return async function () {
				const { threadID } = event;
				const threadData = await threadsData.get(threadID);
				if (!threadData.settings.sendLeaveMessage)
					return;
				const { leftParticipantFbId } = event.logMessageData;
				if (leftParticipantFbId == api.getCurrentUserID())
					return;
				const hours = getTime("HH");

				const threadName = threadData.threadName;
				const userName = await usersData.getName(leftParticipantFbId);

				// {userName}   : name of the user who left the group
				// {type}       : type of the message (leave)
				// {boxName}    : name of the box
				// {threadName} : name of the box
				// {time}       : time
				// {session}    : session

				let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;
				const form = {
					mentions: leaveMessage.match(/\{userNameTag\}/g) ? [{
						tag: userName,
						id: leftParticipantFbId
					}] : null
				};

				leaveMessage = leaveMessage
					.replace(/\{userName\}|\{userNameTag\}/g, userName)
					.replace(/\{type\}/g, leftParticipantFbId == event.author ? getLang("leaveType1") : getLang("leaveType2"))
					.replace(/\{threadName\}|\{boxName\}/g, threadName)
					.replace(/\{time\}/g, hours)
					.replace(/\{session\}/g, hours <= 10 ?
						getLang("session1") :
						hours <= 12 ?
							getLang("session2") :
							hours <= 18 ?
								getLang("session3") :
								getLang("session4")
					);

				form.body = leaveMessage;

				if (leaveMessage.includes("{userNameTag}")) {
					form.mentions = [{
						id: leftParticipantFbId,
						tag: userName
					}];
				}

				if (threadData.data.leaveAttachment) {
					const files = threadData.data.leaveAttachment;
					const attachments = files.reduce((acc, file) => {
						acc.push(drive.getFile(file, "stream"));
						return acc;
					}, []);
					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}
				message.send(form);
			};
	}
};
