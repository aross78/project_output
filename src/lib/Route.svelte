<script>
    import routesInfoData from '../static/route_info.json';
    import tripToRouteId from '../static/trip_to_route_id.json';
    import tripToRouteName from '../static/trip_to_route_name.json';
    import { onMount, onDestroy } from 'svelte';
  
    let routesInfo = [...routesInfoData];
    let vehiclePositions = [];
    let activeRoutes = [];
    const fetchInterval = 2000; 

    onMount(() => {
      fetchVehiclePosition(); // Initial fetch
      const interval = setInterval(async () => {
        fetchVehiclePosition().then(getNextStops());
        updateActiveRoutes();
      }, fetchInterval);
  
      // Cleanup the interval when the component is destroyed
      onDestroy(() => {
        clearInterval(interval);
      });
    });
  
    async function fetchVehiclePosition() {
      try {
        const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        vehiclePositions = data.entity.map(entity => ({
          id: entity.id,
          v_id: entity.vehicle.vehicle.id,
          label: entity.vehicle.vehicle.label,
          latitude: entity.vehicle.position.latitude,
          longitude: entity.vehicle.position.longitude,
          trip: parseInt(entity.vehicle.trip.trip_id, 10),
          v_route_id: tripToRouteId[entity.vehicle.trip.trip_id],
          v_route_name: tripToRouteName[entity.vehicle.trip.trip_id],
        }));
      } catch (error) {
        console.error('Failed to fetch vehicle position data:', error);
      }
    }

async function getNextStops() {
    const API_URL = 'https://passio3.com/harvard/passioTransit/gtfs/realtime/tripUpdates.json';

    try {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const { entity: tripUpdates } = await response.json();

    // For each vehicle, find its matching tripUpdate and determine the next stop
    const vehiclesWithNextStop = vehiclePositions.map(vehicle => {
      const vehicleUpdate = tripUpdates.find(update => update.id === vehicle.id);
      const nextStop = vehicleUpdate.trip_update.stop_time_update[0];
      const secondsUntilArrival = nextStop.arrival.time - Math.floor(Date.now() / 1000);

        return { ...vehicle, nextStop: nextStop.stop_id, secondsUntilArrival };
    });

    vehiclePositions = vehiclesWithNextStop;
    } catch (error) {
    console.error('Failed to fetch or process trip updates:', error);
    }
}
  
    function calculateStopPositions(schedule, stops) {
    const totalSeconds = schedule.reduce((acc, curr) => acc + curr[2], 0);
    let cumulativeSeconds = 0;
    return schedule.map(([_, destination, seconds], index) => {
      cumulativeSeconds += seconds;
      const progress = totalSeconds > 0 ? cumulativeSeconds / totalSeconds : 0;
      return {
        cx: 100 + 90 * Math.cos(2 * Math.PI * progress),
        cy: 100 + 45 * Math.sin(2 * Math.PI * progress),
        label: `${stops[destination]}`,
      };
    });
  }

  async function updateActiveRoutes(){
    activeRoutes = routesInfo.filter(route => 
      route.trip_ids.some(tripId => vehiclePositions.some(vehicle => vehicle.trip === tripId))
    );
  }
  </script>

{#each activeRoutes as { route, route_name, stops, schedule, color, trip_ids }}
  <p>{route_name}</p>
{/each}

{#each vehiclePositions as {id, label, latitude, longitude, trip, nextStop, v_route_name, secondsUntilArrival}}
        <li>Vehicle: {v_route_name} next stop: {nextStop} in {secondsUntilArrival}</li>
{/each}
 
{#if vehiclePositions.length > 0}
  <div>
    <h2>Vehicle Positions</h2>
    <ul>
      {#each vehiclePositions as {id, label, latitude, longitude, trip}}
        <li>Vehicle {label} (ID: {id}) - Latitude: {latitude}, Longitude: {longitude} Trip: {trip}</li>
      {/each}
    </ul>
  </div>
{:else}
  <p>Loading vehicle positions...</p>
{/if}

{#each activeRoutes as { route, route_name, stops, schedule, color, trip_ids }}
  <div>
    <svg width="900" height="600" viewBox="0 0 200 200">
      <ellipse cx="100" cy="100" rx="90" ry="45" stroke={color} stroke-width="2" fill="transparent" />
      {#each calculateStopPositions(schedule, stops) as { cx, cy, label }}
        <circle cx={cx} cy={cy} r="3" fill="none" stroke={color} />
        <text x={cx} y={cy + 7} font-size="5" text-anchor="middle" fill="white">{label}</text>
      {/each}
    </svg>
    {#each vehiclePositions as { v_route_name }}
        {#if v_route_name == route_name}
            <p>One active shuttle on {route_name}</p>
        {/if}
    {/each}
    <p>{route_name}</p>
  </div>

{/each}


