<script>
	export let name;
	import Route from './lib/Route.svelte'
</script>

<main>
	<h1>Super! Passio Go.</h1>
	<Route />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		background-color: #605D7F;
		font-family: 'Silkscreen';
	}

	h1 {
		color: #ffffff;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>