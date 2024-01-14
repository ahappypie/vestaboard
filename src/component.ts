import { TransformInput } from './characters';

interface VBMLStyle {
	height?: Number;
	width?: Number;
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
