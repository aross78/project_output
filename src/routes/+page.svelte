<script>
    import { onMount, onDestroy } from 'svelte';
    export let data;

    const { routes, stops, stopTimes, trips } = data;

    let vehiclePositions = [];
    const fetchInterval = 5000; // Fetch data every 5000 ms (5 seconds)
  
    async function fetchVehiclePosition() {
      try {
        const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        vehiclePositions = data.entity.map(entity => ({
          id: entity.vehicle.vehicle.id,
          label: entity.vehicle.vehicle.label,
          latitude: entity.vehicle.position.latitude,
          longitude: entity.vehicle.position.longitude
        }));
      } catch (error) {
        console.error('Failed to fetch vehicle position data:', error);
      }
    }
  
    onMount(() => {
      fetchVehiclePosition(); // Initial fetch
      const interval = setInterval(fetchVehiclePosition, fetchInterval);
  
      // Cleanup the interval when the component is destroyed
      onDestroy(() => {
        clearInterval(interval);
      });
    });
</script>

<main>
    <h1>Hello World!</h1>
	{#if vehiclePositions.length > 0}
        <div>
            <h2>Vehicle Positions</h2>
            <ul>
            {#each vehiclePositions as {id, label, latitude, longitude}}
                <li>Vehicle {label} (ID: {id}) - Latitude: {latitude}, Longitude: {longitude}</li>
            {/each}
            </ul>
        </div>
    {:else}
        <p>Loading vehicle positions...</p>
    {/if}

    {#if routes.length > 0}
        <div>
            <h2>Routes</h2>
            <ul>
            {#each routes as {route_id: routeId, route_long_name: routeName}}
                <li>Route {routeName}, ID = {routeId}</li>
            {/each}
            </ul>
        </div>
    {:else}
        <p>Loading routes...</p>
    {/if}

    {#if routes.length > 0}
        <div>
            <h2>Routes</h2>
            <ul>
            {#each routes as {route_id: routeId, route_long_name: routeName}}
                <li>Route {routeName}, ID = {routeId}</li>
            {/each}
            </ul>
        </div>
    {:else}
        <p>Loading routes...</p>
    {/if}

    {#if routes.length > 0}
        <div>
            <h2>Routes</h2>
            <ul>
            {#each routes as {route_id: routeId, route_long_name: routeName}}
                <li>Route {routeName}, ID = {routeId}</li>
            {/each}
            </ul>
        </div>
    {:else}
        <p>Loading routes...</p>
    {/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
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