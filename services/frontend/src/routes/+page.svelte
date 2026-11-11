<script lang="ts">
	import ManateeLogo from '$lib/components/ManateeLogo.svelte';
	import { hasSessionToken } from '$lib/utils/session-utils';

	const hasSession = hasSessionToken();
</script>

<main>
	<section>
		<div class="page-logo"><ManateeLogo mFontStyle="humanist" /></div>
		<p class="eyebrow">Manatees</p>
		<h1>Play a card game with friends.</h1>
		<div class="actions">
			{#if hasSession}
				<a href="/lobby">Go to lobby</a>
			{:else}
				<a href="/login">Log in</a>
			{/if}
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		place-items: center;
		min-height: calc(100vh - 70px);
		padding: 2rem;
		background: linear-gradient(180deg, #f8fafc 0%, var(--color-primary-soft) 100%);
	}

	section {
		max-width: 42rem;
		text-align: center;
	}

	.page-logo {
		width: min(38vw, 12rem);
		margin: 0 auto 0.5rem;
		color: #104e64;
	}

	.eyebrow {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-primary);
	}

	h1 {
		margin: 0 0 1rem;
		font-size: clamp(2.25rem, 5vw, 4rem);
		line-height: 1.1;
	}

	p {
		margin: 0 0 2rem;
		font-size: 1.125rem;
		color: #374151;
	}

	.actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.75rem;
		padding: 0.75rem 1.25rem;
		border-radius: 9999px;
		background: var(--color-primary);
		color: white;
		text-decoration: none;
		font-weight: 600;
	}
</style>
