<script lang="ts">
	import ManateeLogo from '$lib/components/ManateeLogo.svelte';
	import PlayingCard from '$lib/components/PlayingCard.svelte';

	let selectedCard = $state('white-short');

	const whiteCards = [
		{ id: 'white-short', text: 'Illegal immigrants.', watermark: 'BASE' },
		{ id: 'white-medium', text: 'A fat bald man from the internet.', watermark: 'HOLIDAY' },
		{
			id: 'white-long',
			text: 'The unbelievably long consequence of an excessively complicated plan, involving an international committee, several suspiciously specific spreadsheets, and one person who insisted the whole thing would be easy.',
			watermark: 'LONG TEXT DECK'
		}
	];

	const blackCards = [
		{ id: 'black-short', text: 'Why am I Sticky?', watermark: 'BASE' },
		{ id: 'black-medium', text: "Why can't I sleep at night?", watermark: 'HOLIDAY' },
		{
			id: 'black-blanks',
			text: '___ is a sure sign of ___,\nunless you are ___. Then it is probably just ___.',
			watermark: 'PROMPTS',
			pickCount: 2
		}
	];
</script>

<svelte:head>
	<title>Manatees Logo Preview</title>
	<meta name="description" content="Manatees logo outline preview" />
</svelte:head>

<main>
	<header>
		<p class="eyebrow">Logo preview</p>
		<h1>Manatees</h1>
	</header>
	<section aria-labelledby="logo-title">
		<h2 id="logo-title">M font comparison</h2>
		<div class="logo-comparison">
			<article class="logo-option">
				<ManateeLogo mFontStyle="current" />
				<h3>Current</h3>
				<p>Bold sans</p>
			</article>
			<article class="logo-option">
				<ManateeLogo mFontStyle="serif" />
				<h3>Serif</h3>
				<p>Classic contrast</p>
			</article>
			<article class="logo-option">
				<ManateeLogo mFontStyle="rounded" />
				<h3>Rounded</h3>
				<p>Soft terminals</p>
			</article>
			<article class="logo-option">
				<ManateeLogo mFontStyle="condensed" />
				<h3>Condensed</h3>
				<p>Narrow footprint</p>
			</article>
			<article class="logo-option">
				<ManateeLogo mFontStyle="humanist" />
				<h3>Humanist</h3>
				<p>Open forms</p>
			</article>
		</div>
	</section>

	<section aria-labelledby="white-title">
		<h2 id="white-title">White cards</h2>
		<div class="card-grid">
			{#each whiteCards as card (card.id)}
				<PlayingCard
					text={card.text}
					type="white"
					watermark={card.watermark}
					interactive
					selected={selectedCard === card.id}
					onSelect={() => (selectedCard = selectedCard === card.id ? '' : card.id)}
				/>
			{/each}
		</div>
	</section>

	<section aria-labelledby="black-title">
		<h2 id="black-title">Black cards</h2>
		<div class="card-grid">
			{#each blackCards as card (card.id)}
				<PlayingCard text={card.text} type="black" watermark={card.watermark} pickCount={card.pickCount} />
			{/each}
		</div>
	</section>

	<section aria-labelledby="back-title">
		<h2 id="back-title">Face-down cards</h2>
		<div class="card-grid face-down-grid">
			<PlayingCard text="Hidden response" type="white" faceDown />
			<PlayingCard text="Hidden prompt" type="black" faceDown />
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		align-content: start;
		gap: 2rem;
		width: min(100% - 2rem, 72rem);
		margin: 0 auto;
		padding: 2rem 0 3rem;
		color: #202a2b;
	}

	header {
		display: grid;
		gap: 0.35rem;
	}

	.eyebrow {
		margin: 0;
		color: #087e78;
		font-size: 0.72rem;
		font-weight: 800;
		text-transform: uppercase;
	}

	h1,
	h2 {
		margin: 0;
	}

	h1 {
		font-size: 2rem;
	}

	section {
		display: grid;
		gap: 0.8rem;
	}

	section h2 {
		font-size: 1.15rem;
	}

	.logo-comparison {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		align-items: start;
		gap: 0.75rem;
	}

	.logo-option {
		display: grid;
		justify-items: center;
		align-content: start;
		gap: 0.5rem;
		min-width: 0;
		padding: 0.65rem;
		border: 1px solid #d9e1de;
		background: #fffefa;
		text-align: center;
	}

	.logo-option :global(.manatee-logo) {
		width: 100%;
	}

	.logo-option h3,
	.logo-option p {
		margin: 0;
	}

	.logo-option h3 {
		font-size: 0.85rem;
	}

	.logo-option p {
		color: #647274;
		font-size: 0.72rem;
		line-height: 1.3;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 11rem), 1fr));
		align-items: start;
		gap: 1rem;
		max-width: 100%;
		padding-inline: 0.65rem;
	}

	.face-down-grid {
		width: min(100%, 24rem);
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media (max-width: 600px) {
		main {
			width: min(100% - 1rem, 72rem);
			padding-top: 1rem;
		}

		.logo-comparison {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

			.card-grid {
				grid-template-columns: repeat(2, minmax(0, 1fr));
				gap: 0.7rem;
			}
	}
</style>