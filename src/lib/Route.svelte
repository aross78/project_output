<script>
    import { onMount } from 'svelte';
  
    let shuttles = [
      // You can add more shuttle data here
      { id: 'shuttle1', offset: 0 },
      { id: 'shuttle2', offset: 25 },
      { id: 'shuttle3', offset: 50 },
    ];
  
    onMount(() => {
      shuttles.forEach(shuttle => {
        const path = document.querySelector(`#path-${shuttle.id}`);
        const shuttleElement = document.querySelector(`#shuttle-${shuttle.id}`);
        const pathLength = path.getTotalLength();
  
        shuttleElement.style.strokeDasharray = pathLength;
        shuttleElement.style.strokeDashoffset = pathLength;
        
        // Animate the stroke-dashoffset to 0 over time to move the shuttle
        shuttleElement.animate(
          [
            { strokeDashoffset: pathLength },
            { strokeDashoffset: '0' }
          ],
          {
            duration: 5000, // Duration of the animation in milliseconds
            iterations: Infinity, // Repeat the animation infinitely
            easing: 'linear', // Use a linear easing function
          }
        );
      });
    });
  </script>
  
  <svg width="100%" height="100%" viewBox="0 0 100 100">
    <!-- Define the shuttle path -->
    <path id="path-shuttle1" d="M10,10 h80 v80 h-80 z" fill="none" stroke="blue"/>
    <path id="path-shuttle2" d="M10,10 h80 v80 h-80 z" fill="none" stroke="blue"/>
    <path id="path-shuttle3" d="M10,10 h80 v80 h-80 z" fill="none" stroke="blue"/>
    
    <!-- Create shuttle elements -->
    {#each shuttles as shuttle}
      <circle
        id="shuttle-{shuttle.id}"
        cx="0"
        cy="0"
        r="1"
        fill="green"
        stroke="black"
        stroke-width="0.1"
        style="offset-path: path('#path-{shuttle.id}'); offset-distance: {shuttle.offset}%"
      />
    {/each}
  </svg>