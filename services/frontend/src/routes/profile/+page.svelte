<script lang="ts">
	import UserProfile from '$lib/components/UserProfile.svelte';
</script>

<svelte:head>
	<title>Profile | Manatees</title>
</svelte:head>

<main>
	<UserProfile />
</main>

<style>
	main {
		width: min(100% - 2rem, 42rem);
		margin: 0 auto;
		padding: 3rem 0;
	}

	@media (max-width: 36rem) {
		main {
			padding-top: 2rem;
		}
	}
</style>
