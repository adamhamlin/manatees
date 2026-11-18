<script lang="ts">
	import type { User } from '@manatees/shared/types';

	type Props = {
		winner: User | undefined;
		isAdmin: boolean;
		isReturning: boolean;
		onReturnToStart: () => void;
	};

	let { winner, isAdmin, isReturning, onReturnToStart }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialog) {
			return;
		}
		if (winner && !dialog.open) {
			dialog.showModal();
		} else if (!winner && dialog.open) {
			dialog.close();
		}
	});
</script>

<dialog
	bind:this={dialog}
	aria-labelledby="game-completed-title"
	oncancel={(event) => {
		// The admin needs the reset button, so Escape must not dismiss it for them
		if (isAdmin) {
			event.preventDefault();
		}
	}}
>
	{#if winner}
		<div class="game-completed">
			<p class="eyebrow">Game over</p>
			<h2 id="game-completed-title">{winner.displayName || winner.name} won the game!</h2>
			{#if isAdmin}
				<button class="return-button" type="button" disabled={isReturning} onclick={onReturnToStart}>
					Return to Start Game Page
				</button>
			{:else}
				<p class="waiting">Waiting for the admin to return to the start game page...</p>
			{/if}
		</div>
	{/if}
</dialog>

<style>
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

	.game-completed {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
	}

	.eyebrow {
		margin: 0;
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-primary);
	}

	h2 {
		margin: 0;
		overflow-wrap: anywhere;
	}

	.waiting {
		margin: 0;
		color: #6b7280;
	}

	.return-button {
		justify-self: start;
		padding: 0.7rem 1rem;
		border: 0;
		border-radius: 0.5rem;
		background: var(--color-primary);
		color: white;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.return-button:disabled {
		cursor: default;
		opacity: 0.65;
	}
</style>
