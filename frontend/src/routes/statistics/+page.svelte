<script lang='ts'>
  import { getISOFromDate, getDateFromISO } from '$lib/plannedActivity/activity';
  import { activityType } from '$lib/plannedActivity/activity.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import type { ActivityStats } from '$lib/types/activityStats.js';
  import Chart, { Chart as ChartType } from 'chart.js/auto';
  import { onDestroy, onMount } from 'svelte';
  import { ChevronLeftIcon, ChevronRightIcon } from 'svelte-feather-icons';


  export let data;

  let distanceChart: ChartType | null = null;
  let durationChart: ChartType | null = null;
  let amountChart: ChartType | null = null;

  type ActivityDetail = {
    distance: number;
    duration: number; // for graph display in minutes
    originalDuration: number; // holds the original duration in your base unit (seconds, minutes, etc.)
    amount: number;
  };


  type ProcessedStat = {
    week: string;
    activities: Record<string, ActivityDetail>;
  };

  type MonthSummary = {
    totalDistance: number;
    totalDuration: string; 
    totalAmount: number;
  };

	// Set today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date

	// Filters
  let dateParam: string | null;
  let typeParam: string | null;
  let dateFilter: Date;
  let currentMonth: string;
/* 
  let activitiesStats: ActivityStats[] = data.activitiesStats;

  // Reactive variables
  $: ({ activitiesStats } = data); */

  $: {
	  dateParam = $page.url.searchParams.get('date');
    typeParam = $page.url.searchParams.get('type');
	  dateFilter = dateParam ? getDateFromISO(dateParam) : today;
    currentMonth = currentPeriod();
  }
	
  const currentPeriod = () => {
    return  dateFilter.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
    });
  };

  const handleFilter = () => {
    // Binding value on select doesn't work on all browser. Use this instead
    const typeFilter =  (<HTMLInputElement>document.getElementById('type')).value;
	  goto(`?date=${getISOFromDate(dateFilter)}&type=${typeFilter}`);
  };

  function nextMonth() {
    dateFilter.setMonth(dateFilter.getMonth() + 1);
  }

  function prevMonth() {
    dateFilter.setMonth(dateFilter.getMonth() - 1);
  }

  let processedData: ProcessedStat[] = processActivities(data.activitiesStats);
  let monthSummary: MonthSummary = calculateMonthSummary(processedData);

  function processActivities(activities: ActivityStats[]): ProcessedStat[] {
    const weeksMap = new Map<string, ProcessedStat>();

    // Ensure activities array is not empty to avoid errors
    if (activities.length === 0) {
      return [];
    }

    // Parse dates correctly to find min and max dates
    const minDate = new Date(activities.reduce((min, a) => new Date(a.date) < min ? new Date(a.date) : min, new Date(activities[0].date)));
    const maxDate = new Date(activities.reduce((max, a) => new Date(a.date) > max ? new Date(a.date) : max, new Date(activities[0].date)));

    // Initialize all weeks within the range
    let currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      const weekNumber = `${getWeekNumber(currentDate)}`;
      weeksMap.set(weekNumber, {
        week: weekNumber,
        activities: {
          running: { distance: 0, duration: 0, originalDuration: 0, amount: 0 },
          biking: { distance: 0, duration: 0, originalDuration: 0, amount: 0 },
          walking: { distance: 0, duration: 0, originalDuration: 0, amount: 0 },
        },
      });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7)); // Move to the next week
    }

    // Process actual activity data
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const weekNumber = `${getWeekNumber(date)}`;
      const weekData = weeksMap.get(weekNumber) || {
        week: weekNumber,
        activities: {
          running: { distance: 0, duration: 0, originalDuration: 0, amount: 0 },
          biking: { distance: 0, duration: 0, originalDuration: 0, amount: 0 },
          walking: { distance: 0, duration: 0, originalDuration: 0, amount: 0 },
        },
      };

      weekData.activities[activity.type.toLowerCase()].distance += parseFloat(activity.distanceTotal);
      weekData.activities[activity.type.toLowerCase()].duration += Math.ceil(activity.durationTotal / 60);
      weekData.activities[activity.type.toLowerCase()].originalDuration += activity.durationTotal;
      weekData.activities[activity.type.toLowerCase()].amount += 1;

      weeksMap.set(weekNumber, weekData);
    });
    return Array.from(weeksMap.values());
  }


  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600); // Convert seconds to hours
    const minutesLeft = Math.floor((seconds % 3600) / 60); // Remaining minutes
    const secondsLeft = seconds % 60; // Remaining seconds

    return `${hours.toString().padStart(2, '0')}h${minutesLeft.toString().padStart(2, '0')}m${secondsLeft.toString().padStart(2, '0')}s`;
  }

  function calculateMonthSummary(processedStats: ProcessedStat[]): MonthSummary {
    let totalDistance = 0;
    let totalDuration = 0;
    let totalAmount = 0;

    for (const weekStats of processedStats) {
      for (const activity in weekStats.activities) {
        const details = weekStats.activities[activity];
        totalDistance += details.distance;
        totalDuration += details.originalDuration; // Accumulate the original duration in seconds
        totalAmount += details.amount;
      }
    }

    return {
      totalDistance,
      totalDuration: formatDuration(totalDuration),
      totalAmount,
    };
  }



  function getWeekNumber(date: Date) {
    const startOfTheYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfTheYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const weekNumber = Math.ceil(days / 7);
    return `Week ${weekNumber}`;
  }

  function getWeeksOfMonth(year: number, month: number): string[] {
    const weeks = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const weekStart = new Date(date);
      const weekEnd = new Date(date);
      weekEnd.setDate(weekEnd.getDate() + 6 - weekEnd.getDay());
      weeks.push(`${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`);
      date.setDate(date.getDate() + 7 - date.getDay());
    }
    return weeks;
  }

  function getResponsiveFontSize(canvas: HTMLCanvasElement): number {
    const width = canvas.offsetWidth;
    if (width > 1000) {
      return 14; // Large font for large displays
    } else if (width > 600) {
      return 12; // Medium font for medium displays
    } else {
      return 10; // Smaller font for small displays
    }
  }

  const createChart = (
    canvasId: string,
    label: string,
    valueKey: keyof ActivityDetail,
    chartTitle: string,
    unit: string,
    year: number,
    singularLabel: Record<string, string>,
    pluralLabel: Record<string, string>,
    weekLabels: string[],
  ): ChartType | null => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) {
      console.error(`Canvas with ID '${canvasId}' not found.`);
      return null;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error(`Could not get 2D context for canvas with ID '${canvasId}'.`);
      return null;
    }

    const responsiveFontSize = getResponsiveFontSize(canvas);

    // Get CSS variables
    const computedStyle = getComputedStyle(document.documentElement);

    // Assign CSS variable values to chart colors dynamically
    const chartColors = {
      running: {
        backgroundColor: computedStyle.getPropertyValue('--bg-chart-running-color').trim() || 'rgba(253, 99, 43, 0.5)',
        borderColor: computedStyle.getPropertyValue('--border-chart-running-color').trim() || 'rgba(253, 99, 43, 1)',
      },
      biking: {
        backgroundColor: computedStyle.getPropertyValue('--bg-chart-biking-color').trim() || 'rgba(114, 176, 249, 0.5)',
        borderColor: computedStyle.getPropertyValue('--border-chart-biking-color').trim() || 'rgba(114, 176, 249, 1)',
      },
      walking: {
        backgroundColor: computedStyle.getPropertyValue('--bg-chart-walking-color').trim() || 'rgba(195, 177, 225, 0.5)',
        borderColor: computedStyle.getPropertyValue('--border-chart-walking-color').trim() || 'rgba(195, 177, 225, 1)',
      },
    };

    const datasets = activityType.map(type => {
      const typeLower = type.toLowerCase() as keyof typeof chartColors;
      const colorSettings = chartColors[typeLower];
      const data = processedData.map(item => {
        const activity = item.activities[typeLower];
        return activity ? activity[valueKey] : 0;
      });

      return {
        label: type,
        data,
        backgroundColor: colorSettings.backgroundColor,
        borderColor: colorSettings.borderColor,
        borderWidth: 1,
      };
    });


    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weekLabels, // Use the full list of week labels
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chartTitle,
          },
          tooltip: {
            callbacks: {
              label(tooltipItem) {
                const label = tooltipItem.dataset.label || '';
                const value = tooltipItem.raw;
                let unitDisplay = '';
                if (value === 1) {
                  unitDisplay = singularLabel[label.toLowerCase()] || '';
                } else {
                  unitDisplay = pluralLabel[label.toLowerCase()] || '';
                }
                return `${label}: ${value} ${unitDisplay}${unit}`;
              },
            },
            bodyFont: {
              size: responsiveFontSize,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              autoSkip: false,  // Ensures no labels are skipped
              font: {
                size: responsiveFontSize - 2,
              },
            },
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: label,
              font: {
                size: responsiveFontSize,
              },
            },
            ticks: {
              font: {
                size: responsiveFontSize,
              },
            },
          },
        },
      },
    });
  };
 

  const updateCharts = () => {
    // Destroy the previous charts if they exist
    distanceChart?.destroy();
    durationChart?.destroy();
    amountChart?.destroy();

    const year = dateFilter.getFullYear();
    const month = dateFilter.getMonth();
    const weekLabels = getWeeksOfMonth(year, month);

    distanceChart = createChart(
      'distanceChart', 
      'Total Distance (km)', 
      'distance', 
      'Total distance for the month', 
      'km',
      year,
      {},
      {},
      weekLabels,
    );
    durationChart = createChart(
      'durationChart', 
      'Total Duration (minutes)', 
      'duration', 
      'Total duration for the month', 
      'minutes',
      year,
      {},
      {},
      weekLabels,
    );
    amountChart = createChart(
      'amountChart', 
      'Total Amount', 
      'amount', 
      'Total amount done for the month', 
      '',
      year,
      {
        running: 'run',
        biking: 'bike ride',
        walking: 'walk',
      }, 
      {
        running: 'runs',
        biking: 'bike rides',
        walking: 'walks',
      },
      weekLabels,
    );
  };

  onMount(() => {
    if (browser) {
      // Update charts when the component is mounted
      updateCharts();
    }
  });

  $: if (dateParam || typeParam) {
    if (browser) {
      // Update charts when the URL changes
      processedData = processActivities(data.activitiesStats); // Re-process data
      monthSummary = calculateMonthSummary(processedData);
      updateCharts(); // Update charts with new data
    }
  }

  onDestroy(() => {
    distanceChart?.destroy();
    durationChart?.destroy();
    amountChart?.destroy();
  });


</script>

<body class="">
	<article class="container">
		<h1>Statistics</h1>
    <!-- Start of filter block -->
		<div class="filters">
      <div class="filter">
				<label for="type">Type</label>
				<select on:change={handleFilter} id="type" name="type">
					<option value="All">All</option>
				  {#each activityType as type}
					  <option value={type} selected={type === typeParam}>{type}</option>
				  {/each} 
				</select>
			</div>
			<div class="filter">
				<button on:click={prevMonth} on:click={handleFilter} class="no-btn">
					<ChevronLeftIcon size="50"class="arrow" />
				</button>
        <p>{currentMonth}</p>
				<button on:click={nextMonth} on:click={handleFilter} class="no-btn">
					<ChevronRightIcon size="50" class="arrow" />
				</button>
			</div>
		</div>
    <!-- End of filter block -->
    <div class="container summaryContainer">
		<h2 class="summaryTitle">Summary</h2>
		<div class="summaryStatContainer">
			<div class="summaryStat">
				<p class="summaryStatTitle">Total activities</p>
				<p>{monthSummary.totalAmount}</p>
			</div>
			<div class="summaryStat">
				<p class="summaryStatTitle">Total distance</p>
				<p>{monthSummary.totalDistance} km</p>
			</div>
			<div class="summaryStat">
        <p class="summaryStatTitle">Total time</p>
				<p>{monthSummary.totalDuration}</p>
			</div>
    </div>
		</div>
		<div>
			<canvas id='distanceChart'/>
		</div>
    <div>
      <canvas id="durationChart" />
    </div>
    <div>
      <canvas id="amountChart" />
    </div>    
  </article>	
</body>

<style>
  /* Container can be deleted, only a style placeholder */
  .container {
    max-width: var(--container-max-width-lg);
    padding: var(--padding-lg);
    margin: auto;
    margin-top: var(--container-margin-lg);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
  }

  canvas {
    height: 400px;
  }

  h1 {
    text-align: center;
  }

  .summaryContainer {
    margin-bottom: 50px;
    max-width: 800px;
  }

  .summaryTitle {
    color: var(--link);
    text-align: center;
    font-size: var(--font-size-xxl);
  }

  .summaryStatContainer {
    padding-top: var(--padding-sm);
    padding-bottom: var(--padding-xxs);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .summaryStatTitle {
    font-weight: bold;
    font-size: var(--font-size-lg);
  }

  .summaryStat {
    display: flex;
    flex-direction: column;
  }

  .summaryStat p {
    text-align: center;
  }

  :global(.arrow) {
    color: var(--link);
  }

  .no-btn {
    background-color: rgba(255, 255, 255, 0);
    border: 0px;
    margin: 5px;
    cursor: pointer;
  }

  .no-btn:hover > :global(.arrow) {
    color: var(--link-hover);
  }

  .filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: var(--padding-xxs);
  }

  .filter {
    display: flex;
    justify-content: start;
    align-items: center;
    padding: var(--padding-xxs);
  }
  
  label {
    padding: var(--padding-xxs);
  }

  /* Small screens */
  @media (max-width: 600px) {
    .container {
      max-width: var(--container-max-width-sm);
      padding: var(--padding-sm);
      margin-top: var(--container-margin-sm);
    }

    .summaryStatContainer {
      grid-template-columns: repeat(1, 1fr);
    }

    .summaryTitle {
      font-size: var(--font-size-md);
    }

    .summaryStatTitle {
      font-size: var(--font-size-sm);
    }
  }

  /* Medium screens */
  @media (min-width: 601px) and (max-width: 1024px) {
    .container {
      max-width: var(--container-max-width-md);
      padding: var(--padding-md);
      margin-top: var(--container-margin-md);
    }

    .summaryStatContainer {
      grid-template-columns: repeat(2, 1fr);
    }

    .summaryTitle {
      font-size: var(--font-size-lg);
    }

    .summaryStatTitle {
      font-size: var(--font-size-md);
    }
  }

  /* Large screens */
  @media (min-width: 1025px) {
    .container {
      max-width: var(--container-max-width-lg);
      padding: var(--padding-lg);
      margin-top: var(--container-margin-lg);
    }

    .summaryTitle {
      font-size: var(--font-size-xxl);
    }

    .summaryStatTitle {
      font-size: var(--font-size-lg);
    }
  }
</style>

