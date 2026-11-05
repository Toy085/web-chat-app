import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	lang: (param) => {
		if (param !== 'en' && param !== 'no') return;
		return param;
	}
});