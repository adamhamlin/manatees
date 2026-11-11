<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Check, Copy, Info, X } from 'lucide-svelte';
	import { debounce, shuffle } from 'radashi';
	import { match } from 'ts-pattern';

	import {
		appConfiguration,
		type DeckSearchHit,
		type Player
	} from '@manatees/shared/types';
	import { assertCondition, assertDefined } from '@manatees/shared/utils/misc.utils';
	import { apiClient } from '$lib/api/api-client';
import type { PreGameState } from '$lib/game/pre-game.types';
	import { showErrorToast, showSuccessToast } from '$lib/utils/toast.utils';

	type Props = {
		gameId: string;
		gameState: PreGameState;
		isAdmin: boolean;
	};

	let { gameId, gameState, isAdmin }: Props = $props();

	const minimumHumanPlayers = appConfiguration.game.players.minHumanPlayers;
	const randoPlayerNames = shuffle([
		'Rando Cardrissian',
		'Rando Cardrissian, Jr.',
		"Rando's Peri Peri",
		'Randalf the Grey',
		'Randalf the White',
		'Randrew Garfield',
		'Rando the Giant',
		'Dr. Rando M.D., Esq.',
		'Rando Schwarzenando',
		'Randy Richter',
		'Marlon Rando',
		'Rando Man Randy Savage',
		'Randomhnall Gleeson'
	]);

	let availableDecks = $state<DeckSearchHit[]>([]);
	let isLoadingDecks = $state(false);
	let selectedDeckIds = $state<number[]>([]);
	let handSize = $state(appConfiguration.game.hand.size.default);
	let winningScore = $state(appConfiguration.game.winningScore.default);
	let isStartingGame = $state(false);
	let isAddingRando = $state(false);
	let creatorInfoDeckId = $state<number>();

	const players = $derived(Object.entries(gameState.playersAndScores));
	const isAtPlayerLimit = $derived(players.length >= appConfiguration.game.players.maxPlayers);
	const humanPlayerCount = $derived(Object.values(gameState.playersAndScores).filter((player) => player.isHuman).length);
	const isNumericSettingsValid = $derived(
		Number.isInteger(handSize) &&
			handSize >= appConfiguration.game.hand.size.min &&
			handSize <= appConfiguration.game.hand.size.max &&
			Number.isInteger(winningScore) &&
			winningScore >= appConfiguration.game.winningScore.min &&
			winningScore <= appConfiguration.game.winningScore.max
	);
	const debouncedSaveSettings = debounce({ delay: 400 }, () => {
		void saveSettings();
	});
	const canStartGame = $derived(
		humanPlayerCount >= minimumHumanPlayers &&
			selectedDeckIds.length > 0 &&
			isNumericSettingsValid &&
			!debouncedSaveSettings.isPending()
	);

	$effect(() => {
		if (!gameState.gameConfig) {
			return;
		}
		selectedDeckIds = [...gameState.gameConfig.deckIds];
		handSize = gameState.gameConfig.handSize;
		winningScore = gameState.gameConfig.winningScore;
	});

	function getPlayerRole(userId: string, player: Player): string {
		return match({ isAdmin: userId === gameState.adminUser?.id, isHuman: player.isHuman })
			.with({ isAdmin: true }, () => 'Admin')
			.with({ isAdmin: false, isHuman: true }, () => 'Player')
			.with({ isAdmin: false, isHuman: false }, () => 'Rando Player')
			.exhaustive();
	}

	async function loadDecks(): Promise<void> {
		isLoadingDecks = true;
		const result = await apiClient.getDecks();
		if (result.success) {
			availableDecks = result.data.decks;
		}
		isLoadingDecks = false;
	}

	function scheduleSettingsSave(): void {
		debouncedSaveSettings();
	}

	function toggleDeck(deckId: number): void {
		selectedDeckIds = selectedDeckIds.includes(deckId)
			? selectedDeckIds.filter((selectedDeckId) => selectedDeckId !== deckId)
			: [...selectedDeckIds, deckId];
		scheduleSettingsSave();
	}

	async function copyGameId(): Promise<void> {
		try {
			await navigator.clipboard.writeText(gameId);
			showSuccessToast('Game ID copied.');
		} catch (error) {
			showErrorToast('Unable to copy the game ID.', error);
		}
	}

	async function saveSettings(): Promise<void> {
		assertCondition(isAdmin, 'Only the game admin can update game settings');
		assertDefined(gameState.gameConfig, 'Game settings must be loaded before saving');

		if (
			!Number.isInteger(handSize) ||
			handSize < appConfiguration.game.hand.size.min ||
			handSize > appConfiguration.game.hand.size.max
		) {
			showErrorToast(
				`Hand size must be a whole number between ${appConfiguration.game.hand.size.min} and ${appConfiguration.game.hand.size.max}.`
			);
			return;
		}
		if (
			!Number.isInteger(winningScore) ||
			winningScore < appConfiguration.game.winningScore.min ||
			winningScore > appConfiguration.game.winningScore.max
		) {
			showErrorToast(
				`Winning score must be a whole number between ${appConfiguration.game.winningScore.min} and ${appConfiguration.game.winningScore.max}.`
			);
			return;
		}

		// The server broadcasts the updated config, which re-syncs the form via the effect above.
		await apiClient.updateGameConfig(gameId, { deckIds: [...selectedDeckIds], handSize, winningScore });
	}

	async function handleStartGame(): Promise<void> {
		if (!canStartGame) {
			return;
		}

		isStartingGame = true;
		await apiClient.startGame(gameId);
		isStartingGame = false;
	}

	async function handleAddRando(): Promise<void> {
		if (isAddingRando || isAtPlayerLimit) {
			return;
		}

		isAddingRando = true;
		const randoPlayerId = randoPlayerNames.pop();
		assertDefined(randoPlayerId, 'No automated player names remain');

		const result = await apiClient.addPlayer(gameId, randoPlayerId);
		isAddingRando = false;
		if (!result.success) {
			randoPlayerNames.push(randoPlayerId);
		}
	}

	async function handleRemovePlayer(playerUserId: string): Promise<void> {
		await apiClient.removePlayer(gameId, playerUserId);
	}

	onMount(() => {
		void loadDecks();
	});

	onDestroy(() => {
		debouncedSaveSettings.cancel();
	});
</script>

<div class="pre-game">
	<div class="room-grid">
		<section class="panel settings-panel">
			<h2>Settings</h2>
			<div class="game-id-setting">
				<strong>Game ID</strong>
				<div class="game-id-value">
					<span>{gameId}</span>
					<button
						class="copy-game-id"
						type="button"
						aria-label="Copy game ID"
						title="Copy game ID"
						onclick={() => void copyGameId()}
					>
						<Copy size={18} aria-hidden="true" />
					</button>
				</div>
			</div>
			{#if gameState.gameConfig}
				<div class="settings-form">
					<label>
						<span>Winning score</span>
						<input
							bind:value={winningScore}
							disabled={!isAdmin}
							type="number"
							min={appConfiguration.game.winningScore.min}
							max={appConfiguration.game.winningScore.max}
							step="1"
							oninput={() => scheduleSettingsSave()} />
					</label>
					<label>
						<span>Hand size</span>
						<input
							bind:value={handSize}
							disabled={!isAdmin}
							type="number"
							min={appConfiguration.game.hand.size.min}
							max={appConfiguration.game.hand.size.max}
							step="1"
							oninput={() => scheduleSettingsSave()} />
					</label>
				</div>
			{:else}
				<p class="muted">Loading game settings...</p>
			{/if}
		</section>

		<section class="panel players-panel">
			<h2>Players<span class="count">{Object.keys(gameState.playersAndScores).length}</span></h2>
			{#if !gameState.adminUser}
				<p class="muted">Loading players...</p>
			{:else}
				<ul class="player-list">
					{#each players as [userId, player] (userId)}
						<li>
							<span class="player-name">{player.user.displayName}</span>
							{#if isAdmin && userId !== gameState.adminUser?.id}
								<button
									class="remove-player"
									type="button"
								aria-label={`Remove ${player.user.displayName} from the game`}
									title="Remove player"
									onclick={() => void handleRemovePlayer(userId)}
								>
									<X size={14} aria-hidden="true" />
								</button>
							{/if}
							<span class="player-kind">{getPlayerRole(userId, player)}</span>
						</li>
					{/each}
				</ul>
			{/if}
			{#if isAdmin}
				<span
					class="add-player-control"
					title={isAtPlayerLimit ? `A game can have at most ${appConfiguration.game.players.maxPlayers} players.` : undefined}
				>
					<button
						class="secondary-button"
						type="button"
						onclick={() => void handleAddRando()}
						disabled={isAddingRando || isAtPlayerLimit}
					>
						{isAddingRando ? 'Adding Rando...' : 'Add automated Rando player'}
					</button>
				</span>
			{/if}
		</section>
	</div>

	{#if gameState.gameConfig}
		<section class="panel deck-panel">
			<h2>Decks <span class="deck-count">{selectedDeckIds.length} selected</span></h2>
			{#if isLoadingDecks}
				<p class="muted">Loading available decks...</p>
			{:else}
				<div class="deck-grid">
					{#each availableDecks as deck (deck.id)}
						<div class="deck-option-wrap">
							<button
								class="deck-option"
								class:selected={selectedDeckIds.includes(deck.id)}
								class:custom-deck={deck.type === 'custom'}
								type="button"
								aria-pressed={selectedDeckIds.includes(deck.id)}
								onclick={() => toggleDeck(deck.id)}
								disabled={!isAdmin}
							>
								{#if selectedDeckIds.includes(deck.id)}
									<Check size={16} aria-hidden="true" />
								{/if}
								{deck.name}
							</button>
							{#if deck.creator}
								<button
									class="deck-creator-trigger"
									type="button"
									aria-label={`Show creator of ${deck.name}`}
									aria-expanded={creatorInfoDeckId === deck.id}
									title="Show deck creator"
									onclick={(event) => {
										event.stopPropagation();
										creatorInfoDeckId = creatorInfoDeckId === deck.id ? undefined : deck.id;
									}}
								>
									<Info size={15} aria-hidden="true" />
								</button>
								{#if creatorInfoDeckId === deck.id}
									<span class="deck-creator-name" role="status">Created by {deck.creator.displayName ?? deck.creator.name}</span>
								{/if}
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}

  <div class="start-area">
	{#if isAdmin}
			<button
				class="start-button"
				type="button"
				onclick={() => void handleStartGame()}
				disabled={isStartingGame || !canStartGame}
			>
				{isStartingGame ? 'Starting...' : 'Start Game'}
			</button>
    {/if}
		{#if humanPlayerCount < minimumHumanPlayers}
			<p class="start-requirement">
				At least {minimumHumanPlayers} human players are required to start the game...
			</p>
    {:else}
		{#if isAdmin}
        {#if selectedDeckIds.length === 0}
				  <p class="start-requirement">Select at least one deck to start.</p>
        {/if}
      {:else}
        <p class="start-requirement">
			Waiting for {gameState.adminUser?.displayName ?? 'the admin'} to start the game...
        </p>
			{/if}
    {/if}
	</div>
</div>

<style>
	.pre-game {
		display: grid;
		gap: 1.25rem;
		width: min(100%, 76rem);
		justify-self: center;
	}

	.game-id-setting {
		display: grid;
		gap: 0.4rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
		color: #4b5563;
	}

	.game-id-value {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		min-width: 0;
		font-family: 'SFMono-Regular', Consolas, monospace;
		font-size: 0.8rem;
	}

	.game-id-value span {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.copy-game-id {
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		width: 2.0rem;
		height: 2.0rem;
		padding: 0;
		border: 0;
		border-radius: 0.5rem;
		background: var(--color-primary);
		color: white;
		font: inherit;
		cursor: pointer;
	}

	.room-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.room-grid > .panel {
		min-width: 0;
	}

	.panel {
		display: grid;
		align-content: start;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		background: white;
	}

	h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	.deck-panel h2 {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.deck-count {
		color: #6b7280;
		font-size: 0.85rem;
		font-weight: 400;
	}

	.deck-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: 0.625rem;
	}

	.deck-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
		min-height: 2rem;
		padding: 0.35rem 2.2rem 0.35rem 0.75rem;
		border: 1px solid var(--color-primary);
		border-radius: 0.5rem;
		background: white;
		color: var(--color-primary-dark);
		font: inherit;
		font-size: 0.8rem;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
	}

	.deck-option-wrap {
		position: relative;
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.deck-option-wrap .deck-option {
		flex: 1 1 auto;
	}

	.deck-option.custom-deck:not(.selected) {
		background: #f0f8f6;
	}

	.deck-creator-trigger {
		position: absolute;
		right: 0.3rem;
		display: grid;
		place-items: center;
		width: 1.65rem;
		aspect-ratio: 1;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--color-primary-dark);
		cursor: pointer;
	}

	.deck-creator-name {
		position: absolute;
		z-index: 3;
		top: calc(100% + 0.3rem);
		right: 0;
		width: max-content;
		max-width: min(18rem, 80vw);
		padding: 0.55rem 0.7rem;
		border: 1px solid #d1d5db;
		background: white;
		box-shadow: 0 0.4rem 1rem rgb(0 0 0 / 12%);
		color: #374151;
		font-size: 0.8rem;
	}

	.deck-option.selected {
		background: var(--color-primary);
		color: white;
	}

	.deck-option :global(svg) {
		flex: 0 0 auto;
	}

	.deck-option:disabled {
		cursor: default;
	}

	.deck-option:disabled:not(.selected) {
		border-color: #d1d5db;
		background: #e5e7eb;
		color: #6b7280;
	}

	.players-panel h2 {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.count {
		color: #6b7280;
		font-size: 0.9rem;
	}

	.player-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.player-list li {
		display: flex;
		gap: 0.6rem;
		padding: 0.6rem 0;
		border-top: 1px solid #e5e7eb;
	}

	.player-name {
		min-width: 0;
		overflow-wrap: anywhere;
		font-weight: 600;
	}

	.player-kind {
		flex: 0 0 auto;
		align-self: flex-start;
		margin-left: auto;
		padding: 0.2rem 0.45rem;
		border-radius: 0.25rem;
		background: #f3f4f6;
		color: #6b7280;
		font-size: 0.8rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.remove-player {
		flex: 0 0 auto;
		align-self: flex-start;
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		padding: 0;
		border: 0;
		border-radius: 0.25rem;
		background: var(--color-warning-soft);
		color: var(--color-warning);
		cursor: pointer;
	}

	.remove-player:hover {
		background: var(--color-warning-soft-hover);
	}

	.settings-form {
		display: grid;
		gap: 0.875rem;
	}

	.settings-form label {
		display: grid;
		gap: 0.4rem;
		font-weight: 600;
	}

	.settings-form input {
		width: 100%;
		padding: 0.65rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font: inherit;
	}

	.secondary-button,
	.start-button {
		padding: 0.75rem 1rem;
		border: 0;
		border-radius: 0.5rem;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.secondary-button {
		background: var(--color-primary);
		color: white;
	}

	.start-area {
		position: sticky;
		bottom: 0;
		z-index: 10;
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0 1rem;
		border-top: 1px solid #e5e7eb;
		background: #f1f5f9;
	}

	.start-requirement {
		margin: 0;
		color: #6b7280;
		text-align: center;
		font-size: 0.9rem;
	}

	.start-button {
		min-width: 24rem;
		padding: 0.95rem 1.5rem;
		font-size: 1.35rem;
		background: var(--color-primary-dark);
		color: white;
	}

	.start-button:disabled,
	.secondary-button:disabled {
		cursor: default;
		background: #e5e7eb;
		color: #6b7280;
	}

	@media (max-width: 640px) {
		.room-grid {
			grid-template-columns: 1fr;
		}

		.deck-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
