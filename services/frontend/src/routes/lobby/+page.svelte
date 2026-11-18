<script lang="ts">
	import { onMount } from 'svelte';

	import { appConfiguration, type GameSummary } from '@manatees/shared/types';
	import { apiClient } from '$lib/api/api-client';
	import ManateeLogo from '$lib/components/ManateeLogo.svelte';
	import { environment } from '$lib/environment';

	let joinGameId = $state('');
	let games = $state<GameSummary[]>([]);
	let gamesError = $state('');
	let hasLoadedGames = $state(false);
	const isAtGameLimit = $derived(games.length >= appConfiguration.game.global.maxGames);
	const cannotCreateGame = $derived(!hasLoadedGames || isAtGameLimit);

	async function loadGames(): Promise<void> {
		const result = await apiClient.getGames();

		if (!result.success) {
			gamesError = result.error.message;
			return;
		}

		gamesError = '';
		games = result.data.games;
		hasLoadedGames = true;
	}

	function openGame(id: string): void {
		window.location.href = `/game/${encodeURIComponent(id.trim())}`;
	}

	function createGame(): void {
		if (cannotCreateGame) {
			return;
		}
		openGame(crypto.randomUUID());
	}

	onMount(() => {
		void loadGames();

		const events = new EventSource(`${environment.apiUrl}/lobby/events`, { withCredentials: true });
		let hasOpened = false;
		events.onopen = () => {
			// Reconnects may have missed pings, so resync
			if (hasOpened) {
				void loadGames();
			}
			hasOpened = true;
		};
		events.addEventListener('gamesChanged', () => void loadGames());

		const onVisible = (): void => {
			if (document.visibilityState === 'visible') {
				void loadGames();
			}
		};
		document.addEventListener('visibilitychange', onVisible);

		return () => {
			// Clean up
			events.close();
			document.removeEventListener('visibilitychange', onVisible);
		};
	});
</script>

<main>
	<section>
		<div class="page-logo"><ManateeLogo mFontStyle="humanist" /></div>
		<h1>Lobby</h1>
		<p>You thought this was a hallway but it's a lobby!</p>

		<div class="options" class:has-games={games.length > 0}>
			<div class="panel create-panel">
				<h2>Create New Game</h2>
				<span
					class="create-game-control"
					title={isAtGameLimit
						? `Maximum of ${appConfiguration.game.global.maxGames} concurrent games reached.`
						: !hasLoadedGames
							? gamesError
								? 'Unable to verify available game slots. Try reloading the lobby.'
								: 'Checking available game slots...'
							: undefined}
				>
					<button type="button" onclick={createGame} disabled={cannotCreateGame}>Create Game</button>
				</span>
			</div>

			{#if games.length > 0}
				<form class="panel" onsubmit={(event) => {
					event.preventDefault();
					openGame(joinGameId);
				}}>
					<h2>Join Game By ID</h2>
					<div class="join-row">
						<input
							bind:value={joinGameId}
							type="text"
							placeholder="Game ID"
							aria-label="Game ID"
							minlength="24" />
						<button type="submit" disabled={!joinGameId.trim()}>Join</button>
					</div>
				</form>
			{/if}
		</div>

		{#if gamesError}
			<p class="error" role="alert">Unable to load games: {gamesError}</p>
		{/if}

		{#if games.length > 0}
			<div class="public-games">
				<h2>Join Public Game</h2>
				<div class="games-grid">
					{#each games as game (game.id)}
						<button class="game-card" type="button" onclick={() => openGame(game.id)}>
							<strong>{game.gameConfig.gameName}</strong>
							<span>{game.humanPlayerCount} players · {game.inProgress ? 'In progress' : 'Not started'}</span>
							<span class="creator-label">Creator: {game.admin.displayName}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</section>
</main>

<style>
	main {
		display: grid;
		place-items: center;
		min-height: calc(100vh - 70px);
		padding: 2rem;
	}

	section {
		display: grid;
		gap: 1.5rem;
		width: min(100%, 56rem);
	}

	.page-logo {
		width: min(30vw, 10rem);
		justify-self: center;
		color: #104e64;
	}

	h1 {
		margin: 0;
		text-align: center;
	}

	p {
		margin: 0;
		text-align: center;
		color: #4b5563;
	}

	.options {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.25rem;
	}

	.options:not(.has-games) {
		display: grid;
		grid-template-columns: minmax(0, 28rem);
		justify-content: center;
	}

	.public-games {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.75rem;
		background: white;
	}

	.public-games h2 {
		text-align: center;
	}

	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: 1rem;
	}

	.game-card {
		display: grid;
		justify-items: start;
		align-content: start;
		gap: 0.4rem;
		min-width: 0;
		padding: 1rem 1.25rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		background: white;
		color: #111827;
		text-align: left;
		cursor: pointer;
	}

	.game-card:hover {
		border-color: var(--color-primary);
	}

	.game-card strong {
		overflow-wrap: anywhere;
		font-size: 1.1rem;
		line-height: 1.25;
	}

	.game-card span {
		color: #4b5563;
		font-size: 0.875rem;
	}

	.game-card .creator-label {
		color: #6b7280;
	}

	.error {
		color: var(--color-warning);
	}

	.panel {
		display: grid;
		align-content: start;
		gap: 1rem;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 1rem;
		background: white;
	}

	.create-panel {
		justify-items: center;
	}

	.create-panel h2 {
		text-align: center;
	}

	h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.join-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.join-row input {
		flex: 1 1 auto;
		min-width: 0;
	}

	.join-row button {
		flex: 0 0 auto;
		padding: 0.6rem 1.1rem;
	}

	input {
		padding: 0.75rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.75rem;
		font: inherit;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.8rem 1rem;
		border-radius: 0.75rem;
		font-weight: 600;
		border: none;
		background: var(--color-primary);
		color: white;
		cursor: pointer;
	}

	button:disabled {
		background: #e5e7eb;
		color: #6b7280;
		cursor: default;
	}

	@media (max-width: 640px) {
		.options {
			grid-template-columns: 1fr;
		}

		.games-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
