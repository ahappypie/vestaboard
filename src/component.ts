import { TransformInput } from './characters.ts';

interface VBMLStyle {
	height?: number;
	width?: number;
	justify?: 'left' | 'right' | 'center' | 'justified';
	align?: 'top' | 'bottom' | 'center';
}
interface VBMLComponentTemplateProps {
	template: string;
	style?: VBMLStyle;
}

interface VBMLComponent {
	template: string;
	style?: VBMLStyle;
}
export class VBMLComponentTemplate {
	readonly template: string;
	readonly style?: VBMLStyle;
	constructor(props: VBMLComponentTemplateProps) {
		this.template = props.template;
		this.style = props.style;
	}

	render(): VBMLComponent {
		return {
			template: TransformInput(this.template),
			style: this.style,
		};
	}
}
