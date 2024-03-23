<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
crossorigin=""></script>

<script>
    import { onMount, onDestroy } from 'svelte';
  
    let vehiclePositions = [];
    const fetchInterval = 2000; // Fetch data every 5000 ms (5 seconds)
  
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