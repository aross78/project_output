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
  
    // Function to calculate the x and y positions along the ellipse
    function calculatePosition(angle) {
      const radians = (angle * Math.PI) / 180;
      return {
        x: 100 + rx * Math.cos(radians),
        y: 100 + ry * Math.sin(radians),
      };
    }
  </script>
  
  <svg width="200" height="200" viewBox="0 0 200 200">
    <ellipse cx="100" cy="100" rx="90" ry="45" stroke="black" stroke-width="2" fill="transparent" />
    {#each cars as { id, position }}
      {@const { x, y } = calculatePosition(position)}
      <circle cx={x} cy={y} r="5" fill="red" />
    {/each}
  </svg>