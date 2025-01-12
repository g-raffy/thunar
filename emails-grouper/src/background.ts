// Helper function to convert date string (YYYY-MM-DD) to a timestamp
function toTimestamp(dateString: string): number {
	return new Date(dateString).getTime();
}

// Function to move emails within the specified date range
async function moveEmails(startDate: string, endDate: string) {
	let mail_accounts = await browser.accounts.list();
	for (let mail_account_index in mail_accounts)
	{
		let mail_account: browser.accounts.MailAccount = mail_accounts[mail_account_index]; // You can adjust which account to use
		console.log("account = " + mail_account);
		console.log("mail_account.id: " + mail_account.id);  // MailAccountId, eg "account4"
		console.log("mail_account.name: " + mail_account.name);  // string, eg "guillaume.raffy.work@gmail.com", "Blogs & News Feeds", "Local Folders"
		console.log("mail_account.rootFolder: " + mail_account.rootFolder);  // MailFolder, eg undefined
		console.log("mail_account.type: " + mail_account.type);  // string ('imap', 'pop3', 'rss', 'none'(local folders))
		if (mail_account.folders)
		{
			// let sourceFolder = mail_account.folders.find(folder => folder.name === "IInbox");
			// let targetFolder = mail_account.folders.find(folder => folder.name === "AArchive");
			for (let folder in mail_account.folders)
			{
				console.log("folder = " + folder);
			}
		}
	}

	// account = [object Object]
	// mail_account.id: account1
	// mail_account.name: guillaume.raffy@univ-rennes1.fr
	// mail_account.rootFolder: undefined
	// mail_account.type: imap
	// account = [object Object]
	// mail_account.id: account4
	// mail_account.name: guillaume.raffy.work@gmail.com
	// mail_account.rootFolder: undefined
	// mail_account.type: imap
	// account = [object Object]
	// mail_account.id: account6
	// mail_account.name: guillaume.raffy@hotmail.com
	// mail_account.rootFolder: undefined
	// mail_account.type: imap
	// account = [object Object]
	// mail_account.id: account10
	// mail_account.name: website@melting-notes.com
	// mail_account.rootFolder: undefined
	// mail_account.type: pop3
	// account = [object Object]
	// mail_account.id: account11
	// mail_account.name: ggjj.raffy@gmail.com
	// mail_account.rootFolder: undefined
	// mail_account.type: imap
	// account = [object Object]
	// mail_account.id: account12
	// mail_account.name: doraemon.seibyou@gmail.com
	// mail_account.rootFolder: undefined
	// mail_account.type: imap
	// account = [object Object]
	// mail_account.id: account2
	// mail_account.name: Local Folders
	// mail_account.rootFolder: undefined
	// mail_account.type: none
	// account = [object Object]
	// mail_account.id: account7
	// mail_account.name: Blogs & News Feeds
	// mail_account.rootFolder: undefined
	// mail_account.type: rss
	// on move-form submit: moveEmails completed popup.js:24:10
	// on move-form submit: end popup.js:32:10
	
	return { success: false };

	// if (!sourceFolder || !targetFolder) {
	// 	console.error("Source or target folder not found.");
	// 	return { success: false };
	// }

	// let messages = await browser.messages.list(sourceFolder);

	// if (messages.messages.length === 0) {
	// 	console.log("No messages to move.");
	// 	return { success: false };
	// }

	// // Convert the date range to timestamps
	// let startTimestamp = toTimestamp(startDate);
	// let endTimestamp = toTimestamp(endDate);

	// // Filter messages by date range
	// let messagesToMove = messages.messages.filter(msg => {
	// 	let messageDate = new Date(msg.date).getTime();
	// 	return messageDate >= startTimestamp && messageDate <= endTimestamp;
	// });

	// if (messagesToMove.length === 0) {
	// 	console.log("No messages found in the specified date range.");
	// 	return { success: false };
	// }

	// // Move the filtered messages to the target folder
	// let messageIds = messagesToMove.map(msg => msg.id);
	// await browser.messages.move(messageIds, targetFolder);

	console.log("Messages moved successfully.");
	return { success: true };
}

// Listen for messages from the popup
browser.runtime.onMessage.addListener(async (request) => {
	if (request.action === "moveEmails") {
		return await moveEmails(request.startDate, request.endDate);
	}
});
