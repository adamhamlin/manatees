<script lang="ts">
	import { onMount } from 'svelte';
	import { EllipsisVertical, Pencil, Plus, Trash2, X } from 'lucide-svelte';
	import {
		blackCardInputSchema,
		customDeckInputSchema,
		whiteCardInputSchema,
		type DeckWithCards,
		type DeckSearchHit
	} from '@manatees/shared/types';
	import { apiClient } from '$lib/api/api-client';
	import { showErrorToast, showSuccessToast } from '$lib/utils/toast.utils';

	type CardKind = 'white' | 'black';
	type EditableCard = { id: number; content: string; pickCount?: number };

	let decks = $state<DeckSearchHit[]>([]);
	let deckDetails = $state<DeckWithCards>();
	let selectedDeckId = $state<number>();
	let activeTab = $state<CardKind>('white');
	let isLoadingDecks = $state(true);
	let isLoadingCards = $state(false);
	let openMenu = $state('');
	let deckDialog = $state<HTMLDialogElement>();
	let cardDialog = $state<HTMLDialogElement>();
	let editingDeckId = $state<number>();
	let editingCard = $state<EditableCard>();
	let deckName = $state('');
	let deckWatermark = $state('');
	let cardText = $state('');
	let pickCount = $state(1);
	let duplicateDeckNames = $state<string[]>([]);
	let duplicateLookupSequence = 0;

	const selectedDeck = $derived(decks.find((deck) => deck.id === selectedDeckId));
	const visibleCards = $derived<EditableCard[]>(
		activeTab === 'white'
			? deckDetails?.whiteCards ?? []
			: deckDetails?.blackCards ?? []
	);

	onMount(() => {
		void loadDecks();
		const closeMenus = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof Element) || !target.closest('.menu-anchor')) openMenu = '';
		};
		window.addEventListener('click', closeMenus);
		return () => window.removeEventListener('click', closeMenus);
	});

	async function loadDecks(selectId?: number): Promise<void> {
		isLoadingDecks = true;
		const result = await apiClient.getOwnedDecks();
		if (result.success) {
			decks = result.data.decks;
			const nextId = selectId ?? (decks.some((deck) => deck.id === selectedDeckId) ? selectedDeckId : decks[0]?.id);
			selectedDeckId = nextId;
			if (nextId !== undefined) await loadDeck(nextId);
			else deckDetails = undefined;
		}
		isLoadingDecks = false;
	}

	async function loadDeck(deckId: number): Promise<void> {
		selectedDeckId = deckId;
		isLoadingCards = true;
		const result = await apiClient.getDeckById(deckId);
		deckDetails = result.success ? result.data : undefined;
		isLoadingCards = false;
	}

	function openDeckForm(deck?: DeckSearchHit): void {
		openMenu = '';
		editingDeckId = deck?.id;
		deckName = deck?.name ?? '';
		deckWatermark = deck?.watermark ?? '';
		deckDialog?.showModal();
	}

	async function saveDeck(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		const input = { name: deckName, watermark: deckWatermark };
		const validation = customDeckInputSchema.safeParse(input);
		if (!validation.success) {
			showErrorToast(validation.error.issues.map((issue) => issue.message).join('\n'));
			return;
		}
		const result = editingDeckId === undefined
			? await apiClient.createCustomDeck(validation.data)
			: await apiClient.updateCustomDeck(editingDeckId, validation.data);
		if (!result.success) return;
		deckDialog?.close();
		showSuccessToast(editingDeckId === undefined ? 'Deck created.' : 'Deck updated.');
		await loadDecks(result.data.id);
	}

	async function deleteDeck(deck: DeckSearchHit): Promise<void> {
		openMenu = '';
		if (!window.confirm(`Delete "${deck.name}" and all of its cards?`)) return;
		const result = await apiClient.deleteCustomDeck(deck.id);
		if (!result.success) return;
		showSuccessToast('Deck deleted.');
		await loadDecks();
	}

	function openCardForm(card?: EditableCard): void {
		if (selectedDeckId === undefined) return;
		openMenu = '';
		editingCard = card;
		cardText = card?.content ?? '';
		pickCount = card?.pickCount ?? 1;
		duplicateDeckNames = [];
		cardDialog?.showModal();
	}

	async function checkDuplicateDecks(content: string): Promise<void> {
		const sequence = ++duplicateLookupSequence;
		const normalizedContent = content.trim();
		if (!normalizedContent || selectedDeckId === undefined) {
			duplicateDeckNames = [];
			return;
		}
		const result = await apiClient.getDecksWithCardText(activeTab, normalizedContent, selectedDeckId);
		if (sequence === duplicateLookupSequence) duplicateDeckNames = result.success ? result.data.deckNames : [];
	}

	async function saveCard(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (selectedDeckId === undefined) return;
		if (activeTab === 'white') {
			const validation = whiteCardInputSchema.safeParse({ content: cardText });
			if (!validation.success) {
				showErrorToast(validation.error.issues.map((issue) => issue.message).join('\n'));
				return;
			}
			const result = editingCard
				? await apiClient.updateWhiteCard(selectedDeckId, editingCard.id, validation.data)
				: await apiClient.createWhiteCard(selectedDeckId, validation.data);
			if (!result.success) return;
		} else {
			const validation = blackCardInputSchema.safeParse({ content: cardText, pickCount: Number(pickCount) });
			if (!validation.success) {
				showErrorToast(validation.error.issues.map((issue) => issue.message).join('\n'));
				return;
			}
			const result = editingCard
				? await apiClient.updateBlackCard(selectedDeckId, editingCard.id, validation.data)
				: await apiClient.createBlackCard(selectedDeckId, validation.data);
			if (!result.success) return;
		}
		cardDialog?.close();
		showSuccessToast(editingCard ? 'Card updated.' : 'Card created.');
		await loadDeck(selectedDeckId);
	}

	async function deleteCard(card: EditableCard): Promise<void> {
		if (selectedDeckId === undefined) return;
		openMenu = '';
		if (!window.confirm('Delete this card?')) return;
		const result = activeTab === 'white'
			? await apiClient.deleteWhiteCard(selectedDeckId, card.id)
			: await apiClient.deleteBlackCard(selectedDeckId, card.id);
		if (!result.success) return;
		showSuccessToast('Card deleted.');
		await loadDeck(selectedDeckId);
	}
</script>

<svelte:head>
	<title>Deck Editor | Manatees</title>
</svelte:head>

<main class="deck-editor-page">
	<header class="page-heading">
		<div>
			<p class="eyebrow">Your Library</p>
			<h1>Deck Editor</h1>
		</div>
	</header>

	<div class="editor-layout">
		<aside class="deck-sidebar" aria-label="Your decks">
			<div class="sidebar-heading">
				<h2>My decks</h2>
				<button class="icon-button add-deck" type="button" aria-label="Add deck" title="Add deck" onclick={() => openDeckForm()}>
					<Plus size={19} aria-hidden="true" />
				</button>
			</div>
			{#if isLoadingDecks}
				<p class="muted">Loading decks...</p>
			{:else if decks.length === 0}
				<p class="muted empty-decks">No decks yet. Create your first deck.</p>
			{:else}
				<ul class="deck-list">
					{#each decks as deck (deck.id)}
						<li class:active={selectedDeckId === deck.id}>
							<button class="deck-select" type="button" aria-current={selectedDeckId === deck.id ? 'true' : undefined} onclick={() => void loadDeck(deck.id)}>
								<strong>{deck.name}</strong>
								<small>{deck.watermark}</small>
							</button>
							<div class="menu-anchor">
								<button class="icon-button menu-trigger" type="button" aria-label={`Actions for ${deck.name}`} aria-expanded={openMenu === `deck-${deck.id}`} onclick={() => (openMenu = openMenu === `deck-${deck.id}` ? '' : `deck-${deck.id}`)}>
									<EllipsisVertical size={18} aria-hidden="true" />
								</button>
								{#if openMenu === `deck-${deck.id}`}
									<div class="context-menu" role="menu">
										<button type="button" role="menuitem" onclick={() => openDeckForm(deck)}><Pencil size={15} />Edit</button>
										<button type="button" role="menuitem" class="delete-item" onclick={() => void deleteDeck(deck)}><Trash2 size={15} />Delete</button>
									</div>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</aside>

		<section class="deck-workspace" aria-label="Selected deck cards">
			{#if selectedDeck}
				<header class="workspace-heading">
					<div>
						<p class="eyebrow">Deck</p>
						<h2>{deckDetails?.name ?? selectedDeck.name}</h2>
					</div>
					<button class="icon-button add-card" type="button" aria-label={`Add ${activeTab} card`} title="Add card" disabled={isLoadingCards} onclick={() => openCardForm()}>
						<Plus size={20} aria-hidden="true" />
					</button>
				</header>
				<div class="card-tabs" role="tablist" aria-label="Card type">
					<button type="button" role="tab" aria-selected={activeTab === 'white'} class:active={activeTab === 'white'} onclick={() => (activeTab = 'white')}>White Cards <span>{deckDetails?.whiteCards.length ?? 0}</span></button>
					<button type="button" role="tab" aria-selected={activeTab === 'black'} class:active={activeTab === 'black'} onclick={() => (activeTab = 'black')}>Black Cards <span>{deckDetails?.blackCards.length ?? 0}</span></button>
				</div>
				<div class="cards-scroll" aria-live="polite">
					{#if isLoadingCards}
						<p class="muted">Loading cards...</p>
					{:else if visibleCards.length === 0}
						<p class="empty-cards">No {activeTab} cards in this deck yet.</p>
					{:else}
						<ul class="card-list">
							{#each visibleCards as card (card.id)}
								<li>
									<div class="card-copy">
										<p>{card.content}</p>
										{#if activeTab === 'black'}<span class="pick-label">Pick {(card as EditableCard).pickCount}</span>{/if}
									</div>
									<div class="menu-anchor">
										<button class="icon-button menu-trigger" type="button" aria-label="Card actions" aria-expanded={openMenu === `card-${card.id}`} onclick={() => (openMenu = openMenu === `card-${card.id}` ? '' : `card-${card.id}`)}>
											<EllipsisVertical size={18} aria-hidden="true" />
										</button>
										{#if openMenu === `card-${card.id}`}
											<div class="context-menu" role="menu">
												<button type="button" role="menuitem" onclick={() => openCardForm(card)}><Pencil size={15} />Edit</button>
												<button type="button" role="menuitem" class="delete-item" onclick={() => void deleteCard(card)}><Trash2 size={15} />Delete</button>
											</div>
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{:else}
				<div class="no-deck-selected">
					<p>Select a deck to view its cards</p>
					<button class="action-button" type="button" onclick={() => openDeckForm()}>Create deck</button>
				</div>
			{/if}
		</section>
	</div>
</main>

<dialog bind:this={deckDialog} aria-labelledby="deck-dialog-title">
	<form class="dialog-form" onsubmit={(event) => void saveDeck(event)}>
		<div class="dialog-title-row">
			<h2 id="deck-dialog-title">{editingDeckId === undefined ? 'New deck' : 'Edit deck'}</h2>
			<button class="icon-button" type="button" aria-label="Close" onclick={() => deckDialog?.close()}><X size={18} /></button>
		</div>
		<label>Deck name<input bind:value={deckName} maxlength="80" required /></label>
		<label>Watermark <span class="field-hint">Up to 6 characters</span><input bind:value={deckWatermark} maxlength="6" /></label>
		<div class="dialog-actions">
			<button class="secondary-button" type="button" onclick={() => deckDialog?.close()}>Cancel</button>
			<button class="action-button" type="submit">{editingDeckId === undefined ? 'Create deck' : 'Save deck'}</button>
		</div>
	</form>
</dialog>

<dialog bind:this={cardDialog} aria-labelledby="card-dialog-title">
	<form class="dialog-form" onsubmit={(event) => void saveCard(event)}>
		<div class="dialog-title-row">
			<h2 id="card-dialog-title">{editingCard ? 'Edit card' : 'New card'}</h2>
			<button class="icon-button" type="button" aria-label="Close" onclick={() => cardDialog?.close()}><X size={18} /></button>
		</div>
		<label>Card text
			<textarea bind:value={cardText} rows="5" maxlength="500" required oninput={(event) => void checkDuplicateDecks(event.currentTarget.value)}></textarea>
		</label>
		{#if activeTab === 'black'}
			<label>Pick count<input bind:value={pickCount} type="number" min="1" step="1" required /></label>
			<ul class="card-instructions">
				<li>Black cards must end with punctuation.</li>
				<li>Write every blank as one underscore with exactly one space on each side: <code> _ </code>.</li>
				<li>Pick count cannot exceed the number of blanks.</li>
				<li>Do not put <code>a</code>, <code>an</code>, or <code>the</code> immediately before a blank.</li>
			</ul>
		{:else}
			<p class="field-hint">Cards must end in punctuation.</p>
		{/if}
		{#if duplicateDeckNames.length > 0}
			<p class="duplicate-warning" role="status">Similar card text is already in: {duplicateDeckNames.join(', ')}.</p>
		{/if}
		<div class="dialog-actions">
			<button class="secondary-button" type="button" onclick={() => cardDialog?.close()}>Cancel</button>
			<button class="action-button" type="submit">{editingCard ? 'Save card' : 'Create card'}</button>
		</div>
	</form>
</dialog>

<style>
	.deck-editor-page {
		--ink: #202a2b;
		--muted: #647274;
		--line: #d7dfdc;
		--sea: #087e78;
		--sea-soft: #e2f3ef;
		box-sizing: border-box;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		gap: 1rem;
		width: min(100%, 96rem);
		height: calc(100dvh - 4.5rem);
		min-height: 28rem;
		margin: 0 auto;
		padding: 1.25rem;
		color: var(--ink);
	}

	.page-heading,
	.sidebar-heading,
	.workspace-heading,
	.dialog-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.page-heading h1,
	.workspace-heading h2,
	.sidebar-heading h2 {
		margin: 0;
	}

	.page-heading h1 {
		font-size: 1.65rem;
	}

	.eyebrow {
		margin: 0 0 0.25rem;
		color: var(--sea);
		font-size: 0.68rem;
		font-weight: 850;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: minmax(14rem, 0.7fr) minmax(0, 2fr);
		gap: 0.85rem;
		min-height: 0;
	}

	.deck-sidebar,
	.deck-workspace {
		min-width: 0;
		min-height: 0;
		border: 1px solid var(--line);
		background: #fffefa;
	}

	.deck-sidebar {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		padding: 0.85rem;
	}

	.sidebar-heading h2 {
		font-size: 1rem;
	}

	.deck-list,
	.card-list {
		display: grid;
		align-content: start;
		gap: 0.35rem;
		min-height: 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.deck-list {
		overflow-y: auto;
		margin-top: 0.75rem;
	}

	.deck-list li,
	.card-list li {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		min-width: 0;
		border: 1px solid transparent;
		border-bottom-color: #e8eeeb;
	}

	.deck-list li.active {
		border-color: #c4ddd5;
		background: var(--sea-soft);
	}

	.deck-select {
		display: grid;
		flex: 1 1 auto;
		gap: 0.2rem;
		min-width: 0;
		padding: 0.65rem 0.5rem;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.deck-select strong {
		overflow-wrap: anywhere;
		font-size: 0.88rem;
	}

	.deck-select small {
		color: var(--muted);
		font-size: 0.72rem;
		font-weight: 750;
		text-transform: uppercase;
	}

	.deck-workspace {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		padding: 1rem;
	}

	.workspace-heading h2 {
		font-size: 1.25rem;
	}

	.icon-button {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 2.15rem;
		aspect-ratio: 1;
		padding: 0;
		border: 1px solid var(--line);
		background: white;
		color: var(--ink);
		cursor: pointer;
	}

	.icon-button:hover:not(:disabled) {
		border-color: var(--sea);
		color: var(--sea);
	}

	.icon-button:disabled {
		cursor: default;
		opacity: 0.5;
	}

	.add-deck,
	.add-card {
		border-color: var(--sea);
		background: var(--sea);
		color: white;
	}

	.card-tabs {
		display: flex;
		gap: 0.25rem;
		margin-top: 1rem;
		border-bottom: 1px solid var(--line);
	}

	.card-tabs button {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.65rem 0.85rem;
		border: 0;
		border-bottom: 3px solid transparent;
		background: transparent;
		color: var(--muted);
		font: inherit;
		font-size: 0.9rem;
		font-weight: 750;
		cursor: pointer;
	}

	.card-tabs button.active {
		border-bottom-color: var(--sea);
		color: var(--sea);
	}

	.card-tabs span {
		font-size: 0.78rem;
		font-variant-numeric: tabular-nums;
	}

	.cards-scroll {
		min-height: 0;
		padding-top: 0.7rem;
		overflow-y: auto;
	}

	.card-list {
		gap: 0.5rem;
	}

	.card-list li {
		justify-content: space-between;
		padding: 0.7rem 0.6rem 0.7rem 0.9rem;
		border-color: var(--line);
		background: white;
	}

	.card-copy {
		min-width: 0;
	}

	.card-copy p {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: 0.95rem;
		line-height: 1.35;
	}

	.pick-label {
		display: inline-block;
		margin-top: 0.35rem;
		color: var(--sea);
		font-size: 0.72rem;
		font-weight: 800;
		text-transform: uppercase;
	}

	.menu-anchor {
		position: relative;
		flex: 0 0 auto;
	}

	.menu-trigger {
		border-color: transparent;
		background: transparent;
	}

	.context-menu {
		position: absolute;
		z-index: 5;
		top: calc(100% + 0.2rem);
		right: 0;
		display: grid;
		min-width: 8rem;
		padding: 0.25rem;
		border: 1px solid var(--line);
		background: white;
		box-shadow: 0 0.5rem 1.25rem rgb(32 42 43 / 14%);
	}

	.context-menu button {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.55rem 0.65rem;
		border: 0;
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 0.82rem;
		text-align: left;
		cursor: pointer;
	}

	.context-menu button:hover {
		background: #f1f6f3;
	}

	.context-menu .delete-item {
		color: #a63e2b;
	}

	.empty-decks,
	.empty-cards,
	.muted {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.empty-decks {
		align-self: start;
		margin: 0.75rem 0 0;
		line-height: 1.4;
	}

	.empty-cards {
		margin: 0.5rem;
		text-align: center;
	}

	.no-deck-selected {
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 0.9rem;
		color: var(--muted);
	}

	.no-deck-selected p {
		margin: 0;
	}

	.action-button,
	.secondary-button {
		min-height: 2.35rem;
		padding: 0.45rem 0.85rem;
		border: 1px solid var(--sea);
		background: var(--sea);
		color: white;
		font: inherit;
		font-size: 0.88rem;
		font-weight: 750;
		cursor: pointer;
	}

	.secondary-button {
		border-color: var(--line);
		background: white;
		color: var(--ink);
	}

	dialog {
		--ink: #202a2b;
		--muted: #647274;
		--line: #d7dfdc;
		--sea: #087e78;
		--sea-soft: #e2f3ef;
		width: min(calc(100% - 2rem), 34rem);
		max-height: calc(100dvh - 2rem);
		padding: 0;
		border: 1px solid var(--line);
		background: #fffefa;
		box-shadow: 0 1.5rem 4rem rgb(17 24 39 / 24%);
	}

	dialog::backdrop {
		background: rgb(17 24 39 / 48%);
	}

	.dialog-form {
		display: grid;
		gap: 1rem;
		padding: 1.25rem;
	}

	.dialog-title-row h2 {
		margin: 0;
		font-size: 1.15rem;
	}

	.dialog-form label {
		display: grid;
		gap: 0.4rem;
		font-size: 0.88rem;
		font-weight: 750;
	}

	.dialog-form input,
	.dialog-form textarea {
		box-sizing: border-box;
		width: 100%;
		padding: 0.65rem 0.75rem;
		border: 1px solid #aebbb6;
		background: white;
		color: var(--ink);
		font: inherit;
		font-size: 0.95rem;
	}

	.dialog-form textarea {
		resize: vertical;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.field-hint {
		color: var(--muted);
		font-size: 0.76rem;
		font-weight: 500;
		line-height: 1.4;
	}

	.card-instructions {
		display: grid;
		gap: 0.3rem;
		margin: -0.35rem 0 0;
		padding-left: 1.2rem;
		color: var(--muted);
		font-size: 0.76rem;
		font-weight: 500;
		line-height: 1.4;
	}

	.duplicate-warning {
		margin: 0;
		padding: 0.65rem 0.75rem;
		border-left: 3px solid #b7791f;
		background: #fff7e6;
		color: #694d16;
		font-size: 0.82rem;
		line-height: 1.4;
	}

	code {
		font-size: 0.9em;
	}

	@media (max-width: 760px) {
		.deck-editor-page {
			height: auto;
			min-height: calc(100dvh - 4.5rem);
			padding: 0.85rem;
		}

		.editor-layout {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: minmax(10rem, 30vh) minmax(24rem, 1fr);
		}
	}
</style>
