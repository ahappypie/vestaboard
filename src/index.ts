import { TransformInput } from './characters';
import { VBClient } from './client';
import { VBMLComponentTemplate } from './component';
async function main() {
	const input = ':red: Hello Red!';
	const outputString = TransformInput(input);
	console.log(outputString);

	const req = {
		components: [new VBMLComponentTemplate({ template: input })],
	};
	const outputMessage = await VBClient.Compose(req);

	console.log(outputMessage);
}
main();
