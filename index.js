const fs = require('fs');

const { username, password } = JSON.parse(fs.readFileSync(require.resolve('./config.json')));

const puppeteer = require('puppeteer');

const URL_FRESH = 'https://www.amazon.com/gp/buy/shipoptionselect/handlers/display.html?hasWorkingJavascript=1';
const URL_HOMEPAGE = 'https://www.amazon.com';
const CHECK_INTERVAL_MIN_RANGE = [ 1, 5 ]; // 1 - 5min

function waitAndClick(page, selector, waitOptions = {}, clickOptions = {}) {
	return Promise.all([ page.waitForNavigation(waitOptions), page.click(selector, clickOptions) ]);
}

async function waitAndFunc(page, func) {
	await page.waitForNavigation({ waitUntil: [ 'networkidle0' ] });
	await func();
}

(async () => {
	// const browser = await puppeteer.launch({ headless: false }); // headless as false
	const browser = await puppeteer.launch();

	const page = await browser.newPage();
	await page.goto(URL_HOMEPAGE);

	await waitAndClick(page, '#nav-signin-tooltip > a > span');

	// await waitAndFunc(page, async () => {
	// 	await page.keyboard.type(username, { delay: 100 });
	// });

	await page.keyboard.type(username, { delay: 100 });
	// await page.waitForNavigation();
	// await page.keyboard.type(username);

	await waitAndClick(page, '#continue');

	// await waitAndFunc(page, async () => {
	// 	await page.keyboard.type(password, { delay: 100 });
	// });

	await page.keyboard.type(password, { delay: 100 });

	await waitAndClick(page, '#auth-signin-button');

	await waitAndClick(page, '#nav-cart');

	await waitAndClick(page, 'input[name ^= "proceedToALMCheckout"]');

	await waitAndClick(page, 'a[name="proceedToCheckout"]');

	while (1) {
		await intervalFunc(page);
		const intervalMin =
			Math.round(
				(CHECK_INTERVAL_MIN_RANGE[0] + CHECK_INTERVAL_MIN_RANGE[1] * Math.random() + Number.EPSILON) * 100
			) / 100;
		console.log(`next check will be in ${intervalMin} mins`);

		await new Promise(function(resolve) {
			setTimeout(resolve, 1000 * 60 * intervalMin);
		});
	}
	// setInterval(() => intervalFunc(page), CHECK_INTERVAL);

	console.log();
	// await browser.close();
})();

async function checkProcess(page) {
	await page.reload({ waitUntil: [ 'networkidle0', 'domcontentloaded' ] });
	try {
		await page.waitForSelector('.ufss-slotselect-unavailable-alert-container', { timeout: 5000 });
		return false;
	} catch (error) {
		return true;
	}
}

async function intervalFunc(page) {
	const hasSlot = await checkProcess(page);
	if (hasSlot) {
		console.log('has slot!!!!!!');
	} else {
		console.log('no slot');
	}
}
