<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { DISMISS_TOAST_EVENT_NAME, TOAST_EVENT_NAME, type ToastAction } from '$lib/utils/toast.utils';

	type ToastMessage = {
		id: number;
		key?: string;
		message: string;
		type: 'error' | 'success' | 'warning';
		action?: ToastAction;
	};

	let toastMessages = $state<ToastMessage[]>([]);
	let toastHome: HTMLDivElement | undefined = $state();
	let toastStackElement: HTMLDivElement | undefined = $state();
	let nextToastId = 0;
	const toastTimers = new Map<number, ReturnType<typeof setTimeout>>();

	function syncToastLayer(): void {
		if (!toastHome || !toastStackElement) return;
		const activeModal = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog:modal')).at(-1);
		const target: HTMLElement = activeModal ?? toastHome;
		if (toastStackElement.parentElement !== target) target.append(toastStackElement);
	}

	function removeToast(id: number): void {
		const timer = toastTimers.get(id);
		if (timer) {
			clearTimeout(timer);
			toastTimers.delete(id);
		}
		toastMessages = toastMessages.filter((toast) => toast.id !== id);
	}

	onMount(() => {
		const handleToast = (event: Event) => {
			const detail = (event as CustomEvent<Omit<ToastMessage, 'id'>>).detail;
			if (!detail?.message) return;

			if (detail.key) {
				const existingToast = toastMessages.find((toast) => toast.key === detail.key);
				if (existingToast) removeToast(existingToast.id);
			}

			const toast: ToastMessage = {
				id: ++nextToastId,
				key: detail.key,
				message: detail.message,
				type: detail.type ?? 'error',
				action: detail.action
			};
			toastMessages = [...toastMessages, toast];
			if (toast.type === 'success') {
				toastTimers.set(toast.id, setTimeout(() => removeToast(toast.id), 2000));
			}
		};

		const handleDismissToast = (event: Event) => {
			const { key } = (event as CustomEvent<{ key: string }>).detail;
			const toast = toastMessages.find((item) => item.key === key);
			if (toast) removeToast(toast.id);
		};

		window.addEventListener(TOAST_EVENT_NAME, handleToast);
		window.addEventListener(DISMISS_TOAST_EVENT_NAME, handleDismissToast);
		const dialogObserver = new MutationObserver(() => syncToastLayer());
		dialogObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['open'],
			childList: true,
			subtree: true
		});
		syncToastLayer();

		return () => {
			window.removeEventListener(TOAST_EVENT_NAME, handleToast);
			window.removeEventListener(DISMISS_TOAST_EVENT_NAME, handleDismissToast);
			dialogObserver.disconnect();
			toastTimers.forEach((timer) => clearTimeout(timer));
			toastTimers.clear();
		};
	});
</script>

<div class="toast-home" bind:this={toastHome}>
	<div class="toast-stack" class:empty={toastMessages.length === 0} bind:this={toastStackElement} aria-label="Notifications">
		{#each toastMessages as toast (toast.id)}
			<div
				transition:fade={{ duration: 180 }}
				class:error-toast={toast.type === 'error'}
				class:success-toast={toast.type === 'success'}
				class:warning-toast={toast.type === 'warning'}
				role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
			>
				<span>{toast.message}</span>
				{#if toast.action}
					<button class="toast-action" type="button" onclick={() => { toast.action?.onClick(); removeToast(toast.id); }}>
						{toast.action.label}
					</button>
				{/if}
				<button type="button" aria-label="Dismiss notification" onclick={() => removeToast(toast.id)}>x</button>
			</div>
		{/each}
	</div>
</div>

<style>
	.toast-home {
		display: contents;
	}

	.toast-stack {
		position: fixed;
		z-index: 2147483000;
		inset: auto auto 1rem 1rem;
		display: grid;
		gap: 0.75rem;
		width: min(26rem, calc(100vw - 2rem));
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		pointer-events: none;
	}

	.toast-stack.empty {
		display: none;
	}

	.toast-stack > div {
		pointer-events: auto;
	}

	.error-toast,
	.success-toast,
	.warning-toast {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.9rem 1rem;
		border: 1px solid;
		border-left-width: 4px;
		border-radius: 0.5rem;
		box-shadow: 0 0.5rem 1.5rem rgb(17 24 39 / 14%);
		overflow-wrap: anywhere;
	}

	.error-toast {
		border-color: var(--color-warning-border);
		border-left-color: var(--color-warning);
		background: var(--color-warning-bg);
		color: var(--color-warning-dark);
	}

	.error-toast > span {
		white-space: pre-line;
	}

	.warning-toast {
		border-color: #e5a33c;
		border-left-color: #bd6a12;
		background: #fff5df;
		color: #70400c;
	}

	.success-toast {
		border-color: var(--color-primary-border);
		border-left-color: var(--color-primary);
		background: var(--color-primary-soft);
		color: var(--color-primary-dark);
	}

	.error-toast button,
	.success-toast button,
	.warning-toast button {
		flex: 0 0 auto;
		padding: 0 0.25rem;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.warning-toast .toast-action {
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}
</style>