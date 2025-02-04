function onMailFolderMoved(srcFolder: string, dstFolder: string, numMailsMoved: number, numMessagesInFolder: number)
{
	console.log("onMailFolderMoved: srcFolder =" + srcFolder);

	let mailFoldersTable = document.getElementById("processed-email-folders") as HTMLElement;
	console.log("mailFoldersTable = ", mailFoldersTable)

	let row: HTMLElement = document.createElement('tr') as HTMLTableRowElement
	let srcFolderCell = document.createElement('td') as HTMLTableCellElement;
	srcFolderCell.textContent = srcFolder;
	row.appendChild(srcFolderCell)

	let dstFolderCell = document.createElement('td') as HTMLTableCellElement;
	dstFolderCell.textContent = dstFolder;
	row.appendChild(dstFolderCell)

	let numMessagesCell = document.createElement('td') as HTMLTableCellElement;
	numMessagesCell.textContent = numMailsMoved.toString() + "/" + numMessagesInFolder.toString();
	row.appendChild(numMessagesCell)

	mailFoldersTable.appendChild(row)
}

// handler called whenever an event browser.runtime.onMessage is triggered
// this handler is used to hadle messages sent by the asynchronous emailsGrouper.moveEmails function (which doesn't have acces to the DOM, see below)

// Why Can't moveEmails Access the DOM?

// moveEmails runs in the background script, which operates independently from the popup (or content script). It doesn't have access to the DOM because the background script doesn't share the same execution environment as the popup. The background script is designed to be persistent and can handle tasks like moving emails across folders, but the user interface and DOM are managed by the popup script (or content script if dealing with a webpage).

// In WebExtensions, background scripts and popup scripts (or content scripts) communicate through message passing, where one script sends a message to another, and that script can perform actions (like updating the DOM).
// Solution: Message Passing Between Background Script and Popup

// To solve the issue, the moveEmails function should send progress updates or results to the popup script, which then updates the DOM.

// Here’s a quick summary of how this works:

//     Background Script (moveEmails):
//         Handles the email-moving operation and uses browser.runtime.sendMessage to send progress or result messages to the popup.

//     Popup Script:
//         Listens for messages using browser.runtime.onMessage.addListener and updates the DOM based on the received messages.

// Architecture Example:

//     Background Script (moveEmails):
//         No access to the DOM.
//         Responsible for moving emails and sending status updates using browser.runtime.sendMessage.

//     Popup Script:
//         Listens for messages from the background script and modifies the DOM (e.g., displays status reports in the status div).

// This separation ensures that each part of the extension does its job in a modular way: background scripts handle logic and API calls, while popup/content scripts handle user interaction and DOM manipulation.

function onMessage(message: any): boolean
{
	console.log("onMessage:");
	if (message.type)
	{
		console.log("onMessage: message.type =" + message.type);
		if (message.type === 'mail-folder-processed')
		{
			onMailFolderMoved(message.srcFolder, message.dstFolder, message.numMailsMoved, message.numMessagesInFolder);
			return true;
		}
	}
	return false;
}

// Listen for reports from the background script
browser.runtime.onMessage.addListener(onMessage);

document.getElementById("move-form")?.addEventListener("submit", async function (event) {
	console.log("on move-form submit: start")
	event.preventDefault();

	// const startDateString = document.getElementById("start-date").value;
	// const endDateString = document.getElementById("end-date").value;
	const startDateString = "2022-02-22"
	const endDateString   = "2022-02-23"
	console.log("startDate = " + startDateString)

	// if (!startDateString || !endDateString) {
	// 	document.getElementById("status").innerText = "Please select a date range.";
	// 	return;
	// }

	const dryRun = (document.getElementById("dry-run") as HTMLFormElement).value;

	console.log("on move-form submit: calling moveEmails")

	// Send the date range to the background script
	let response = await browser.runtime.sendMessage({
		action: "moveEmails",
		startDate: startDateString,
		endDate: endDateString,
		dryRun: dryRun
	});
	console.log("on move-form submit: moveEmails completed")

	// Display status
	const statusElement = document.getElementById("status") as HTMLElement;
	if (response.success) {
		statusElement.innerText = "Emails moved successfully!";
	} else {
		statusElement.innerText = "Failed to move emails.";
	}
	console.log("on move-form submit: end")
});
