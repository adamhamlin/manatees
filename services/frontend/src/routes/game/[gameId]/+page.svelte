<script lang="ts">
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import { Check, EllipsisVertical, Pencil, X } from 'lucide-svelte';
	import { appConfiguration } from '@manatees/shared/types';
	import { assertCondition, assertDefined } from '@manatees/shared/utils/misc.utils';

	import { apiClient } from '$lib/api/api-client';
	import ActiveGame from '$lib/components/ActiveGame.svelte';
	import GameCompletedDialog from '$lib/components/GameCompletedDialog.svelte';
	import PreGame from '$lib/components/PreGame.svelte';
	import { createGameSession } from '$lib/game/game-session.svelte';
	import { currentUser } from '$lib/utils/current-user.utils';
	import { showErrorToast, showSuccessToast } from '$lib/utils/toast.utils';
	import { goto } from '$app/navigation';

	const gameId = $derived(page.params.gameId ?? 'unknown');
	const gameSession = createGameSession({
		onNavigateToLobby: () => void goto('/lobby'),
		onRequestRemovePlayer: requestRemovePlayer
	});

	let gameNameInput = $state('');
	let isEditingGameName = $state(false);
	let isSavingGameName = $state(false);
	let isRestartingGame = $state(false);
	let isDeletingGame = $state(false);
	let isSkippingRound = $state(false);
	let adminMenuRef: HTMLDetailsElement | undefined = $state();
	let deleteDialog: HTMLDialogElement | undefined = $state();
	let restartDialog: HTMLDialogElement | undefined = $state();
	let playerRemovalDialog: HTMLDialogElement | undefined = $state();
	let changeScoreDialog: HTMLDialogElement | undefined = $state();
	let playerToRemove = $state<{ id: string; name: string }>();
	let playerToChangeScore = $state<{ id: string; name: string }>();
	let newPlayerScore = $state(0);
	let isRemovingPlayer = $state(false);
	let isChangingScore = $state(false);
	let joinRequestActionId = $state<string>();
	const isAdmin = $derived(
		Boolean(gameSession.state.adminUser && $currentUser?.id === gameSession.state.adminUser.id)
	);
	const myJoinRequest = $derived(
		gameSession.state.joinRequests.find(({ user }) => user.id === $currentUser?.id)
	);

	function requestRemovePlayer(playerId: string): void {
		assertCondition(isAdmin, 'Only the game admin can remove players');

		const player = gameSession.state.playersAndScores[playerId];
		if (!player) {
			return;
		}

		const humanPlayerCount = Object.values(gameSession.state.playersAndScores).filter(
			({ isHuman }) => isHuman
		).length;
		if (
			gameSession.state.isGameStarted &&
			player.isHuman &&
			humanPlayerCount - 1 < appConfiguration.game.players.minHumanPlayers
		) {
			playerToRemove = {
				id: playerId,
				name: player.user.displayName || player.user.name
			};
			playerRemovalDialog?.showModal();
			return;
		}

		void removePlayer(playerId);
	}

	async function removePlayer(playerId: string): Promise<void> {
		isRemovingPlayer = true;
		const result = await apiClient.removePlayer(gameId, playerId);
		isRemovingPlayer = false;
		if (result.success) {
			showSuccessToast('Player removed.');
			playerRemovalDialog?.close();
			playerToRemove = undefined;
		}
	}

	function confirmPlayerRemoval(): void {
		if (playerToRemove) {
			void removePlayer(playerToRemove.id);
		}
	}

	async function approveJoinRequest(playerId: string): Promise<void> {
		assertCondition(isAdmin, 'Only the game admin can approve join requests');
		if (joinRequestActionId) {
			return;
		}
		joinRequestActionId = playerId;
		await apiClient.approvePlayerJoin(gameId, playerId);
		joinRequestActionId = undefined;
	}

	async function rejectJoinRequest(playerId: string): Promise<void> {
		assertCondition(isAdmin, 'Only the game admin can reject join requests');
		if (joinRequestActionId) {
			return;
		}
		joinRequestActionId = playerId;
		await apiClient.rejectPlayerJoin(gameId, playerId);
		joinRequestActionId = undefined;
	}

	function requestChangeScore(playerId: string): void {
		assertCondition(isAdmin, 'Only the game admin can change player scores');
		const player = gameSession.state.playersAndScores[playerId];
		if (!player) {
			return;
		}
		playerToChangeScore = { id: playerId, name: player.user.displayName || player.user.name };
		newPlayerScore = player.score;
		changeScoreDialog?.showModal();
	}

	async function changePlayerScore(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		assertCondition(isAdmin, 'Only the game admin can change player scores');
		assertDefined(playerToChangeScore, 'A player must be selected before changing their score');
		assertDefined(gameSession.state.gameConfig, 'Game settings must be loaded before changing a score');
		if (
			!Number.isInteger(newPlayerScore) ||
			newPlayerScore < 0 ||
			newPlayerScore >= gameSession.state.gameConfig.winningScore
		) {
			return;
		}

		isChangingScore = true;
		const result = await apiClient.changePlayerScore(gameId, playerToChangeScore.id, newPlayerScore);
		isChangingScore = false;
		if (result.success) {
			changeScoreDialog?.close();
			playerToChangeScore = undefined;
		}
	}

	$effect(() => {
		const config = gameSession.state.gameConfig;
		if (config) {
			gameNameInput = config.gameName;
		}
	});

	function cancelGameNameEdit(): void {
		gameNameInput = gameSession.state.gameConfig?.gameName ?? '';
		isEditingGameName = false;
	}

	async function saveGameName(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		const gameName = gameNameInput.trim();
		if (!gameName) {
			showErrorToast('Game name cannot be empty.');
			return;
		}

		isSavingGameName = true;
		const result = await apiClient.updateGameConfig(gameId, { gameName });
		isSavingGameName = false;

		if (!result.success) {
			return;
		}

		gameSession.setGameConfig(result.data);
		isEditingGameName = false;
		showSuccessToast('Game name updated.');
	}

	async function resetGame(): Promise<void> {
		isRestartingGame = true;
		await apiClient.cancelGame(gameId);
		isRestartingGame = false;
	}

	async function skipToNextRound(): Promise<void> {
		isSkippingRound = true;
		const result = await apiClient.skipToNextRound(gameId);
		isSkippingRound = false;
		adminMenuRef?.removeAttribute('open');
		if (result.success) {
			showSuccessToast('Skipped to the next round.');
		}
	}

	async function autoPlayPlayer(playerId: string): Promise<void> {
		await apiClient.autoPlayPlayer(gameId, playerId);
	}

	async function restartGame(): Promise<void> {
		await resetGame();
		restartDialog?.close();
	}

	function openRestartDialog(): void {
		adminMenuRef?.removeAttribute('open');
		restartDialog?.showModal();
	}

	async function deleteGame(): Promise<void> {
		adminMenuRef?.removeAttribute('open');
		isDeletingGame = true;
		const result = await apiClient.deleteGame(gameId);
		isDeletingGame = false;
		deleteDialog?.close();
		if (result.success) {
			showSuccessToast('Game deleted.');
			await goto('/lobby');
		}
	}

	onMount(() => {
		gameSession.connect(gameId);

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (adminMenuRef?.open && !adminMenuRef.contains(target)) {
				adminMenuRef.open = false;
			}
		};

		window.addEventListener('click', handleClickOutside);
		return () => window.removeEventListener('click', handleClickOutside);
	});

	onDestroy(() => {
		gameSession.disconnect();
	});
</script>

<main>
	<section>
		<header class="room-heading">
			<div>
				<p class="eyebrow">Game room</p>
				{#if isEditingGameName && isAdmin && gameSession.state.gameConfig}
					<form class="game-name-form" onsubmit={(event) => void saveGameName(event)}>
						<input bind:value={gameNameInput} aria-label="Game name" maxlength="80" />
						<button class="game-name-action" type="submit" aria-label="Save game name" title="Save game name" disabled={isSavingGameName}>
							<Check size={18} aria-hidden="true" />
						</button>
						<button class="game-name-action cancel" type="button" aria-label="Cancel game name edit" title="Cancel" onclick={cancelGameNameEdit} disabled={isSavingGameName}>
							<X size={18} aria-hidden="true" />
						</button>
					</form>
				{:else}
					<div class="game-name-row">
						<h1>{gameSession.state.gameConfig?.gameName ?? (myJoinRequest ? 'Game in progress' : 'Loading...')}</h1>
						{#if isAdmin && gameSession.state.gameConfig}
							<button class="edit-game-name" type="button" aria-label="Edit game name" title="Edit game name" onclick={() => (isEditingGameName = true)}>
								<Pencil size={18} aria-hidden="true" />
							</button>
						{/if}
					</div>
				{/if}
			</div>
			{#if isAdmin}
				<div class="admin-actions">
					<details class="admin-menu" bind:this={adminMenuRef}>
						<summary aria-label="Admin actions" title="Admin actions">
							<EllipsisVertical size={18} aria-hidden="true" />
						</summary>
						<div class="admin-menu-items">
							{#if gameSession.state.isGameStarted}
								<button type="button" onclick={openRestartDialog} disabled={isRestartingGame}>
									Restart Game
								</button>
								{#if gameSession.state.gamePhase !== 'gameCompleted'}
									<button type="button" onclick={() => void skipToNextRound()} disabled={isSkippingRound}>
										{isSkippingRound ? 'Skipping...' : 'Skip to next round'}
									</button>
								{/if}
							{/if}
							<button type="button" class="delete-action" onclick={() => deleteDialog?.showModal()} disabled={isDeletingGame}>
								Delete Game
							</button>
						</div>
					</details>
				</div>
			{/if}
		</header>

		{#if myJoinRequest}
			<div class="join-waiting" role="status">
				<h1>{myJoinRequest.isApproved ? "You're approved" : 'Waiting for admin approval'}</h1>
				<p>
					{myJoinRequest.isApproved
						? "You'll enter the game when the next round starts."
						: 'An admin has been notified of your request to join this in-progress game.'}
				</p>
			</div>
		{:else if gameSession.state.isGameStarted}
			<ActiveGame
				gameState={gameSession.activeGameState}
				currentUser={$currentUser ? { ...$currentUser, isAdmin } : undefined}
				joinRequests={gameSession.state.joinRequests}
				joinRequestActionId={joinRequestActionId}
				onSend={gameSession.send}
				onRemovePlayer={requestRemovePlayer}
				onApproveJoinRequest={(playerId) => void approveJoinRequest(playerId)}
				onRejectJoinRequest={(playerId) => void rejectJoinRequest(playerId)}
				onRequestChangeScore={requestChangeScore}
				onAutoPlayPlayer={(playerId) => void autoPlayPlayer(playerId)}
			/>
		{:else}
			<PreGame
				{gameId}
				gameState={gameSession.preGameState}
				{isAdmin}
			/>
		{/if}
	</section>
</main>

<GameCompletedDialog
	winner={gameSession.state.gameWinner}
	{isAdmin}
	isReturning={isRestartingGame}
	onReturnToStart={() => void resetGame()}
/>

<dialog bind:this={restartDialog} aria-labelledby="restart-title">
	<form method="dialog" class="dialog-form">
		<h2 id="restart-title">Restart the game?</h2>
		<p>Players will return to the pre-game lobby.</p>
		<div class="dialog-actions">
			<button class="keep-button" type="submit" disabled={isRestartingGame}>Cancel</button>
			<button class="confirm-button" type="button" onclick={() => void restartGame()} disabled={isRestartingGame}>
				{isRestartingGame ? 'Restarting...' : 'Restart Game'}
			</button>
		</div>
	</form>
</dialog>

<dialog bind:this={deleteDialog} aria-labelledby="delete-title">
	<form method="dialog" class="dialog-form">
		<h2 id="delete-title">Delete this game?</h2>
		<div class="dialog-actions">
			<button class="keep-button" type="submit" disabled={isDeletingGame}>Cancel</button>
			<button class="confirm-button" type="button" onclick={() => void deleteGame()} disabled={isDeletingGame}>
				{isDeletingGame ? 'Deleting...' : 'Delete'}
			</button>
		</div>
	</form>
</dialog>

<dialog bind:this={playerRemovalDialog} aria-labelledby="player-removal-title">
	<form method="dialog" class="dialog-form">
		<h2 id="player-removal-title">Remove {playerToRemove?.name}?</h2>
		<p>Removing this player will abort the current game because there are not enough human players to continue.</p>
		<div class="dialog-actions">
			<button class="keep-button" type="submit" disabled={isRemovingPlayer}>Cancel</button>
			<button class="confirm-button" type="button" onclick={confirmPlayerRemoval} disabled={isRemovingPlayer}>
				{isRemovingPlayer ? 'Removing...' : 'Remove player'}
			</button>
		</div>
	</form>
</dialog>

<dialog bind:this={changeScoreDialog} aria-labelledby="change-score-title">
	<form class="dialog-form" onsubmit={(event) => void changePlayerScore(event)}>
		<h2 id="change-score-title">Change score for {playerToChangeScore?.name}</h2>
		<label class="award-points-field">
			<span>New score</span>
			<input
				bind:value={newPlayerScore}
				type="number"
				min="0"
				max={(gameSession.state.gameConfig?.winningScore ?? 1) - 1}
				step="1"
				required
				disabled={isChangingScore}
			/>
		</label>
		<div class="dialog-actions">
			<button class="keep-button" type="button" onclick={() => changeScoreDialog?.close()} disabled={isChangingScore}>Cancel</button>
			<button class="confirm-button" type="submit" disabled={isChangingScore}>
				{isChangingScore ? 'Updating...' : 'Change score'}
			</button>
		</div>
	</form>
</dialog>

<style>
	main {
		display: grid;
		place-items: start center;
		min-height: calc(100vh - 70px);
		padding: 1rem 2rem 2rem;
		background: #f8fafc;
	}

	section {
		display: grid;
		gap: 1.25rem;
		width: min(100%, 88rem);
	}

	.join-waiting {
		display: grid;
		gap: 0.75rem;
		max-width: 42rem;
		padding: 1.5rem;
		border: 1px solid #d1d5db;
		background: white;
	}

	.join-waiting h1,
	.join-waiting p {
		margin: 0;
	}

	.award-points-field {
		display: grid;
		gap: 0.4rem;
		font-weight: 650;
	}

	.award-points-field input {
		width: 8rem;
		padding: 0.55rem 0.65rem;
		border: 1px solid #9ca3af;
		font: inherit;
	}

	.room-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		box-sizing: border-box;
		width: 100vw;
		margin-left: calc(50% - 50vw);
		padding-left: calc(16rem + 0.55rem);
		padding-right: 2rem;
	}

	.eyebrow {
		margin: 0;
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-primary);
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 4vw, 3rem);
	}

	.game-name-row,
	.game-name-form {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
	}

	.game-name-row h1 {
		overflow-wrap: anywhere;
	}

	.game-name-form input {
		min-width: 0;
		width: min(32rem, calc(100vw - 10rem));
		padding: 0.45rem 0.6rem;
		border: 1px solid #9ca3af;
		border-radius: 0.5rem;
		font: inherit;
		font-size: 1.5rem;
	}

	.edit-game-name,
	.game-name-action {
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		border: 0;
		border-radius: 0.5rem;
		background: var(--color-primary);
		color: white;
		cursor: pointer;
	}

	.game-name-action.cancel {
		background: #6b7280;
	}

	.edit-game-name:disabled,
	.game-name-action:disabled {
		cursor: default;
		background: #e5e7eb;
		color: #6b7280;
	}

	dialog {
		width: min(calc(100% - 2rem), 28rem);
		padding: 0;
		border: 1px solid #d1d5db;
		border-radius: 0.75rem;
		box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 24%);
	}

	dialog::backdrop {
		background: rgb(17 24 39 / 55%);
	}

	.dialog-form {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
	}

	.dialog-form h2,
	.dialog-form p {
		margin: 0;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.keep-button,
	.confirm-button {
		padding: 0.7rem 1rem;
		border-radius: 0.5rem;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.keep-button {
		border: 1px solid #d1d5db;
		background: white;
		color: #111827;
	}

	.confirm-button {
		border: 0;
		background: var(--color-warning);
		color: white;
	}

	.keep-button:disabled,
	.confirm-button:disabled {
		cursor: default;
		opacity: 0.65;
	}

	.admin-actions {
		display: flex;
		align-items: center;
	}

	.admin-menu {
		position: relative;
	}

	.admin-menu summary {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		border: 0;
		border-radius: 0.5rem;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		list-style: none;
	}

	.admin-menu summary::-webkit-details-marker {
		display: none;
	}

	.admin-menu summary:hover {
		background: #e5e7eb;
	}

	.admin-menu-items {
		position: absolute;
		z-index: 2;
		top: calc(100% + 0.35rem);
		right: 0;
		display: grid;
		min-width: 10rem;
		padding: 0.3rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		background: white;
		box-shadow: 0 0.5rem 1.5rem rgb(17 24 39 / 14%);
	}

	.admin-menu-items button {
		padding: 0.65rem 0.75rem;
		border: 0;
		border-radius: 0.3rem;
		background: transparent;
		color: #202a2b;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.admin-menu-items button:hover:not(:disabled) {
		background: #f1f5f2;
	}

	.admin-menu-items button.delete-action {
		color: var(--color-warning);
	}

	.admin-menu-items button:disabled {
		cursor: default;
		opacity: 0.55;
	}

	@media (max-width: 760px) {
		.room-heading {
			width: 100%;
			margin-left: 0;
			padding: 0;
		}
	}

	@media (max-width: 640px) {
		.room-heading {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
