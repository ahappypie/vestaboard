import { VBMLComponentTemplate } from './component.ts';
import { VBClient } from './client.ts';

async function main() {
	const client = new VBClient();

	const ct = new VBMLComponentTemplate({
		template: '{{hour}}:{{minute}}',
		style: {
			justify: 'center',
			align: 'center',
		},
	});

	let date = new Date();

	const firstDisplay = await GetClock(date, ct);
	// await client.SendMessage(firstDisplay);
	console.log('set clock')

	setInterval(async () => {
		const newDate = new Date();
		if(newDate.getFullYear() > date.getFullYear()
			|| newDate.getMonth() > date.getMonth()
			|| newDate.getDate() > date.getDate()
			|| newDate.getHours() > date.getHours()
			|| newDate.getMinutes() > date.getMinutes()) {
			date = newDate;
			const display = await GetClock(date, ct);
			// await client.SendMessage(display);
			console.log('update clock')
		}
	}, 1000);
}
main();

async function GetClock(date: Date, ct: VBMLComponentTemplate) {
	const hours = hours_with_zeroes(date);
	const minutes = minutes_with_zeros(date);
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
