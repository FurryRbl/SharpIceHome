<template>
	<div class="space-y-2">
		<ul class="flex flex-wrap items-center justify-center space-x-2 pl-4">
			<li>
				<p>我在做什么 / </p>
			</li>
			<li class="flex items-center space-x-1">
				<healingIcon aria-hidden="true" />
				<span>移植</span>
			</li>
			<li class="flex items-center space-x-1">
				<codeIcon aria-hidden="true" />
				<span>开发</span>
			</li>
			<li class="flex items-center space-x-1">
				<translateIcon aria-hidden="true" />
				<span>本地化</span>
			</li>
		</ul>
	</div>
</template>

<script>
import codeIcon from '@fortawesome/fontawesome-free/svgs/solid/code.svg';
import healingIcon from '@material-design-icons/svg/outlined/healing.svg';
import translateIcon from '@material-design-icons/svg/outlined/translate.svg';

export default {
	name: 'TechnicalStrengthComponent',
	components: {
		codeIcon,
		healingIcon,
		translateIcon,
	},
};
</script>
