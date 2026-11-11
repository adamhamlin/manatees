<script lang="ts">
	import '../app.css';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { match } from 'ts-pattern';
	import favicon from '$lib/assets/favicon.svg';
	import { clearCurrentUser, currentUser, getCurrentUser } from '$lib/utils/current-user.utils';
	import { hasSessionToken } from '$lib/utils/session-utils';
	import { apiClient } from '$lib/api/api-client';
	import { environment } from '$lib/environment';
	import ErrorToasts from '$lib/components/ErrorToasts.svelte';

	let { children } = $props();
	let isProfileMenuOpen = $state(false);
	let profileMenuRef: HTMLDivElement | undefined = $state();
	let leaveDialog: HTMLDialogElement | undefined = $state();
	let pendingHeaderAction = $state<'home' | 'lobby' | 'logout' | undefined>();
	let isLeavingGame = $state(false);
	let leaveError = $state('');
	let currentUserInitial = $derived(($currentUser?.displayName ?? $currentUser?.name)?.charAt(0).toUpperCase() ?? '?');
	let isLoggedIn = $state(hasSessionToken());
	let gameId = $derived(page.params.gameId);

	function requestNavigation(event: MouseEvent, destination: 'home' | 'lobby'): void {
		if (!gameId) {
			return;
		}

		event.preventDefault();
		requestGameExit(destination);
	}

	function requestProfileAction(action: 'profile' | 'logout'): void {
		match(action)
			.with('profile', () => {
				isProfileMenuOpen = !isProfileMenuOpen;
			})
			.with('logout', () => {
				if (gameId) {
					requestGameExit('logout');
				} else {
					void logout();
				}
			})
			.exhaustive();
	}

	function requestGameExit(action: 'home' | 'lobby' | 'logout'): void {
		pendingHeaderAction = action;
		leaveError = '';
		leaveDialog?.showModal();
	}

	async function confirmGameExit(): Promise<void> {
		if (!gameId || !pendingHeaderAction) {
			return;
		}

		isLeavingGame = true;
		await apiClient.leaveGame(gameId);

		// We won't condition on a fetch error, just let them leave

		const action = pendingHeaderAction;
		pendingHeaderAction = undefined;
		leaveDialog?.close();
		isLeavingGame = false;

		if (action === 'home') {
			await goto('/');
		} else if (action === 'lobby') {
			await goto('/lobby');
		} else if (action === 'logout') {
			await logout();
		}
	}

	async function refreshUserInitial(): Promise<void> {
		if (!hasSessionToken()) {
			clearCurrentUser();
			return;
		}

		await getCurrentUser();
	}

	afterNavigate(({ to }) => {
		if (typeof window === 'undefined') {
			return;
		}

		const target = to?.url.pathname ?? window.location.pathname;
		const isPublicPath = target === '/' || target === '/login';
		const loggedIn = hasSessionToken();
		isLoggedIn = loggedIn;
		if (!loggedIn && !isPublicPath) {
			const search = to?.url.search ?? window.location.search;
			const redirectTo = `${target}${search}`;
			window.location.replace(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
		}
		if (loggedIn) {
			void refreshUserInitial();
		}
	});

	onMount(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (!isProfileMenuOpen) {
				return;
			}

			const target = event.target as Node;
			if (profileMenuRef && !profileMenuRef.contains(target)) {
				isProfileMenuOpen = false;
			}
		};

		window.addEventListener('click', handleClickOutside);
		if (hasSessionToken()) {
			isLoggedIn = true;
			// Don't need to/can't wait the refresh here
			void refreshUserInitial();
		}

		return () => {
			window.removeEventListener('click', handleClickOutside);
		};
	});

	async function logout(): Promise<void> {
		if (typeof document === 'undefined') {
			return;
		}

		try {
			await apiClient.logoutUser();
		} catch {
			// ignore backend logout failures and still log the user out locally
		}
		document.cookie = `${environment.apiAuthCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
		clearCurrentUser();
		isLoggedIn = false;
		isProfileMenuOpen = false;
		window.location.assign('/login');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<div class="nav-links">
		<a href="/" onclick={(event) => requestNavigation(event, 'home')}>Home</a>
		<a href="/lobby" onclick={(event) => requestNavigation(event, 'lobby')}>Lobby</a>
	</div>

	{#if isLoggedIn}
		<div class="profile-menu" bind:this={profileMenuRef}>
			<button
				class="profile-trigger"
				type="button"
				aria-label="Open profile menu"
				aria-expanded={isProfileMenuOpen}
				aria-controls="profile-dropdown"
				onclick={() => requestProfileAction('profile')}
			>
				{currentUserInitial}
			</button>
			{#if isProfileMenuOpen}
				<div class="profile-dropdown" id="profile-dropdown">
					<div class="profile-identity">
						<strong class="profile-display-name">{$currentUser?.displayName ?? $currentUser?.name ?? 'User unavailable'}</strong>
						<span class="profile-email">{$currentUser?.email ?? ''}</span>
					</div>
					<a class="profile-menu-item" href="/profile" onclick={() => (isProfileMenuOpen = false)}>Profile</a>
					<a class="profile-menu-item" href="/deck-editor" onclick={() => (isProfileMenuOpen = false)}>Deck Editor</a>
					<button type="button" class="profile-menu-item" onclick={() => requestProfileAction('logout')}>Log out</button>
				</div>
			{/if}
		</div>
	{/if}
</nav>

{@render children()}
<ErrorToasts />

<dialog bind:this={leaveDialog} aria-labelledby="leave-title" aria-describedby="leave-description">
	<form method="dialog" class="leave-dialog-form">
		<h2 id="leave-title">Leave this game?</h2>
		{#if leaveError}
			<p class="leave-error" role="alert">{leaveError}</p>
		{/if}
		<div class="leave-dialog-actions">
			<button class="stay-button" type="submit" disabled={isLeavingGame}>Stay</button>
			<button class="leave-confirm-button" type="button" onclick={() => void confirmGameExit()} disabled={isLeavingGame}>
				{isLeavingGame ? 'Leaving...' : 'Leave'}
			</button>
		</div>
	</form>
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

	.leave-dialog-form {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
	}

	dialog h2,
	dialog p {
		margin: 0;
	}

	.leave-dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.stay-button,
	.leave-confirm-button {
		padding: 0.7rem 1rem;
		border-radius: 0.5rem;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.stay-button {
		border: 1px solid #d1d5db;
		background: white;
		color: #111827;
	}

	.leave-confirm-button {
		border: 0;
		background: var(--color-warning);
		color: white;
	}

	.leave-confirm-button:disabled,
	.stay-button:disabled {
		cursor: default;
		opacity: 0.65;
	}

	.leave-error {
		color: var(--color-warning);
	}

	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.nav-links {
		display: flex;
		gap: 1rem;
	}

	nav a {
		text-decoration: none;
		color: #111827;
		font-weight: 600;
	}

	.profile-menu {
		position: relative;
	}

	.profile-trigger {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		border: 2px solid white;
		border-radius: 50%;
		background: var(--color-primary);
		color: white;
		font: inherit;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 0 0 1px #d1d5db;
		transition: box-shadow 120ms ease, transform 120ms ease;
	}

	.profile-trigger:hover {
		transform: translateY(-1px);
		box-shadow: 0 0 0 2px var(--color-primary);
	}

	.profile-trigger:focus-visible,
	.profile-menu-item:focus-visible {
		outline: 3px solid #111827;
		outline-offset: 3px;
	}

	.profile-dropdown {
		position: absolute;
		right: 0;
		top: calc(100% + 0.5rem);
		z-index: 20;
		width: max-content;
		min-width: min(16rem, calc(100vw - 2rem));
		max-width: calc(100vw - 2rem);
		padding: 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.625rem;
		background: white;
		box-shadow: 0 12px 28px rgb(15 23 42 / 16%);
	}

	.profile-identity {
		display: grid;
		gap: 0.3rem;
		min-width: 0;
		padding: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.profile-display-name {
		overflow-wrap: anywhere;
		color: #111827;
		font-size: 0.95rem;
		font-weight: 600;
	}

	.profile-email {
		overflow-wrap: anywhere;
		color: #59616b;
		font-size: 0.8rem;
	}

	.profile-menu-item {
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 2.5rem;
		padding: 0.55rem 0.75rem;
		border: none;
		border-radius: 0.375rem;
		background: transparent;
		color: #374151;
		font-family: inherit;
		font-size: 0.9rem;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
	}

	.profile-menu-item:hover {
		background: #f3f4f6;
		color: #111827;
	}
</style>
