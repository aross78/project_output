<script>
    import routesInfo from '../static/route_info.json';

    let cars = [
      { id: 1, position: 0 },
      { id: 2, position: 180 }, // Position in degrees around the ellipse
    ];
    
    // Ellipse radius
    const rx = 90; // x radius
    const ry = 45; // y radius
  
    setInterval(() => {
      cars = cars.map(car => ({
        ...car,
        position: (car.position + 5) % 360, // Move each car 5 degrees every second
      }));
    }, 1000);

    function calculateStopPositions(schedule, stops) {
    const totalSeconds = schedule.reduce((acc, curr) => acc + curr[2], 0);
    let cumulativeSeconds = 0;
    return schedule.map(([origin, destination, seconds], index) => {
      cumulativeSeconds += seconds;
      const progress = totalSeconds > 0 ? cumulativeSeconds / totalSeconds : 0;
      return {
        cx: 100 + 90 * Math.cos(2 * Math.PI * progress),
        cy: 100 + 45 * Math.sin(2 * Math.PI * progress),
        label: `${stops[destination]}`,
      };
    });
  }
  
    // Function to calculate the x and y positions along the ellipse
    function calculatePosition(angle) {
      const radians = (angle * Math.PI) / 180;
      return {
        x: 100 + rx * Math.cos(radians),
        y: 100 + ry * Math.sin(radians),
      };
    }
  </script>
  
  {#each routesInfo as { route_name, stops, schedule }}
  <div>
    <svg width="400" height="200" viewBox="0 0 200 200">
      <ellipse cx="100" cy="100" rx="90" ry="45" stroke="black" stroke-width="2" fill="transparent" />
      {#each calculateStopPositions(schedule, stops) as { cx, cy, label }}
        <circle cx={cx} cy={cy} r="3" fill="none" stroke="red" />
        <text x={cx} y={cy - 5} font-size="5" text-anchor="middle">{label}</text>
      {/each}
    </svg>
    <p>{route_name}</p>
  </div>
{/each}