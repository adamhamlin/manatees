<script lang="ts">
	import { onMount } from 'svelte';
	import ManateeLogo from '$lib/components/ManateeLogo.svelte';

	type Props = {
		text: string;
		type: 'white' | 'black';
		selected?: boolean;
		faceDown?: boolean;
		disabled?: boolean;
		interactive?: boolean;
		cardStyle?: string;
		label?: string;
		maxFontSize?: number;
		pickCount?: number;
		selectionOrder?: number;
		watermark?: string;
		onSelect?: () => void;
	};

	let {
		text,
		type,
		selected = false,
		faceDown = false,
		disabled = false,
		interactive = false,
		cardStyle = '',
		label,
		maxFontSize = 23,
		pickCount,
		selectionOrder,
		watermark = '',
		onSelect
	}: Props = $props();

	let textBox: HTMLDivElement | undefined = $state();
	let fontSize = $state(23);
	let resizeObserver: ResizeObserver | undefined;
	let fitFrame = 0;

	const isDisabled = $derived(disabled || faceDown);
	const accessibleText = $derived(faceDown ? 'Face-down card' : text.replace(/_+/g, ' blank '));

	function fitText(): void {
		if (!textBox || faceDown || !text.trim()) {
			return;
		}

		let lower = 8;
		const cardWidth = textBox.closest('.playing-card')?.clientWidth ?? textBox.clientWidth;
		let upper = Math.min(maxFontSize, Math.max(12, cardWidth * 0.13));
		let bestFit = lower;

		while (upper - lower > 0.25) {
			const candidate = (lower + upper) / 2;
			textBox.style.fontSize = `${candidate}px`;

			if (textBox.scrollHeight <= textBox.clientHeight && textBox.scrollWidth <= textBox.clientWidth) {
				bestFit = candidate;
				lower = candidate;
			} else {
				upper = candidate;
			}
		}

		fontSize = Math.floor(bestFit * 10) / 10;
	}

	function scheduleTextFit(): void {
		cancelAnimationFrame(fitFrame);
		fitFrame = requestAnimationFrame(fitText);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (!interactive || isDisabled || (event.key !== 'Enter' && event.key !== ' ')) {
			return;
		}

		event.preventDefault();
		onSelect?.();
	}

	onMount(() => {
		if (textBox) {
			resizeObserver = new ResizeObserver(scheduleTextFit);
			resizeObserver.observe(textBox);
		}
		scheduleTextFit();

		return () => {
			resizeObserver?.disconnect();
			cancelAnimationFrame(fitFrame);
		};
	});

	$effect(() => {
		text;
		type;
		faceDown;
		scheduleTextFit();
	});

</script>


{#snippet cardContents()}
	{#if faceDown}
		<div
			class="card-back"
			class:white-card-back={type === 'white'}
			class:black-card-back={type === 'black'}
			aria-hidden="true"
		>
			<ManateeLogo mFontStyle="humanist" blackCardBack={type === 'black'} />
			<span class="back-caption">MANATEES</span>
		</div>
	{:else}
		<div class="card-copy" bind:this={textBox}>{text}</div>
	{/if}
	{#if !faceDown}
		<div class="card-footer" aria-hidden="true">
			<span class="brand-mark" class:watermarked={watermark}>{watermark || 'M'}</span>
			<span class="brand-name">MANATEES</span>
		</div>
	{/if}
	{#if type === 'black' && !faceDown && pickCount !== undefined && pickCount > 1}
		<div class="pick-badge" aria-label={`Pick ${pickCount}`}>
			<span>PICK</span>
			<strong>{pickCount}</strong>
		</div>
	{/if}
	{#if selectionOrder !== undefined && selectionOrder > 0}
		<span class="selection-order" aria-hidden="true">{selectionOrder}</span>
	{/if}
{/snippet}

{#if interactive}
	<button
		class="playing-card"
		class:white-card={type === 'white'}
		class:black-card={type === 'black'}
		class:face-down={faceDown}
		class:card-pressed={selected}
		class:disabled={isDisabled}
		type="button"
		disabled={isDisabled}
		aria-label={label ?? accessibleText}
		aria-pressed={selected}
		style={`--card-font-size: ${fontSize}px; ${cardStyle}`}
		onclick={() => onSelect?.()}
	>
		{@render cardContents()}
	</button>
{:else}
	<div
		class="playing-card"
		class:white-card={type === 'white'}
		class:black-card={type === 'black'}
		class:face-down={faceDown}
		class:disabled={disabled}
		style={`--card-font-size: ${fontSize}px; ${cardStyle}`}
		aria-label={label ?? accessibleText}
	>
		{@render cardContents()}
	</div>
{/if}

<style>
	.playing-card {
		--card-ink: #202a2b;
		--card-paper: #fffefa;
		--card-hover-scale: 1.12;
		position: relative;
		container-type: inline-size;
		display: block;
		width: var(--playing-card-width, 100%);
		min-width: 0;
		aspect-ratio: 5 / 7;
		overflow: hidden;
		padding: 0;
		border: 1px solid #a7a7a7;
		border-radius: 0.38rem;
		background: var(--card-paper);
		color: var(--card-ink);
		text-align: left;
		font: inherit;
		-webkit-tap-highlight-color: transparent;
		-webkit-user-select: none;
		user-select: none;
		box-shadow:
			0 1px 1px rgb(22 33 31 / 10%),
			0 2px 4px rgb(22 33 31 / 8%),
			inset 0 0 0 1px rgb(255 255 255 / 72%);
		transition: transform 220ms cubic-bezier(0.2, 0.75, 0.25, 1), box-shadow 220ms ease, outline-color 160ms ease;
	}

	.black-card {
		--card-paper: #231f20;
		--card-ink: #fffefa;
		border-color: #121415;
		background-color: var(--card-paper);
		background-image:
			linear-gradient(180deg, #231f20 0%, #231f20 78%, #302d2e 100%),
			repeating-linear-gradient(0deg, rgb(255 255 255 / 1.1%) 0 1px, transparent 1px 3px);
		background-blend-mode: normal, soft-light;
		box-shadow:
			0 1px 2px rgb(0 0 0 / 28%),
			0 3px 8px rgb(0 0 0 / 18%),
			inset 0 0 0 1px rgb(255 255 255 / 10%);
	}

	.white-card {
		background-image:
			linear-gradient(180deg, #fff 0%, #fff 78%, #f2f1ec 100%),
			repeating-linear-gradient(0deg, rgb(35 31 32 / 1%) 0 1px, transparent 1px 3px);
		background-blend-mode: normal, multiply;
	}

	.card-copy {
		position: absolute;
		inset: 0.96rem 0.82rem 2.65rem;
		overflow: auto;
		font-family: Arial, Helvetica, sans-serif;
		font-size: var(--card-font-size, 23px);
		font-weight: 500;
		line-height: 1.14;
		letter-spacing: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		word-break: normal;
		scrollbar-width: thin;
	}

	.card-footer {
		position: absolute;
		right: clamp(0.3rem, 4.8cqi, 0.72rem);
		bottom: clamp(0.28rem, 4.1cqi, 0.62rem);
		left: clamp(0.3rem, 4.8cqi, 0.72rem);
		display: flex;
		align-items: center;
		gap: clamp(0.15rem, 2.3cqi, 0.35rem);
		color: currentColor;
		font: 700 clamp(0.42rem, 4.5cqi, 0.68rem)/1 Arial, Helvetica, sans-serif;
		letter-spacing: 0.02em;
	}

	.pick-badge {
		position: absolute;
		right: clamp(0.3rem, 4.8cqi, 0.72rem);
		bottom: clamp(0.25rem, 3.5cqi, 0.52rem);
		display: flex;
		align-items: center;
		gap: clamp(0.15rem, 2cqi, 0.3rem);
		color: currentColor;
		font: 800 clamp(0.5rem, 5.4cqi, 0.82rem)/1 Arial, Helvetica, sans-serif;
	}

	.pick-badge strong {
		display: grid;
		width: clamp(0.84rem, 8.8cqi, 1.3rem);
		aspect-ratio: 1;
		place-items: center;
		border-radius: 50%;
		background: #fffefa;
		color: #231f20;
		font-size: clamp(0.55rem, 5.7cqi, 0.85rem);
	}

	.brand-mark {
		display: grid;
		width: clamp(0.74rem, 7.6cqi, 1.14rem);
		min-width: clamp(0.74rem, 7.6cqi, 1.14rem);
		max-width: 3.5rem;
		height: clamp(0.74rem, 7.6cqi, 1.14rem);
		aspect-ratio: 1;
		place-items: center;
		padding-inline: 0.12rem;
		overflow: hidden;
		border: 1px solid currentColor;
		border-radius: 0.25rem 0.25rem 0.45rem 0.25rem;
		font-size: clamp(0.48rem, 5cqi, 0.74rem);
		letter-spacing: 0;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.brand-mark.watermarked {
		width: auto;
		min-width: 1rem;
		max-width: min(5rem, 42%);
		aspect-ratio: auto;
		flex: 0 0 auto;
		font-size: clamp(0.37rem, 3.3cqi, 0.48rem);
		letter-spacing: 0.01em;
		text-transform: uppercase;
	}

	.brand-name {
		opacity: 0.78;
	}

	.selection-order {
		position: absolute;
		bottom: clamp(0.28rem, 4.1cqi, 0.62rem);
		right: 0.55rem;
		z-index: 2;
		display: grid;
		width: 1.35rem;
		aspect-ratio: 1;
		place-items: center;
		border-radius: 50%;
		background: #5361cb;
		color: white;
		font: 800 0.8rem/1 Arial, Helvetica, sans-serif;
		box-shadow: 0 1px 3px rgb(22 33 31 / 24%);
	}

	.card-back {
		position: absolute;
		inset: 0.4rem;
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 0.55rem;
		border-radius: 0.32rem;
	}

	.black-card-back {
		--manatee-belly-color: #292526;
		border: 1px solid rgb(255 255 255 / 24%);
		background: repeating-linear-gradient(135deg, #292526 0 0.55rem, #353132 0.55rem 1.1rem);
		box-shadow: inset 0 0 0 2px rgb(0 0 0 / 24%);
		color: #fffefa;
	}

	.white-card-back {
		--manatee-belly-color: #fff;
		border: 1px solid #a7a7a7;
		background: repeating-linear-gradient(135deg, #fff 0 0.55rem, #f0efeb 0.55rem 1.1rem);
		box-shadow: inset 0 0 0 2px rgb(35 31 32 / 8%);
		color: #231f20;
	}

	.card-back :global(.manatee-logo) {
		width: 78%;
		max-width: none;
		color: inherit;
		transform: translateY(0.6rem);
	}

	.back-caption {
		font: 700 0.62rem/1 Arial, Helvetica, sans-serif;
		letter-spacing: 0.14em;
	}

	.black-card.face-down .card-footer {
		color: rgb(255 254 250 / 88%);
	}

	.white-card.face-down .card-footer {
		color: rgb(35 31 32 / 82%);
	}

	button.playing-card:enabled {
		cursor: pointer;
	}

	.card-pressed {
		border-color: #5361cb;
		z-index: 1;
		box-shadow:
			0 5px 12px rgb(22 33 31 / 20%),
			inset 0 0 0 3px rgb(83 97 203 / 78%);
	}

	.disabled {
		filter: grayscale(0.8);
		opacity: 0.58;
		cursor: default;
	}

	@media (hover: hover) and (pointer: fine) {
		button.playing-card:enabled:hover {
			transform: scale(var(--card-hover-scale));
			transform-origin: center center;
			z-index: 5;
			box-shadow:
				0 13px 22px rgb(22 33 31 / 24%),
				inset 0 0 0 2px rgb(255 255 255 / 62%);
		}

		button.playing-card.card-pressed:hover {
			transform: scale(var(--card-hover-scale));
			border-color: #5361cb;
			box-shadow:
				0 13px 22px rgb(22 33 31 / 24%),
				inset 0 0 0 3px rgb(83 97 203 / 78%);
		}
	}

	@media (max-width: 480px) {
		.playing-card {
			--card-hover-scale: 1.08;
		}
	}

	button.playing-card:focus-visible {
		outline: 3px solid #5361cb;
		outline-offset: 3px;
	}

	@media (prefers-reduced-motion: reduce) {
		.playing-card {
			transition: none;
		}
	}
</style>