import axios, { AxiosResponse } from 'npm:axios@1.6.5';
import { VBMessage } from './types.ts';
import { VBMLComponentTemplate } from './component.ts';

interface ComposeRequest {
	props?: { [key: string]: string };
	components: VBMLComponentTemplate[];
}
interface RWResponse {
	status: string;
	id: string;
	created: string;
}
export class VBClient {
	private rw;
	constructor() {
		this.rw = axios.create({
			baseURL: `https://rw.vestaboard.com`,
			timeout: 1000,
			headers: { 'X-Vestaboard-Read-Write-Key': Deno.env.get('VB_RW_KEY') },
		});
	}

	static async Compose(req: ComposeRequest): Promise<VBMessage> {
		const res: AxiosResponse<VBMessage> = await axios.post(
			'https://vbml.vestaboard.com/compose',
			{
				props: req.props,
				components: req.components.map((c) => c.render()),
			},
		);

		return res.data;
	}

	async SendMessage(message: VBMessage): Promise<RWResponse> {
		const res: AxiosResponse<RWResponse> = await this.rw.post('/', message);
		return res.data;
	}
}
