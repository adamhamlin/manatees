<script lang="ts">
	import { onMount } from 'svelte';
	import type { ClientGameEvent, DeckSearchHit, User, UserWithProfile, WhiteCard } from '@manatees/shared/types';
	import { apiClient } from '$lib/api/api-client';
	import ManateeLogo from '$lib/components/ManateeLogo.svelte';
	import PlayingCard from '$lib/components/PlayingCard.svelte';
	import type { ActiveGameState } from '$lib/game/active-game.types';

	type Props = {
		gameState: ActiveGameState;
		currentUser: (UserWithProfile & { isAdmin: boolean }) | undefined;
		joinRequests: Array<{ user: User; isApproved: boolean }>;
		joinRequestActionId: string | undefined;
		onSend: (event: ClientGameEvent) => boolean;
		onRemovePlayer: (playerId: string) => void;
		onApproveJoinRequest: (playerId: string) => void;
		onRejectJoinRequest: (playerId: string) => void;
		onRequestChangeScore: (playerId: string) => void;
		onAutoPlayPlayer: (playerId: string) => void;
	};

	let {
		gameState,
		currentUser,
		joinRequests,
		joinRequestActionId,
		onSend,
		onRemovePlayer,
		onApproveJoinRequest,
		onRejectJoinRequest,
		onRequestChangeScore,
		onAutoPlayPlayer
	}: Props = $props();

	let selectedCardIds = $state<number[]>([]);
	let selectedSubmission = $state<number>();
	let hasSubmittedLocally = $state(false);
	let localSubmission = $state<WhiteCard[]>([]);
	let deckWatermarks = $state<Record<number, string>>({});
	let previousGamePhase: ActiveGameState['gamePhase'];
	let openPlayerMenuId = $state<string>();

	const players = $derived(
		Object.values(gameState.playersAndScores).sort((left, right) => right.score - left.score || left.user.name.localeCompare(right.user.name))
	);
	const isJudge = $derived(Boolean(currentUser && gameState.judge && currentUser.id === gameState.judge.id));
	const hasSubmitted = $derived(
		Boolean(currentUser && (hasSubmittedLocally || gameState.submittedPlayerIds.includes(currentUser.id)))
	);
	const pickCount = $derived(gameState.blackCard?.pickCount ?? 0);
	const blackCardText = $derived(gameState.blackCard?.content.replace(/_+/g, '_______') ?? '');
	const canSubmitCards = $derived(
		Boolean(gameState.blackCard && selectedCardIds.length === gameState.blackCard.pickCount && !hasSubmitted)
	);
	const canPickCards = $derived(gameState.gamePhase === 'playing' && !isJudge && !hasSubmitted);
	const canJudge = $derived(gameState.gamePhase === 'judging' && isJudge);
	const winningCardIds = $derived(new Set(gameState.roundResult?.winningCards.map((card) => card.id)));
	const expectedResponses = $derived(Math.max(0, players.length - (gameState.judge ? 1 : 0)));
	const remainingResponses = $derived(Math.max(0, expectedResponses - gameState.submittedPlayerIds.length));
	const controlMessage = $derived(
		gameState.gamePhase === 'playing'
			? isJudge || hasSubmitted
				? remainingResponses > 0
					? `Waiting for ${remainingResponses} more ${remainingResponses === 1 ? 'response' : 'responses'}...`
					: 'All responses are in'
				: 'Play your cards!'
			: gameState.gamePhase === 'judging'
				? isJudge
					? 'Choose a winning response'
					: `${gameState.judge ? displayName(gameState.judge) : 'The Card Czar'} is now judging...`
				: gameState.gamePhase === 'gameCompleted'
					? 'Game complete'
					: 'Waiting for the game to start...'
	);
	const controlButtonLabel = $derived(
		gameState.gamePhase === 'playing'
			? isJudge
				? 'Bleep bloop'
				: hasSubmitted
					? 'Bleep bloop'
					: `Submit ${pickCount} card${pickCount === 1 ? '' : 's'}`
			: gameState.gamePhase === 'judging'
				? isJudge
					? 'Submit winning response'
					: 'Bleep bloop'
				: 'Game complete'
	);
	const controlButtonDisabled = $derived(
		gameState.gamePhase === 'playing'
			? !canSubmitCards || !canPickCards
			: gameState.gamePhase !== 'judging' || !canJudge || selectedSubmission === undefined
	);

	$effect(() => {
		const currentGamePhase = gameState.gamePhase;
		if (currentGamePhase === 'playing' && previousGamePhase !== 'playing') {
			selectedCardIds = [];
			selectedSubmission = undefined;
			hasSubmittedLocally = false;
			localSubmission = [];
		}
		previousGamePhase = currentGamePhase;
	});

	onMount(() => {
		void loadDeckWatermarks();

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target;
			if (openPlayerMenuId && (!(target instanceof Element) || !target.closest('.player-row-menu'))) {
				openPlayerMenuId = undefined;
			}
		};

		window.addEventListener('click', handleClickOutside);
		return () => window.removeEventListener('click', handleClickOutside);
	});

	async function loadDeckWatermarks(): Promise<void> {
		const result = await apiClient.getDecks();
		if (result.success) {
			deckWatermarks = Object.fromEntries(
				result.data.decks.map((deck: DeckSearchHit) => [deck.id, deck.watermark])
			);
		}
	}

	function displayName(user: User): string {
		return user.displayName || user.name;
	}

	function toggleCard(cardId: number): void {
		if (!gameState.blackCard || !canPickCards) {
			return;
		}
		if (selectedCardIds.includes(cardId)) {
			selectedCardIds = selectedCardIds.filter((selectedId) => selectedId !== cardId);
		} else {
			// At the pick limit, the oldest selection is replaced
			selectedCardIds = [...selectedCardIds, cardId].slice(-gameState.blackCard.pickCount);
		}
	}

	function togglePlayerMenu(playerId: string): void {
		openPlayerMenuId = openPlayerMenuId === playerId ? undefined : playerId;
	}

	function isWinningSubmission(submission: WhiteCard[]): boolean {
		return submission.length > 0 && submission.every((card) => winningCardIds.has(card.id));
	}

	function submitCards(): void {
		if (!canSubmitCards) {
			return;
		}
		const submission = selectedCardIds
			.map((cardId) => gameState.hand.find((card) => card.id === cardId))
			.filter((card): card is WhiteCard => card !== undefined);
		hasSubmittedLocally = onSend({ type: 'cardsPlayed', payload: { cards: selectedCardIds } });
		if (hasSubmittedLocally) {
			localSubmission = submission;
		}
	}

	function selectWinningSubmission(): void {
		if (selectedSubmission === undefined) {
			return;
		}
		const winningCards = gameState.playedCards[selectedSubmission];
		if (winningCards) {
			onSend({
				type: 'winningCardsSelected',
				payload: { winningCards: winningCards.map((card) => card.id) }
			});
		}
	}

	function handleControlAction(): void {
		if (gameState.gamePhase === 'playing') {
			submitCards();
		} else if (gameState.gamePhase === 'judging') {
			selectWinningSubmission();
		}
	}
</script>

<section class="game-board" aria-label="Active game">
	<div class="table-layout">
		<aside class="players-panel" aria-label="Players and scores">
			<div class="panel-heading">
				<h2>Scoreboard</h2>
				<span>{players.length + joinRequests.filter((request) => request.isApproved).length} players</span>
			</div>
			{#if currentUser?.isAdmin && joinRequests.some((request) => !request.isApproved)}
				<section class="join-requests" aria-labelledby="join-requests-title">
					<h3 id="join-requests-title">Join requests</h3>
						{#each joinRequests as request (request.user.id)}
							{#if !request.isApproved}
								<div class="join-request">
									<strong>{displayName(request.user)}</strong>
									<div class="join-request-actions">
										<button type="button" onclick={() => onApproveJoinRequest(request.user.id)} disabled={joinRequestActionId === request.user.id}>Admit next round</button>
										<button type="button" class="decline-request" onclick={() => onRejectJoinRequest(request.user.id)} disabled={joinRequestActionId === request.user.id}>Decline</button>
									</div>
								</div>
							{/if}
						{/each}
				</section>
			{/if}
			<ol class="player-list">
				{#each players as player (player.user.id)}
					{@const playerIsJudge = player.user.id === gameState.judge?.id}
					{@const playerIsWinner = player.user.id === gameState.roundResult?.winner.id}
					{@const playerHasPlayed =
						gameState.gamePhase === 'playing' && gameState.submittedPlayerIds.includes(player.user.id)}
					{@const playerIsDisconnected = gameState.disconnectedPlayerIds.includes(player.user.id)}
					<li
						class:current-player={player.user.id === currentUser?.id}
						class:winner-player={playerIsWinner}
						class:disconnected-player={playerIsDisconnected}
					>
						{#if currentUser?.isAdmin && player.user.id !== currentUser.id}
							<div class="player-row-menu">
								<button
									class="player-row-trigger"
									type="button"
									aria-label={`Open actions for ${displayName(player.user)}`}
									aria-haspopup="menu"
									aria-expanded={openPlayerMenuId === player.user.id}
									title={`Player actions for ${displayName(player.user)}`}
									onclick={() => togglePlayerMenu(player.user.id)}
								>
									<div class="player-name">
										<span class="player-mark" aria-hidden="true">{displayName(player.user).slice(0, 1).toUpperCase()}</span>
										<span class="name-and-role">
											<strong>{displayName(player.user)}</strong>
											{#if !player.isHuman}
												<small>Rando</small>
											{/if}
										</span>
									</div>
									<div class="player-score-status">
										{#if playerIsDisconnected}
											<span class="status disconnected">Disconnected</span>
										{:else if playerIsWinner}
											<span class="status winner">Winner</span>
										{:else if playerIsJudge}
											<span class="status judge">Card Czar</span>
										{:else if playerHasPlayed}
											<span class="status played">Played</span>
										{/if}
										<strong class="score">{player.score}</strong>
									</div>
								</button>
								{#if openPlayerMenuId === player.user.id}
									<div class="player-menu" role="menu">
										<button type="button" role="menuitem" onclick={() => {
											openPlayerMenuId = undefined;
											onRequestChangeScore(player.user.id);
										}}>Change score</button>
						{#if gameState.gamePhase === 'playing' && player.isHuman && !playerIsJudge && !playerHasPlayed}
							<button type="button" role="menuitem" onclick={() => {
								openPlayerMenuId = undefined;
								onAutoPlayPlayer(player.user.id);
							}}>Auto play</button>
						{/if}
										<button type="button" role="menuitem" onclick={() => {
											openPlayerMenuId = undefined;
											onRemovePlayer(player.user.id);
										}}>Remove player</button>
									</div>
								{/if}
							</div>
						{:else}
							<div class="player-row-content">
								<div class="player-name">
									<span class="player-mark" aria-hidden="true">{displayName(player.user).slice(0, 1).toUpperCase()}</span>
									<span class="name-and-role">
										<strong>{displayName(player.user)}</strong>
										{#if !player.isHuman}
											<small>Rando</small>
										{/if}
									</span>
								</div>
								<div class="player-score-status">
									{#if playerIsDisconnected}
										<span class="status disconnected">Disconnected</span>
									{:else if playerIsWinner}
										<span class="status winner">Winner</span>
									{:else if playerIsJudge}
										<span class="status judge">Card Czar</span>
									{:else if playerHasPlayed}
										<span class="status played">Played</span>
									{/if}
									<strong class="score">{player.score}</strong>
								</div>
							</div>
						{/if}
					</li>
				{/each}
				{#each joinRequests as request (request.user.id)}
					{#if request.isApproved}
						<li class="approved-joiner">
							<div class="player-row-content">
								<div class="player-name">
									<span class="player-mark" aria-hidden="true">{displayName(request.user).slice(0, 1).toUpperCase()}</span>
									<span class="name-and-role">
										<strong>{displayName(request.user)}</strong>
										<small>Joining next round</small>
									</span>
								</div>
								<strong class="score">0</strong>
							</div>
						</li>
					{/if}
				{/each}
			</ol>
		</aside>

		<section class="action-center" aria-labelledby="action-center-title">
			<h2 id="action-center-title">Action Center</h2>
			{#if gameState.gamePhase === 'playing' || gameState.gamePhase === 'judging'}
				<span class="action-phase">{gameState.gamePhase}</span>
			{/if}
			<p>{controlMessage}</p>
			<button type="button" class="primary-action" disabled={controlButtonDisabled} onclick={handleControlAction}>
				{controlButtonLabel}
			</button>
		</section>

		<div class="gameplay-column">
			<div class="round-content">
				{#if gameState.blackCard}
					<div class="black-card" aria-label="Black card">
						<PlayingCard text={blackCardText} type="black" watermark={deckWatermarks[gameState.blackCard.deckId]} pickCount={gameState.blackCard.pickCount} cardStyle="--playing-card-width: var(--game-card-frame-width)" />
					</div>
				{/if}

				{#if gameState.gamePhase === 'gameCompleted'}
					<p class="game-complete">Game complete</p>
				{/if}
			</div>

			{#if gameState.gamePhase === 'playing' || gameState.playedCards.length > 0}
				<section class="cards-panel responses-panel" aria-label="Responses">
					{#if gameState.submittedPlayerIds.length === 0 && gameState.playedCards.length === 0}
						<div class="empty-responses">
							<ManateeLogo mFontStyle="humanist" />
							<p>Wow, such empty...</p>
						</div>
					{:else if gameState.gamePhase === 'playing'}
						<div class="submission-grid">
							{#each gameState.submittedPlayerIds as playerId (playerId)}
								{@const isOwnSubmission = playerId === currentUser?.id}
								<div
									class="submission pending-submission"
									style={`--submission-pick-count: ${gameState.blackCard?.pickCount ?? 1}`}
									aria-label={isOwnSubmission ? 'Your response' : 'Face-down response'}
								>
									{#if isOwnSubmission && localSubmission.length > 0}
										{#each localSubmission as card (card.id)}
											<PlayingCard text={card.content} type="white" watermark={deckWatermarks[card.deckId]} cardStyle="--playing-card-width: 100%" />
										{/each}
									{:else}
										{#each Array(gameState.blackCard?.pickCount ?? 1) as _}
											<PlayingCard text="" type="white" faceDown label="Face-down card" cardStyle="--playing-card-width: 100%" />
										{/each}
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<div class="submission-grid">
							{#each gameState.playedCards as submission, index}
								{@const isWinner = isWinningSubmission(submission)}
								<button
									class="submission"
									class:selected={canJudge && selectedSubmission === index}
									class:winner={isWinner}
									style={`--submission-pick-count: ${submission.length}`}
									type="button"
									disabled={!canJudge}
									aria-pressed={canJudge ? selectedSubmission === index : undefined}
									onclick={() => (selectedSubmission = selectedSubmission === index ? undefined : index)}
								>
									{#each submission as card (card.id)}
										<PlayingCard
											text={card.content}
											type="white"
											watermark={deckWatermarks[card.deckId]}
											selected={canJudge && selectedSubmission === index}
											cardStyle="--playing-card-width: 100%"
										/>
									{/each}
								</button>
							{/each}
						</div>
					{/if}
				</section>
			{/if}

			{#if gameState.hand.length > 0}
				<section class="cards-panel hand-panel" class:is-judge={isJudge} aria-labelledby="hand-title">
					<div class="section-heading">
						<h3 id="hand-title">Your cards</h3>
						{#if canPickCards}
							<span>{selectedCardIds.length}/{gameState.blackCard?.pickCount ?? 0} selected</span>
						{/if}
					</div>
					<div class="hand-grid">
						{#each gameState.hand as card (card.id)}
							<PlayingCard
								text={card.content}
								type="white"
								watermark={deckWatermarks[card.deckId]}
								maxFontSize={21}
								selected={canPickCards && selectedCardIds.includes(card.id)}
								selectionOrder={pickCount > 1 ? selectedCardIds.indexOf(card.id) + 1 : undefined}
								interactive={canPickCards}
								disabled={!canPickCards}
								onSelect={() => toggleCard(card.id)}
							/>
						{/each}
					</div>
					{#if isJudge}
						<strong class="judge-message">You are the Card Czar</strong>
					{/if}
				</section>
			{/if}
		</div>
	</div>
</section>

<style>
	.game-board {
		--ink: #202a2b;
		--muted: #647274;
		--line: #d9e1de;
		--paper: #fffefa;
		--sea: #087e78;
		--sea-soft: #e2f3ef;
		--coral: #c6533b;
		--game-card-frame-width: min(14.7rem, calc(100vw - 3rem));
		width: 100vw;
		margin-left: calc(50% - 50vw);
		padding-right: 1rem;
		box-sizing: border-box;
		color: var(--ink);
	}

	.table-layout {
		display: grid;
		grid-template-columns: minmax(13rem, 16rem) 16rem minmax(0, 1fr);
		grid-template-rows: minmax(18rem, auto) minmax(10rem, 1fr);
		align-items: stretch;
		gap: 0.55rem;
		min-width: 0;
		min-height: calc(100dvh - 13rem);
	}

	.gameplay-column {
		display: contents;
	}

	.players-panel,
	.round-content,
	.cards-panel {
		border: 1px solid var(--line);
		background: var(--paper);
	}

	.players-panel {
		grid-column: 1;
		grid-row: 1;
		min-height: 0;
		padding: 0.7rem;
		border-left: 0;
		border-top: 0;
		border-bottom: 0;
	}

	.join-requests {
		display: grid;
		gap: 0.6rem;
		margin-top: 1rem;
		padding: 0.8rem;
		border-left: 3px solid var(--sea);
		background: var(--sea-soft);
	}

	.join-requests h3 {
		margin: 0;
		font-size: 0.9rem;
	}

	.join-request {
		display: grid;
		gap: 0.45rem;
		padding-top: 0.55rem;
		border-top: 1px solid rgb(8 126 120 / 20%);
	}

	.join-request strong {
		overflow-wrap: anywhere;
		font-size: 0.88rem;
	}

	.join-request-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.join-request-actions button {
		padding: 0.4rem 0.55rem;
		border: 1px solid var(--sea);
		background: white;
		color: #075d56;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 700;
		cursor: pointer;
	}

	.join-request-actions .decline-request {
		border-color: #c6533b;
		color: #9c3d2c;
	}

	.panel-heading,
	.section-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.panel-heading h2,
	.section-heading h3 {
		margin: 0;
	}

	.panel-heading h2,
	.section-heading h3 {
		font-size: 1rem;
	}

	.panel-heading > span,
	.section-heading > span {
		color: var(--muted);
		font-size: 0.84rem;
		font-weight: 650;
	}

	.player-list {
		display: grid;
		gap: 0.25rem;
		margin: 0.8rem 0 0;
		padding: 0;
		list-style: none;
	}

	.player-list li {
		position: relative;
		box-sizing: border-box;
		width: 100%;
		min-width: 0;
		padding: 0;
		border-top: 1px solid #e9eeeb;
	}

	.player-list li.current-player {
		background: #f0f6f2;
	}

	.player-list li.winner-player {
		border-left: 4px solid var(--sea);
		background: var(--sea-soft);
	}

	.player-list li.disconnected-player {
		border-left: 4px solid var(--coral);
		background: #fff0e8;
	}

	.player-row-menu {
		position: relative;
	}

	.player-row-trigger,
	.player-row-content {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		width: 100%;
		min-width: 0;
		padding: 0.4rem 0.5rem;
		border: 0;
		border-radius: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
	}

	.player-row-trigger {
		cursor: pointer;
	}

	.player-row-trigger:hover,
	.player-row-trigger[aria-expanded='true'] {
		background: rgb(8 126 120 / 8%);
	}

	.player-row-trigger:focus-visible {
		position: relative;
		z-index: 1;
		outline: 2px solid var(--sea);
		outline-offset: -2px;
	}

	.player-row-menu:has(.player-menu) .player-row-trigger {
		background: rgb(8 126 120 / 8%);
	}

	.player-row-content {
		cursor: default;
	}

	.player-menu {
		position: absolute;
		z-index: 3;
		top: calc(100% + 0.2rem);
		right: 0;
		min-width: 9rem;
		padding: 0.25rem;
		border: 1px solid var(--line);
		background: var(--paper);
		box-shadow: 0 0.5rem 1.25rem rgb(32 42 43 / 16%);
	}

	.player-menu button {
		width: 100%;
		padding: 0.55rem 0.65rem;
		border: 0;
		background: transparent;
		color: var(--coral);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 700;
		text-align: left;
		cursor: pointer;
	}

	.player-menu button:hover {
		background: #fff0e8;
	}

	.player-menu button:first-child {
		color: var(--sea);
	}

	.player-menu button:first-child:hover {
		background: var(--sea-soft);
	}

	.player-name,
	.player-score-status,
	.name-and-role {
		display: flex;
		align-items: center;
	}

	.player-name {
		min-width: 0;
		gap: 0.6rem;
	}

	.name-and-role {
		align-items: flex-start;
		flex-direction: column;
		min-width: 0;
		gap: 0.1rem;
	}

	.name-and-role strong {
		overflow-wrap: anywhere;
		font-size: 0.9rem;
	}

	.name-and-role small {
		color: var(--sea);
		font-size: 0.72rem;
		font-weight: 700;
	}

	.player-mark {
		display: grid;
		flex: 0 0 2rem;
		place-items: center;
		width: 2rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: #e8ece8;
		color: #3d514e;
		font-size: 0.8rem;
		font-weight: 800;
	}

	.current-player .player-mark {
		background: #d0e8de;
		color: #075d56;
	}

	.winner-player .player-mark {
		background: var(--sea);
		color: white;
	}

	.winner-player .name-and-role strong {
		font-weight: 850;
	}

	.player-score-status {
		flex: 0 0 auto;
		gap: 0.45rem;
	}

	.score {
		min-width: 1.8rem;
		text-align: right;
		font-size: 1.15rem;
		font-variant-numeric: tabular-nums;
	}

	.status {
		padding: 0.2rem 0.4rem;
		font-size: 0.68rem;
		font-weight: 750;
	}

	.status.played {
		background: var(--sea-soft);
		color: #17635b;
	}

	.status.winner {
		background: var(--sea);
		color: white;
	}

	.status.disconnected {
		background: #f9ddcf;
		color: #8f351f;
	}

	.status.judge {
		background: #e8ebe7;
		color: #4b5a58;
	}

	.round-content,
	.cards-panel {
		display: grid;
		gap: 0.45rem;
		min-width: 0;
		padding: 0.65rem;
	}

	.round-content {
		grid-column: 2;
		grid-row: 1;
		place-content: center;
	}

	.cards-panel {
		grid-column: 3;
		grid-row: 1;
	}

	.action-center {
		position: relative;
		grid-column: 1;
		grid-row: 2;
		align-self: end;
		margin-bottom: 2rem;
		display: grid;
		justify-items: stretch;
		align-content: end;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid #c9d8d2;
		border-top: 3px solid var(--sea);
		border-bottom: 3px solid var(--sea);
		background: linear-gradient(145deg, #fffefa, #f1f7f3);
		box-shadow: 0 3px 12px rgb(32 42 43 / 8%);
		text-align: left;
	}

	.action-center h2 {
		margin: 0;
		color: var(--sea);
		font-size: 0.8rem;
		font-weight: 850;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.action-phase {
		position: absolute;
		top: 1rem;
		right: 1rem;
		color: var(--muted);
		font-size: 0.68rem;
		font-weight: 850;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.action-center > p {
		margin: 0;
		font-size: 1rem;
		font-weight: 750;
		line-height: 1.3;
	}

	.empty-responses {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		align-self: center;
		justify-self: center;
		margin: 0;
		color: var(--muted);
		font-size: clamp(1.2rem, 2.3vw, 1.8rem);
		font-style: italic;
		font-weight: 500;
		text-align: center;
	}

	.empty-responses p {
		margin: 0;
	}

	.empty-responses :global(.manatee-logo) {
		width: clamp(2.5rem, 5vw, 4rem);
		color: var(--muted);
	}

	.responses-panel:has(.empty-responses) {
		place-items: center;
	}

	.hand-panel {
		position: relative;
		grid-column: 2 / 4;
		grid-row: 2;
		align-self: stretch;
		padding-top: 0.35rem;
	}

	.responses-panel {
		position: relative;
		padding-top: 0.65rem;
	}

	.judge-message {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 2;
		transform: translate(-50%, -50%);
		padding: 0.65rem 1rem;
		background: rgb(255 254 250 / 88%);
		box-shadow: 0 1px 5px rgb(32 42 43 / 12%);
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		text-align: center;
	}

	.black-card {
		display: grid;
		justify-items: center;
		min-width: 0;
	}

	.hand-grid,
	.submission-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: 0.65rem;
	}

	.hand-grid {
		display: flex;
		flex-wrap: nowrap;
		align-items: flex-start;
		gap: 0.45rem;
		min-width: 0;
		padding: 1rem 1rem 1rem 0.35rem;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: thin;
		scroll-padding-inline: 0.65rem;
		scroll-padding-right: 1rem;
	}

	.hand-grid :global(.playing-card) {
		flex: 1 1 0;
		width: 100%;
		min-width: 0;
		max-width: 9rem;
	}

	.submission-grid {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.submission {
		position: relative;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: repeat(var(--submission-pick-count, 1), minmax(0, 1fr));
		align-items: center;
		align-content: center;
		gap: 0.2rem;
		width: min(calc(var(--game-card-frame-width) * var(--submission-pick-count, 1)), 100%);
		padding: 0;
		border: 1px solid #ccd5d1;
		border-radius: 0.38rem;
		background: #f3f5f1;
		color: var(--ink);
		text-align: left;
	}

	button.submission {
		cursor: pointer;
	}

	.pending-submission {
		cursor: default;
	}

	.submission :global(.playing-card) {
		width: 100%;
		align-self: center;
		min-width: 0;
	}

	.approved-joiner .player-row-content {
		font-style: italic;
		opacity: 0.68;
	}

	button.submission:hover:not(:disabled) {
		border-color: #5754c7;
		outline: 2px solid #d5d4ff;
	}

	button.submission.selected {
		border: 3px solid #5754c7;
		border-radius: 0.38rem;
		box-shadow: 0 0 0 1px #5754c7;
	}

	.submission.winner {
		border: 3px solid var(--sea);
		border-radius: 0.38rem;
		box-shadow: 0 0 0 1px var(--sea), 0 0 0 4px var(--sea-soft);
		background: var(--sea-soft);
	}

	button.submission.winner:hover:not(:disabled) {
		border-color: var(--sea);
		outline-color: var(--sea-soft);
	}

	.submission:disabled {
		cursor: default;
	}

	.primary-action {
		justify-self: start;
		box-sizing: border-box;
		height: 1.75rem;
		min-height: 1.75rem;
		padding: 0 0.6rem;
		border: 0;
		background: var(--sea);
		color: white;
		font: inherit;
		font-size: 0.85rem;
		line-height: 1;
		font-weight: 750;
		cursor: pointer;
	}

	.action-center .primary-action {
		justify-self: stretch;
		width: 100%;
	}

	.primary-action:disabled {
		background: #9baaa5;
		cursor: not-allowed;
	}

	.game-complete {
		margin: 0;
		color: var(--sea);
		font-size: 1.15rem;
		font-weight: 800;
	}

	@media (max-width: 760px) {
		.table-layout {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: none;
			gap: 0.75rem;
			min-height: 0;
		}

		.game-board {
			width: 100%;
			margin-left: 0;
			padding-right: 0;
		}

		.players-panel,
		.action-center,
		.round-content,
		.cards-panel,
		.hand-panel {
			grid-column: 1;
			grid-row: auto;
		}

		.players-panel {
			min-height: 0;
			border: 1px solid var(--line);
		}

		.round-content {
			order: 1;
		}

		.responses-panel {
			order: 2;
		}

		.hand-panel {
			order: 3;
		}

		.action-center {
			order: 4;
			margin-bottom: 0.5rem;
		}

		.players-panel {
			order: 5;
		}

		.round-content,
		.cards-panel {
			padding: 1rem;
		}

		.hand-grid :global(.playing-card) {
			flex-basis: 0;
		}

	}
</style>