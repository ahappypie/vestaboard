import axios, { AxiosError, AxiosResponse } from 'npm:axios@1.6.5';
import { VBMessage } from './types.ts';
import { VBMLComponentTemplate } from './component.ts';
import {TransformInput} from "./characters.ts";

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
			baseURL: `https://rw.vestaboard.com/`,
			timeout: 1000,
			headers: { 'X-Vestaboard-Read-Write-Key': Deno.env.get('VB_RW_KEY') },
		});
	}

	static async Compose(req: ComposeRequest): Promise<VBMessage> {
		const props = req.props;
		if(props) {
			Object.keys(props).forEach(p => {
				props[p] = TransformInput(props[p])
			})
		}
		const res: AxiosResponse<VBMessage> = await axios.post(
			'https://vbml.vestaboard.com/compose',
			{
				props: props,
				components: req.components.map((c) => c.render()),
			},
		);

		return res.data;
	}

	async SendMessage(message: VBMessage): Promise<RWResponse | AxiosError> {
		try {
			const res: AxiosResponse<RWResponse> = await this.rw.post('/', message);
			return res.data;
		} catch (e: any) {
			if(e.response.status === 304) {
				console.log('no changes since last request')
				return {status: 'not modified', id: '', created: ''};
			} else {
				console.error(e)
				return e as AxiosError
			}
		}
	}
}
