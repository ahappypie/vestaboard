import { VBMLComponentTemplate } from './component';
import { VBClient } from './client';

async function main() {
	const client = new VBClient();

	const ct = new VBMLComponentTemplate({
		template: '{{hour}}:{{minute}}',
		style: {
			justify: 'center',
			align: 'center',
		},
	});

	const firstDisplay = await GetClock(ct);
	await client.SendMessage(firstDisplay);

	setInterval(async () => {
		const display = await GetClock(ct);
		await client.SendMessage(display);
	}, 1000 * 60);
}
main();

async function GetClock(ct: VBMLComponentTemplate) {
	const d = new Date();
	const hours = hours_with_zeroes(d);
	const minutes = minutes_with_zeros(d);
	return await VBClient.Compose({
		props: {
			hour: hours,
			minute: minutes,
		},
		components: [ct],
	});
}

function hours_with_zeroes(dt: Date) {
	return ((dt.getHours() % 12 || 12) < 10 ? '0' : '') +
		(dt.getHours() % 12 || 12);
}

function minutes_with_zeros(dt: Date) {
	return (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes();
}
