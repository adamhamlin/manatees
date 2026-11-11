<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { apiClient } from '$lib/api/api-client';
	import { environment } from '$lib/environment';
	import { hasSessionToken } from '$lib/utils/session-utils';

	const redirectTo = $derived(page.url.searchParams.get('redirectTo') ?? '/lobby');

	async function signInWithFakeGoogle(): Promise<void> {
		const name = window.prompt('Name for the fake Google user:')?.trim();
		if (!name) {
			return;
		}

		const result = await apiClient.devLogin(name, redirectTo);
		if (result.success) {
			window.location.assign(result.data.redirectTo);
		}
	}

	if (hasSessionToken()) {
		// svelte-ignore state_referenced_locally
		goto(redirectTo);
	}
</script>

<main>
	<section>
		<h1>Log in</h1>
		<!-- Plain link (not goto): the backend redirects the browser to Google -->
		<a class="button" href={`/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`}>
			Sign in with Google
		</a>
		{#if environment.allowDevLogins}
			<button class="button dev" type="button" onclick={() => void signInWithFakeGoogle()}>
				Sign in with Fake Google
			</button>
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
		width: min(100%, 28rem);
		padding: 2rem;
		border: 1px solid #e5e7eb;
		border-radius: 1rem;
		background: white;
	}

	h1 {
		margin: 0 0 1rem;
		text-align: center;
	}

	.button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.8rem 1rem;
		border-radius: 0.75rem;
		font-weight: 600;
		background: var(--color-primary);
		color: white;
		text-decoration: none;
	}

	.button.dev {
		width: 100%;
		margin-top: 0.75rem;
		border: 0;
		background: #6b7280;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
</style>
