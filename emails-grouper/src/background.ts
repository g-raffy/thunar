
class MailFolderPath
{
	pathParts: string[];  // eg ["LocalFolders", "arch", "test"]. The first part is expected to be the name of a browser.accounts.MailAccount (eg "guillaume.raffy@univ-rennes1.fr" or "Local Folders"), while the others are expected to be the name of a browser.folders.MailFolder

	constructor(pathParts: string[])
	{
		this.pathParts = pathParts
	}

	getPathParts(): string[]
	{
		return this.pathParts;
	}

	asIdString(): string
	{
		return this.pathParts.join("/");
	}
	
}


class MailMoveHandler
{
	constructor()
	{
	}

	async onMailFolderMove(srcFolder: MyMailFolder, numMessagesMoved: number, numMessagesInFolder: number)
	{
		browser.runtime.sendMessage({ type:"mail-folder-processed", srcFolder: await srcFolder.asIdString(), dstFolder: "", numMailsMoved: numMessagesMoved, numMessagesInFolder: numMessagesInFolder});
	}
}


async function getSubMailFolder(rootFolder: MyMailFolder, subPath: string[], createMissingFolders: boolean = false): Promise<MyMailFolder | null>
{
	// console.log("getSubMailFolder: searching ", subPath, " in ", rootFolder.name, "subfolders")
	if (subPath.length === 0)
	{
		// console.log("getSubMailFolder: rootFolder.path = ", rootFolder.path)
		return rootFolder;
	}
	else
	{
		let subMailFolder: MyMailFolder | null = null
		let firstFolderName: string = subPath.shift() as string;
		if (rootFolder.thunMailFolder.subFolders)
		{
			// let sourceFolder = mail_account.folders.find(folder => folder.name === "IInbox");
			// let targetFolder = mail_account.folders.find(folder => folder.name === "AArchive");
			let folder : browser.folders.MailFolder
			for (folder of rootFolder.thunMailFolder.subFolders)
			{
				// console.log("getSubMailFolder: folder = ", folder.name)
				if (folder.name === firstFolderName){
					subMailFolder = new MyMailFolder(folder);
				}
			}
		}

		if ((subMailFolder === null) && (createMissingFolders))
		{
			// ensure "accountsFolders" permission is set to avoid the confusing error "browser.folders.create is not a function"
			subMailFolder = new MyMailFolder(await browser.folders.create(rootFolder.thunMailFolder, firstFolderName))
		}

		if ((subMailFolder === null))
		{
			throw Error('failed to find child folder ' + firstFolderName + ' in ' + rootFolder.thunMailFolder.name);
		}
		else
		{
			subMailFolder = await getSubMailFolder(subMailFolder, subPath, createMissingFolders);
		}
		// console.log("getSubMailFolder: subMailFolder.path = ", subMailFolder?.path)
		return subMailFolder
	}
}

async function getMailFolder(mailFolderAbsPath: MailFolderPath, createMissingFolders: boolean = false): Promise<MyMailFolder | null>
{
	// console.log("getMailFolder: mailFolderAbsPath = ", mailFolderAbsPath)
	// mailFolderAbsPath: eg ["guillaume.raffy.work@gmail.com", "Inbox"]
	let subPathParts: string[] = [...mailFolderAbsPath.getPathParts()]
	let mailAccountName = subPathParts.shift();  // eg "guillaume.raffy.work@gmail.com"
	let mailFolder: MyMailFolder | null = null;
	let mailAccounts: browser.accounts.MailAccount[] = await browser.accounts.list();
	let targetMailAccount: browser.accounts.MailAccount | null = null;
	for(let mailAccount of mailAccounts)
	{
		// console.log("getMailFolder: mailAccount = ", mailAccount.name)
		if (mailAccount.name == mailAccountName)
		{
			targetMailAccount = mailAccount;
			break;
		}
	}

	if (targetMailAccount === null)
	{
		throw Error('mail account not found for ' + mailFolderAbsPath);
	}
	else
	{
		let firstFolderName: string = subPathParts.shift() as string;
		// console.log("getMailFolder: firstFolderName = ", firstFolderName)
		let targetFolder : browser.folders.MailFolder | null = null
		if (targetMailAccount.folders)
		{
			// let sourceFolder = mail_account.folders.find(folder => folder.name === "IInbox");
			// let targetFolder = mail_account.folders.find(folder => folder.name === "AArchive");
			let folder : browser.folders.MailFolder
			for (folder of targetMailAccount.folders)
			{
				// console.log("getMailFolder: folder = ", folder.name)
				if (folder.name === firstFolderName){
					targetFolder = folder;
				}
			}
		}

		if ((targetFolder === null) && (createMissingFolders))
		{
			// ensure "accountsFolders" permission is set to avoid the confusing error "browser.folders.create is not a function"
			targetFolder = await browser.folders.create(targetMailAccount, firstFolderName)
		}

		if ((targetFolder === null))
		{
			throw Error('failed to find folder ' + firstFolderName + ' in ' + mailFolderAbsPath);
		}
		else
		{
			mailFolder = await getSubMailFolder(new MyMailFolder(targetFolder), subPathParts, createMissingFolders);
		}
	}
	// console.log("getMailFolder: mailFolder.path = ", mailFolder?.thunMailFolder.path)
	return mailFolder;
}

async function ensureMailFolderExists(mailFolderPath: MailFolderPath): Promise<MyMailFolder>
{
	let mailFolder: MyMailFolder
	// mailFolderPath example:  ["Local Folders", "arch", "2024", "guillaume.raffy@univ-rennes1.fr"]
	mailFolder = await getMailFolder(mailFolderPath, true) as MyMailFolder;
	return mailFolder;
}

async function getMailFolderAccount(mailFolder: browser.folders.MailFolder): Promise<browser.accounts.MailAccount>
{
	const mailAccountId: string = mailFolder.accountId as string
	let mail_account: browser.accounts.MailAccount = await browser.accounts.get(mailAccountId) as browser.accounts.MailAccount;

	return mail_account;
}


async function getMailFolderAbsName(mailFolder: browser.folders.MailFolder): Promise<MailFolderPath>
{
	let folderAbsoluteName: MailFolderPath = new MailFolderPath([])
	// gets ['guillaume.raffy@univ-rennes1.fr', 'Inbox'] for the mail folder 'Inbox' in the the mail account 'guillaume.raffy@univ-rennes1.fr'

	const parentsPaths: browser.folders.MailFolder[] = (await browser.folders.getParentFolders(mailFolder)).reverse()
	const mailAccount: browser.accounts.MailAccount  = await getMailFolderAccount(mailFolder)

	folderAbsoluteName.pathParts.push(mailAccount.name)
	for(let pathPart of parentsPaths)
	{
		folderAbsoluteName.pathParts.push(pathPart.name as string);
	}

	folderAbsoluteName.pathParts.push(mailFolder.name as string);

	return folderAbsoluteName
}


class MyMailFolder
{
	mailFolderPath: MailFolderPath | null
	thunMailFolder: browser.folders.MailFolder  // thunderbird mail folder

	constructor(thunMailFolder: browser.folders.MailFolder)
	{
		this.mailFolderPath = null  
		this.thunMailFolder = thunMailFolder
	}

	// finish the construction with code that uses async functions (yes, this is ugly but I don't know a better solution yet)

	async build()
	{
		this.mailFolderPath = await getMailFolderAbsName(this.thunMailFolder)
	}

	async ensureIsBuilt()
	{
		if(!this.mailFolderPath)
		{
			await this.build();
		}
	}

	async asAbsPath(): Promise<MailFolderPath>
	{
		await this.ensureIsBuilt()
		return this.mailFolderPath as MailFolderPath;
	}

	async asIdString(): Promise<string>
	{
		await this.ensureIsBuilt()
		return this.mailFolderPath?.asIdString() as string
	}
}


class EmailsGrouper
{
	archiveRootFolderPath: MailFolderPath;  // eg ["LocalFolders", "arch", "test"]
	mailMoveHandler: MailMoveHandler;
	archivableEmailAccounts: string[];
	ignoredMailFolders: string[];

	constructor(archiveRootFolderPath: MailFolderPath, mailMoveHandler: MailMoveHandler)
	{
		this.archiveRootFolderPath = archiveRootFolderPath;
		this.mailMoveHandler = mailMoveHandler;
		this.archivableEmailAccounts = [
			// "guillaume.raffy@univ-rennes1.fr",
			"guillaume.raffy.work@gmail.com",
			// "guillaume.raffy@hotmail.com",
			// "website@melting-notes.com",
			// "ggjj.raffy@gmail.com",
			// "doraemon.seibyou@gmail.com",
			// "Local Folders",
			// "Blogs & News Feeds",
		]
		this.ignoredMailFolders = [
			"guillaume.raffy.work@gmail.com/[Gmail]/All Mail",  // this contains duplicates of other folders, as stated by 
			// [https://support.mozilla.org/en-US/kb/thunderbird-and-gmail]
			// 	> - All Mail: contains all the messages of your Gmail account, including sent and archived messages. Any messages that you see in the inbox will also appear in the [Gmail]/All Mail folder. (It is recommended to unsubscribe this folder.)
			"guillaume.raffy.work@gmail.com/[Gmail]/Drafts",
			"guillaume.raffy.work@gmail.com/[Gmail]/Bin"
		]
	}

	async getArchiveRootFolder(): Promise<MyMailFolder>
	{
		return await getMailFolder(this.archiveRootFolderPath) as MyMailFolder;
	}


	static async ensureArchiveFolderExists(srcFolder: MyMailFolder, archiveRootFolder: MyMailFolder, year: number): Promise<MyMailFolder>
	{
		// srcFolder : the mail folder to archive, eg name=Indox (path "/INBOX")
		// archiveRootFolder : the mail folder representing the root of all archives, eg path "/arch/test"
		// year : the year we want to archive

		// result : the mail folder to use to archive srcFolder's messages, eg "/arch/test/2022/Inbox"

		// console.log('ensureArchiveFolderExists: srcFolder.path = ' + srcFolder.thunMailFolder.path)
		// console.log('ensureArchiveFolderExists: archiveRootFolder.path = ' + archiveRootFolder.thunMailFolder.path)
		// console.log('ensureArchiveFolderExists: year = ' + year)

		const srcFolderAbsName: MailFolderPath = await srcFolder.asAbsPath();  // eg [ "guillaume.raffy@univ-rennes1.fr", "Inbox"]
		let archivePath: MailFolderPath = await archiveRootFolder.asAbsPath();  // eg [ "Local Folders", "arch", "test"]
		archivePath.pathParts.push(year.toString());
		for (let pathPart of srcFolderAbsName.pathParts)
		{
			archivePath.pathParts.push(pathPart);
		}

		// at this point, archivePath should look like [ "Local Folders", "arch", "test", "2022", "guillaume.raffy@univ-rennes1.fr", "Inbox"]
		// console.log('ensureArchiveFolderExists: archivePath = ' + archivePath)

		const testModeIsOn = false;
		if (testModeIsOn)
		{
			throw Error("debug stop on archivePath : " + archivePath);
		}
		const archiveFolder = await ensureMailFolderExists(archivePath);
		return archiveFolder
	}

	async processFolder(srcFolder: MyMailFolder, archiveRootFolder: MyMailFolder, startDate: Date, endDate: Date, dryRun: boolean)
	{
		// console.log("processFolder : processing folder path = " + srcFolder.thunMailFolder.path + ", name = " + srcFolder.thunMailFolder.name);
		const srcFolderId: string = await srcFolder.asIdString()
		if (this.ignoredMailFolders.includes(srcFolderId))
		{
			console.log("ignoring " + srcFolderId + " because it's in the ignore list");
			return;
		}

		// Convert the date range to timestamps
		const startTimestamp = startDate.getTime();
		const endTimestamp = endDate.getTime();

		const archiveYear = startDate.getFullYear();
		if ( endDate.getFullYear() !== archiveYear )
		{
			throw new Error("startDate (" + startDate + ") and endDate (" + endDate + ") are expected to have the same year");
		}

		// from [https://webextension-api.thunderbird.net/en/latest/examples/messageLists.html]
		// Mail folders could contain a lot of messages: thousands, tens of thousands, or even hundreds of thousands.

		// It would be a very bad idea to deal with that many messages at once, so the WebExtensions APIs split any response that could contain many messages into pages (or chunks). The default size of each page is 100 messages, although this could change and you must not rely on that number.

		// Each page is an object with two properties: id, and messages. To get the next page, call continueList(messageListId) with the id property as an argument:

		let numMessagesInFolder: number = 0
		let msgHeaders: browser.messages.MessageHeader[] = [];

		let msgPage: browser.messages.MessageList = await browser.messages.list(srcFolder.thunMailFolder);
		numMessagesInFolder += msgPage.messages.length

		// Filter messages by date range
		let pageMessagesToMove = msgPage.messages.filter(msg => {
			let messageDate = new Date(msg.date).getTime();
			return messageDate >= startTimestamp && messageDate <= endTimestamp;
			});


		msgHeaders.push(...pageMessagesToMove)

		// at this point, browser.messages.list only retrieved at most 100 messages (ie msgPage.messages.length() <= 100). we need to retreive the remaining messages using browser.messages.continueList
		// nb: browser.messages.list and browser.messages.continueList always return the same msgPage.id (which is a uuid string) for the same MailFolder. In other words, for each browser.messages.list and its related browser.messages.continueList calls, the returnes msgPage.id is always the same. msgPage.id becomes null to indicite that all messages of the list have been retrieved and therefore that browser.messages.continueList doesn't to be called again (it wouldn't work anyway because it wouldn't receive a list identifier).
		while (msgPage.id)
		{
			msgPage = await browser.messages.continueList(msgPage.id);
			numMessagesInFolder += msgPage.messages.length

			let pageMessagesToMove = msgPage.messages.filter(msg => {
				let messageDate = new Date(msg.date).getTime();
				return messageDate >= startTimestamp && messageDate <= endTimestamp;
				});
			msgHeaders.push(...pageMessagesToMove)
		}

		if (msgHeaders.length === 0)
		{
			// console.log("No messages found in the specified date range.");
		}
		else
		{
			const targetFolder = await EmailsGrouper.ensureArchiveFolderExists(srcFolder, archiveRootFolder, archiveYear)
			// Move the filtered messages to the target folder
			let messageIds = msgHeaders.map(msg => msg.id);
			let messageDates = msgHeaders.map(msg => msg.date);
			if (dryRun)
			{
				console.log('would move ' + messageIds.length + '/' + numMessagesInFolder + ' messages to folder ' + targetFolder.thunMailFolder.path + '( message dates: ' + messageDates + ')')
			}
			else
			{
				console.log('moving ' + messageIds.length + '/' + numMessagesInFolder + ' messages ' + messageIds + ' to folder ' + targetFolder.thunMailFolder.path + '( message dates: ' + messageDates + ')')
				await browser.messages.move(messageIds, targetFolder.thunMailFolder);
			}
		}

		await this.mailMoveHandler.onMailFolderMove(srcFolder, msgHeaders.length, numMessagesInFolder)

		console.log("processFolder: processed " + msgHeaders.length + "/" + numMessagesInFolder + ' messages from ' + await srcFolder.asIdString() + " (thunderbird name = " + srcFolder.thunMailFolder.name + ")");

		// console.log("processing", srcFolder.thunMailFolder.path, "'s subfolders")

		if (srcFolder.thunMailFolder.subFolders)
		{
			let subFolder : browser.folders.MailFolder;
			for (subFolder of srcFolder.thunMailFolder.subFolders)
			{
				// console.log("processFolder: subFolder.path = ", subFolder.path, " (archiveRootFolder.path = "+ archiveRootFolder.thunMailFolder.path + ")")
				if (subFolder.path !== archiveRootFolder.thunMailFolder.path)
				{
					// console.log("processing subFolder.path " + subFolder.path + " != " + archiveRootFolder.thunMailFolder.path)
					this.processFolder(new MyMailFolder(subFolder), archiveRootFolder, startDate, endDate, dryRun);
				}
			}
		}
	}

	// Function to move emails within the specified date range
	async moveEmails(startDate: Date, endDate: Date, dryRun: boolean)
	{
		const archiveRootFolder: MyMailFolder = await this.getArchiveRootFolder()
		console.log("archiveRootFolder.path = " + archiveRootFolder.thunMailFolder.path);
		
		let mail_accounts = await browser.accounts.list();
		for (let mail_account_index in mail_accounts)
		{
			let mail_account: browser.accounts.MailAccount = mail_accounts[mail_account_index]; // You can adjust which account to use
			if (this.archivableEmailAccounts.includes(mail_account.name))
			{
				let rootFolder : browser.folders.MailFolder | undefined = mail_account.rootFolder
				console.log("account = " + mail_account);
				console.log("mail_account.name: " + mail_account.name);  // string, eg "guillaume.raffy.work@gmail.com", "Blogs & News Feeds", "Local Folders"
				console.log("mail_account.id: " + mail_account.id);  // MailAccountId, eg "account4"
				console.log("mail_account.rootFolder: " + rootFolder);  // MailFolder, eg undefined
				console.log("mail_account.type: " + mail_account.type);  // string ('imap', 'pop3', 'rss', 'none'(local folders))
					if (mail_account.folders)
				{
					// let sourceFolder = mail_account.folders.find(folder => folder.name === "IInbox");
					// let targetFolder = mail_account.folders.find(folder => folder.name === "AArchive");
					let folder : browser.folders.MailFolder
					for (folder of mail_account.folders)
					{
						if (folder.path !== archiveRootFolder.thunMailFolder.path)
						{
							await this.processFolder(new MyMailFolder(folder), archiveRootFolder, startDate, endDate, dryRun)
						}
					}
					// throw Error('debug stop 3');
				}
		
			}
			else
			{
				console.log("skipping mail account " + mail_account.name + " because it's not in the list of archivable accounts.")
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
		
		return { success: true };
	}

}


// Listen for messages from the popup
browser.runtime.onMessage.addListener(async (request) => {
	if (request.action === "moveEmails") {
		const testMode = false;
		if (testMode)
		{
			let mailFolderPath = new MailFolderPath([
				"Local Folders",
				"arch",
				"test",
				"toto"
			]);
			let mailFolder = await getMailFolder(mailFolderPath, true);
		}
		else
		{
			const mailMoveHandler = new MailMoveHandler();
			const archiveRootPath = new MailFolderPath(["Local Folders", "arch"]);
			let emailsGrouper = new EmailsGrouper(archiveRootPath, mailMoveHandler);
			const startDate : Date = new Date(request.startDate)
			const endDate : Date = new Date(request.endDate)
			const dryRun: boolean = request.dryRun
			console.log("dryRun = ", dryRun)
			return await emailsGrouper.moveEmails(startDate, endDate, dryRun);
		}
	}
});
