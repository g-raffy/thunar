document.getElementById("move-form")?.addEventListener("submit", async function (event) {
	console.log("on move-form submit: start")
	event.preventDefault();

	// const startDate = document.getElementById("start-date").value;
	// const endDate = document.getElementById("end-date").value;
	const startDate = "2022-02-22"
	const endDate   = "2022-02-23"
	console.log("startDate = " + startDate)

	// if (!startDate || !endDate) {
	// 	document.getElementById("status").innerText = "Please select a date range.";
	// 	return;
	// }

	console.log("on move-form submit: calling moveEmails")

	// Send the date range to the background script
	let response = await browser.runtime.sendMessage({
		action: "moveEmails",
		startDate: startDate,
		endDate: endDate
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
