<script>
  import routesInfoData from "../static/route_info.json";
  import tripToRouteId from "../static/trip_to_route_id.json";
  import tripToRouteName from "../static/trip_to_route_name.json";
  import { onMount, onDestroy } from "svelte";
  import L from "leaflet";

  let routesInfo = [...routesInfoData];
  let vehiclePositions = [];
  let activeRoutes = [];
  let inactiveRoutes = [];
  let map;
  let selectedStop = {};
  let alarmDuration = {};
  let alarmSetupVisible = {};
  let alarmActive = {};
  const fetchInterval = 2000;

  // Dummy cars for sake of demo
  let cars = [
    { id: 1, position: 0, lat: 42.3729, long: -71.1171 },
    { id: 2, position: 180, lat: 42.3729, long: -71.1171 }, // Starting position in degrees around the ellipse
  ];

  onMount(() => {
    fetchVehiclePosition(); 
    const interval = setInterval(async () => {
      fetchVehiclePosition().then(getNextStops());
      updateActiveRoutes();
      cars = cars.map((car) => ({
        ...car,
        position: (car.position + 5) % 360, // Move each car 5 degrees every second
      }));
    }, fetchInterval);

    // Cleanup the interval when the component is destroyed
    onDestroy(() => {
      clearInterval(interval);
    });
  });

  // Loads all vehicles active on API into an array of more-workable structs
  async function fetchVehiclePosition() {
    try {
      const response = await fetch(
        "https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json",
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      vehiclePositions = data.entity.map((entity) => ({
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
      console.error("Failed to fetch vehicle position data:", error);
    }
  }

  // Extends shuttle structs already loaded from Positions API call with next 
  // stop info from TripsUpdates API Call 
  async function getNextStops() {
    const API_URL =
      "https://passio3.com/harvard/passioTransit/gtfs/realtime/tripUpdates.json";

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const { entity: tripUpdates } = await response.json();

      // For each vehicle, find its matching tripUpdate and determine the next stop
      // and seconds until arrival
      const vehiclesWithNextStop = vehiclePositions.map((vehicle) => {
        const vehicleUpdate = tripUpdates.find(
          (update) => update.id === vehicle.id,
        );
        const nextStop = vehicleUpdate.trip_update.stop_time_update[0];
        const secondsUntilArrival =
          nextStop.arrival.time - Math.floor(Date.now() / 1000);

        return { ...vehicle, nextStop: nextStop.stop_id, secondsUntilArrival };
      });

      vehiclePositions = vehiclesWithNextStop;
    } catch (error) {
      console.error("Failed to fetch or process trip updates:", error);
    }
  }

  // For each route in the static JSON, calcuates how far apart stops on the
  // route should be as % of time it takes to travel between stops for one
  // lap around the route
  function calculateStopPositions(schedule, stops) {
    const totalSeconds = schedule.reduce((acc, curr) => acc + curr[2], 0);
    let cumulativeSeconds = 0;
    return schedule.map(([_, destination, seconds], i) => {
      cumulativeSeconds += seconds;
      const progress = totalSeconds > 0 ? cumulativeSeconds / totalSeconds : 0;
      return {
        cx: 100 + 90 * Math.cos(2 * Math.PI * progress),
        cy: 100 + 45 * Math.sin(2 * Math.PI * progress),
        label: `${stops[destination]}`,
      };
    });
  }

  // Maintains separate list of which routes have active shuttles to make
  // rendering easier
  async function updateActiveRoutes() {
    activeRoutes = [];
    inactiveRoutes = [];

    routesInfo.forEach((route) => {
      // Check if any of the route's trip_ids match a trip in vehiclePositions
      const isActive = route.trip_ids.some((tripId) =>
        vehiclePositions.some((vehicle) => vehicle.trip === tripId),
      );

      if (isActive) {
        // If the route is active, add it to the activeRoutes list
        activeRoutes.push(route);
      } else {
        // If the route is inactive, add it to the inactiveRoutes list
        inactiveRoutes.push(route);
      }
    });
  }

  // For shuttle positions around ellipse
  function calculatePosition(angle) {
    const radians = (angle * Math.PI) / 180;
    return {
      x: 100 + 90 * Math.cos(radians) - 5,
      y: 100 + 45 * Math.sin(radians) - 5,
    };
  }

  // Essence of the magnifying glass feature
  function createMap(container, lat, lng) {
    let m = L.map(container, { preferCanvas: true }).setView([lat, lng], 14);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 15,
      },
    ).addTo(m);

    return m;
  }

  function centerMapOnShuttle(lat, lng) {
    map = createMap("map", lat, lng);
    marker = L.marker([lat, lng]).addTo(map);
  }

  function removeMap() {
    map.remove();
    map = null;
  }

  function toggleAlarmSetup(routeId) {
    if (alarmSetupVisible[routeId] === undefined) {
      alarmSetupVisible[routeId] = true;
    } else {
      alarmSetupVisible[routeId] = !alarmSetupVisible[routeId];
    }
  }

  function submitAlarm(routeId) {
    alarmActive[routeId] = true;
    toggleAlarmSetup(routeId);
  }
</script>

<!-- Render ellipses only for active routes -->
{#each activeRoutes as { route, route_name, stops, schedule, color }}
  <div>
    <h2 style="color:white;">{route_name}</h2>
    <svg width="900" height="600" viewBox="0 0 200 200">
      <ellipse
        cx="100"
        cy="100"
        rx="90"
        ry="45"
        stroke={color}
        stroke-width="2"
        fill="transparent"
      />
      {#each calculateStopPositions(schedule, stops) as { cx, cy, label }}
        <circle {cx} {cy} r="3" fill="white" stroke={color} />
        <text x={cx} y={cy + 7} font-size="5" text-anchor="middle" fill="white"
          >{label}</text
        >
      {/each}

      <!-- For sake of demo, only want one shuttle on 1636'er -->
      {#if route_name != "1636'er"}
        {#each cars as { _, position, lat, long }}
          {@const { x, y } = calculatePosition(position)}
          <image
            href="/images/shuttle_front.png"
            {x}
            {y}
            height="10"
            on:mouseenter={() => centerMapOnShuttle(lat, long)}
            on:mouseleave={() => removeMap()}
          />
        {/each}
      {:else}
        {@const { x, y } = calculatePosition(cars[0].position + 20)}
        <image
          href="/images/shuttle_front.png"
          {x}
          {y}
          height="10"
          on:mouseenter={() => centerMapOnShuttle(cars[0].lat, cars[0].long)}
          on:mouseleave={() => removeMap()}
        />
      {/if}
    </svg>
    <!-- Add alarm feature/logic for each route -->
    <h2 style="color:white;" id="routeName">
      {route_name}
      <button on:click={() => toggleAlarmSetup(route)}>Set New Alarm</button>
      {#if alarmActive[route]}<p>Alarm active!</p>{/if}
    </h2>
  </div>
  {#if alarmSetupVisible[route]}
    <div class="alarm-setup">
      <select bind:value={selectedStop[route]}>
        {#each Object.entries(stops) as [stopId, stopName]}
          <option value={stopId}>{stopName}</option>
        {/each}
      </select>
      <div>
        <label>
          <input type="radio" bind:group={alarmDuration[route]} value="1" /> 1 minute
        </label>
        <label>
          <input type="radio" bind:group={alarmDuration[route]} value="3" /> 3 minutes
        </label>
        <label>
          <input type="radio" bind:group={alarmDuration[route]} value="5" /> 5 minutes
        </label>
      </div>
      <button on:click={() => submitAlarm(route)}>Submit Alarm</button>
    </div>
  {/if}
{/each}

<!-- Inactive routes mentioned at bottom -->
<h3 style="color:white;">Inactive Routes:</h3>
{#each inactiveRoutes as { _, route_name }}
  <t style="color:white;"> {route_name},&nbsp;</t>
{/each}

<div id="map" style="height: 200px;"></div>
