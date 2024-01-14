const DICTIONARY: { [char: string]: number } = {
	red: 63,
	orange: 64,
	yellow: 65,
	green: 66,
	blue: 67,
	violet: 68,
	white: 69,
	black: 70,
	filled: 71,
};

function TransformToken(s: string): string {
	if (s.startsWith(':') && s.endsWith(':')) {
		const char = s.split(':')[1];
		const code = DICTIONARY[char];
		if (code) {
			return `{${code}}`;
		} else {
			return s;
		}
	} else {
		return s;
	}
}

export function TransformInput(s: string): string {
	return s.split(' ').map(TransformToken).join(' ');
}
