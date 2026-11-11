<script lang="ts">
	import { Check, Pencil, X } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import { apiClient } from '$lib/api/api-client';
	import { currentUser, getCurrentUser } from '$lib/utils/current-user.utils';
	import { showSuccessToast } from '$lib/utils/toast.utils';

	let displayName = $state('');
	let isEditing = $state(false);
	let isLoading = $state(true);
	let isSaving = $state(false);
	let errorMessage = $state('');

	const effectiveDisplayName = $derived($currentUser?.displayName ?? $currentUser?.name ?? '');
	const memberSince = $derived(
		$currentUser
			? new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date($currentUser.createdAt))
			: ''
	);

	const isDirty = $derived(displayName.trim() !== ($currentUser?.displayName ?? ''));

	onMount(async () => {
		const profile = await getCurrentUser();
		if (!profile) {
			errorMessage = 'Unable to load your profile.';
		} else {
			displayName = profile.displayName ?? '';
		}
		isLoading = false;
	});

	async function saveProfile(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		isSaving = true;
		errorMessage = '';
		const result = await apiClient.updateUserProfile({ displayName: displayName.trim() || null });
		isSaving = false;
		if (!result.success) {
			errorMessage = result.error.message;
			return;
		}

		currentUser.set(result.data);
		displayName = result.data.displayName ?? '';
		isEditing = false;
		showSuccessToast('Profile updated.');
	}

	function cancelEdit(): void {
		displayName = $currentUser?.displayName ?? '';
		isEditing = false;
	}
</script>

<section aria-labelledby="profile-title">
	<header>
		<p class="eyebrow">Account</p>
		<h1 id="profile-title">Your profile</h1>
	</header>

	{#if errorMessage}
		<p class="feedback error" role="alert">{errorMessage}</p>
	{/if}

	{#if isLoading}
		<p class="muted">Loading profile...</p>
	{:else if $currentUser}
		<div class="profile-details">
			<div class="detail-row">
				<span class="detail-label">Name</span>
				<strong>{$currentUser.name}</strong>
			</div>
			<div class="detail-row">
				<span class="detail-label">Display name</span>
				{#if isEditing}
					<form class="edit-row" onsubmit={saveProfile}>
						<input
							aria-label="Display name"
							bind:value={displayName}
							maxlength="80"
							placeholder={$currentUser.name}
							disabled={isSaving}
						/>
						{#if isDirty}
							<button class="icon-button" type="submit" aria-label="Save display name" title="Save" disabled={isSaving}>
								<Check size={18} aria-hidden="true" />
							</button>
						{/if}
						<button class="icon-button cancel" type="button" aria-label="Cancel display name edit" title="Cancel" onclick={cancelEdit} disabled={isSaving}>
							<X size={18} aria-hidden="true" />
						</button>
					</form>
				{:else}
					<div class="edit-row">
						<strong>{effectiveDisplayName}</strong>
						<button class="icon-button" type="button" aria-label="Edit display name" title="Edit display name" onclick={() => (isEditing = true)}>
							<Pencil size={18} aria-hidden="true" />
						</button>
					</div>
				{/if}
			</div>
			<div class="detail-row">
				<span class="detail-label">Email address</span>
				<strong class="email">{$currentUser.email}</strong>
			</div>
			<div class="detail-row">
				<span class="detail-label">Manatee since</span>
				<strong>{memberSince}</strong>
			</div>
		</div>
	{/if}
</section>

<style>
	section {
		display: grid;
		gap: 1.75rem;
	}

	header {
		padding-bottom: 1rem;
		border-bottom: 1px solid #d1d5db;
	}

	.eyebrow {
		margin: 0 0 0.5rem;
		color: var(--color-primary-dark);
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
	}

	.profile-details {
		display: grid;
	}

	.detail-row {
		display: grid;
		grid-template-columns: minmax(8rem, 0.8fr) minmax(0, 1.5fr);
		gap: 1rem;
		padding: 0.9rem 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.detail-row strong,
	.email {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.detail-label,
	.muted {
		color: #59616b;
	}

	.edit-row {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 0;
	}

	input {
		flex: 1;
		min-width: 0;
		padding: 0.45rem 0.6rem;
		border: 1px solid #9ca3af;
		border-radius: 0.375rem;
		font: inherit;
	}

	.icon-button {
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 0;
		border-radius: 0.375rem;
		background: var(--color-primary);
		color: white;
		cursor: pointer;
	}

	.icon-button.cancel {
		background: #6b7280;
	}

	.icon-button:disabled {
		cursor: default;
		background: #e5e7eb;
		color: #6b7280;
	}

	.feedback {
		margin: 0;
	}

	.error {
		color: var(--color-warning-dark);
	}

	@media (max-width: 36rem) {
		.detail-row {
			grid-template-columns: 1fr;
			gap: 0.3rem;
		}
	}
</style>
