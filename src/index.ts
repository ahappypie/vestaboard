import { TransformInput } from './characters.ts';
import { VBClient } from './client.ts';
import { VBMLComponentTemplate } from './component.ts';

const input = ':red: Hello Red!';
const outputString = TransformInput(input);
console.log(outputString);

const req = {
	components: [new VBMLComponentTemplate({ template: input })],
};
const outputMessage = await VBClient.Compose(req);

console.log(outputMessage);
