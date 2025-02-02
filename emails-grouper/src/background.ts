
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

class MailFolder
{
	mailFolderPath: MailFolderPath
	thunMailFolder: browser.folders.MailFolder  // thunderbird mail folder

	constructor(mailFolderPath: MailFolderPath, thunMailFolder: browser.folders.MailFolder)
	{
		this.mailFolderPath = mailFolderPath
		this.thunMailFolder = thunMailFolder
	}
}

class MailMoveHandler
{
	constructor()
	{
	}

	onMailFolderMove(srcFolder: browser.folders.MailFolder, numMessagesMoved: number)
	{
		browser.runtime.sendMessage({ type:"mail-folder-processed", srcFolder: srcFolder.path, dstFolder: "", numMailsMoved: numMessagesMoved });
	}
}


async function getSubMailFolder(rootFolder: browser.folders.MailFolder, subPath: string[], createMissingFolders: boolean = false): Promise<browser.folders.MailFolder | null>
{
	console.log("getSubMailFolder: searching ", subPath, " in ", rootFolder.name, "subfolders")
	if (subPath.length === 0)
	{
		console.log("getSubMailFolder: rootFolder.path = ", rootFolder.path)
		return rootFolder;
	}
	else
	{
		let subMailFolder: browser.folders.MailFolder | null = null
		let firstFolderName: string = subPath.shift() as string;
		if (rootFolder.subFolders)
		{
			// let sourceFolder = mail_account.folders.find(folder => folder.name === "IInbox");
			// let targetFolder = mail_account.folders.find(folder => folder.name === "AArchive");
			let folder : browser.folders.MailFolder
			for (folder of rootFolder.subFolders)
			{
				// console.log("getSubMailFolder: folder = ", folder.name)
				if (folder.name === firstFolderName){
					subMailFolder = folder;
				}
			}
		}

		if ((subMailFolder === null) && (createMissingFolders))
		{
			// ensure "accountsFolders" permission is set to avoid the confusing error "browser.folders.create is not a function"
			subMailFolder = await browser.folders.create(rootFolder, firstFolderName)
		}

		if ((subMailFolder === null))
		{
			throw Error('failed to find child folder ' + firstFolderName + ' in ' + rootFolder.name);
		}
		else
		{
			subMailFolder = await getSubMailFolder(subMailFolder, subPath, createMissingFolders);
		}
		console.log("getSubMailFolder: subMailFolder.path = ", subMailFolder?.path)
		return subMailFolder
	}
}

async function getMailFolder(mailFolderAbsPath: MailFolderPath, createMissingFolders: boolean = false): Promise<browser.folders.MailFolder | null>
{
	console.log("getMailFolder: mailFolderAbsPath = ", mailFolderAbsPath)
	// mailFolderAbsPath: eg ["guillaume.raffy.work@gmail.com", "Inbox"]
	let subPathParts: string[] = [...mailFolderAbsPath.getPathParts()]
	let mailAccountName = subPathParts.shift();  // eg "guillaume.raffy.work@gmail.com"
	let mailFolder: browser.folders.MailFolder | null = null;
	let mailAccounts: browser.accounts.MailAccount[] = await browser.accounts.list();
	let targetMailAccount: browser.accounts.MailAccount | null = null;
	for(let mailAccount of mailAccounts)
	{
		console.log("getMailFolder: mailAccount = ", mailAccount.name)
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
		console.log("getMailFolder: firstFolderName = ", firstFolderName)
		let targetFolder : browser.folders.MailFolder | null = null
		if (targetMailAccount.folders)
		{
			// let sourceFolder = mail_account.folders.find(folder => folder.name === "IInbox");
			// let targetFolder = mail_account.folders.find(folder => folder.name === "AArchive");
			let folder : browser.folders.MailFolder
			for (folder of targetMailAccount.folders)
			{
				console.log("getMailFolder: folder = ", folder.name)
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
			mailFolder = await getSubMailFolder(targetFolder, subPathParts, createMissingFolders);
		}
	}
	console.log("getMailFolder: mailFolder.path = ", mailFolder?.path)
	return mailFolder;
}

async function ensureMailFolderExists(mailFolderPath: MailFolderPath): Promise<browser.folders.MailFolder>
{
	let mailFolder: browser.folders.MailFolder
	// mailFolderPath example:  ["Local Folders", "arch", "2024", "guillaume.raffy@univ-rennes1.fr"]
	mailFolder = await getMailFolder(mailFolderPath, true) as browser.folders.MailFolder;
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


class EmailsGrouper
{
	archiveRootFolderPath: MailFolderPath;  // eg ["LocalFolders", "arch", "test"]
	mailMoveHandler: MailMoveHandler;


	constructor(archiveRootFolderPath: MailFolderPath, mailMoveHandler: MailMoveHandler)
	{
		this.archiveRootFolderPath = archiveRootFolderPath;
		this.mailMoveHandler = mailMoveHandler;
	}

	async getArchiveRootFolder(): Promise<browser.folders.MailFolder>
	{
		return await getMailFolder(this.archiveRootFolderPath) as browser.folders.MailFolder;
	}


	static async ensureArchiveFolderExists(srcFolder: browser.folders.MailFolder, archiveRootFolder: browser.folders.MailFolder, year: number): Promise<browser.folders.MailFolder>
	{
		// srcFolder : the mail folder to archive, eg name=Indox (path "/INBOX")
		// archiveRootFolder : the mail folder representing the root of all archives, eg path "/arch/test"
		// year : the year we want to archive

		// result : the mail folder to use to archive srcFolder's messages, eg "/arch/test/2022/Inbox"

		console.log('ensureArchiveFolderExists: srcFolder.path = ' + srcFolder.path)
		console.log('ensureArchiveFolderExists: archiveRootFolder.path = ' + archiveRootFolder.path)
		console.log('ensureArchiveFolderExists: year = ' + year)

		const srcFolderAbsName: MailFolderPath = await getMailFolderAbsName(srcFolder);  // eg [ "guillaume.raffy@univ-rennes1.fr", "Inbox"]
		let archivePath: MailFolderPath = await getMailFolderAbsName(archiveRootFolder);  // eg [ "Local Folders", "arch", "test"]
		archivePath.pathParts.push(year.toString());
		for (let pathPart of srcFolderAbsName.pathParts)
		{
			archivePath.pathParts.push(pathPart);
		}

		// at this point, archivePath should look like [ "Local Folders", "arch", "test", "2022", "guillaume.raffy@univ-rennes1.fr", "Inbox"]
		console.log('ensureArchiveFolderExists: archivePath = ' + archivePath)

		const testModeIsOn = false;
		if (testModeIsOn)
		{
			throw Error("debug stop on archivePath : " + archivePath);
		}
		const archiveFolder = await ensureMailFolderExists(archivePath);
		return archiveFolder
	}

	async processFolder(srcFolder: browser.folders.MailFolder, archiveRootFolder: browser.folders.MailFolder, startDate: Date, endDate: Date, dryRun: boolean)
	{
		console.log("processFolder: moving ", srcFolder.path, "'s messages")

		let messages: browser.messages.MessageList = await browser.messages.list(srcFolder);

		// Convert the date range to timestamps
		const startTimestamp = startDate.getTime();
		const endTimestamp = endDate.getTime();

		const archiveYear = startDate.getFullYear();
		if ( endDate.getFullYear() !== archiveYear )
		{
			throw new Error("startDate (" + startDate + ") and endDate (" + endDate + ") are expected to have the same year");
		}

		// Filter messages by date range
		// let messagesToMove = messages.messages.filter(msg => {
		// 	let messageDate = new Date(msg.date).getTime();
		// 	return messageDate >= startTimestamp && messageDate <= endTimestamp;
		// });

		let messagesToMove = messages.messages.filter(msg => {
			return true;
		});

		if (messagesToMove.length === 0)
		{
			console.log("No messages found in the specified date range.");
		}
		else
		{
			const targetFolder = await EmailsGrouper.ensureArchiveFolderExists(srcFolder, archiveRootFolder, archiveYear)
			// Move the filtered messages to the target folder
			let messageIds = messagesToMove.map(msg => msg.id);
			if (dryRun)
			{
				console.log('would move messages ' + messageIds + ' to folder ' + targetFolder.path)
			}
			else
			{
				console.log('moving messages ' + messageIds + ' to folder ' + targetFolder.path)
				// await browser.messages.move(messageIds, targetFolder);
			}
		}

		this.mailMoveHandler.onMailFolderMove(srcFolder, messagesToMove.length)

		console.log("processing", srcFolder.path, "'s subfolders")

		if (srcFolder.subFolders)
		{
			let subFolder : browser.folders.MailFolder;
			for (subFolder of srcFolder.subFolders)
			{
				console.log("processFolder: subFolder.path = ", subFolder.path, " (archiveRootFolder.path = "+ archiveRootFolder.path + ")")
				if (subFolder.path !== archiveRootFolder.path)
				{
					console.log("processing subFolder.path " + subFolder.path + " != " + archiveRootFolder.path)
					this.processFolder(subFolder, archiveRootFolder, startDate, endDate, dryRun);
				}
			}
		}
	}

	// Function to move emails within the specified date range
	async moveEmails(startDate: Date, endDate: Date, dryRun: boolean)
	{
		const archiveRootFolder: browser.folders.MailFolder = await this.getArchiveRootFolder()
		console.log("archiveRootFolder.path = " + archiveRootFolder.path);

		const archivable_email_accounts = [
			"guillaume.raffy@univ-rennes1.fr",
			// "guillaume.raffy.work@gmail.com",
			//"Local Folders"
		]
		
		let mail_accounts = await browser.accounts.list();
		for (let mail_account_index in mail_accounts)
		{
			let mail_account: browser.accounts.MailAccount = mail_accounts[mail_account_index]; // You can adjust which account to use
			if (archivable_email_accounts.includes(mail_account.name))
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
						console.log("folder.id = " + folder.id);
						console.log("folder.path = " + folder.path);
						console.log("folder.name = " + folder.name);
						if (folder.path !== archiveRootFolder.path)
						{
							await this.processFolder(folder, archiveRootFolder, startDate, endDate, dryRun)
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
			const archiveRootPath = new MailFolderPath(["Local Folders", "arch", "test"]);
			let emailsGrouper = new EmailsGrouper(archiveRootPath, mailMoveHandler);
			const startDate : Date = new Date(request.startDate)
			const endDate : Date = new Date(request.endDate)
			const dryRun: boolean = request.dryRun
			console.log("dryRun = ", dryRun)
			return await emailsGrouper.moveEmails(startDate, endDate, dryRun);
		}
	}
});
