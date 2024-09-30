<script lang="ts">
	import { getFormatDate, getFormatDuration, getFormatTime, getLastMonday, getISOFromDate, getDateFromISO } from '$lib/plannedActivity/activity';
	import { activityType } from '$lib/plannedActivity/activity.js';
  import { goto } from '$app/navigation';
	import { page } from '$app/stores';
  import type { PlannedActivity } from '$lib/types/plannedActivity.js';
  import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from 'svelte-feather-icons';

  export let data;

  type Calendar = {
	  day: Date, 
	  activities: PlannedActivity[]
  }[]

	// Set today's date
  const lastMonday = getLastMonday(new Date());
  lastMonday.setHours(0, 0, 0, 0); // Normalize today's date

	// Filters
  let dateParam: string | null;
  let typeParam: string | null;
  let dateFilter: Date;

  let daysWithActivities: Calendar;

  // Reactive variables
  $: ({ plannedActivities } = data);
  $: {
    typeParam = $page.url.searchParams.get('type');
	  dateParam = $page.url.searchParams.get('from');
	  dateFilter = dateParam ? getDateFromISO(dateParam) : lastMonday;
	  daysWithActivities = getDaysWithActivities();
  }
	
  const handleFilter = () => {
    // Binding value on select doesn't work on all browser. Use this instead
    const typeFilter =  (<HTMLInputElement>document.getElementById('type')).value;
	  goto(`?from=${getISOFromDate(dateFilter)}&type=${typeFilter}`);
  };

  const handleActivityClick = (pActivity: PlannedActivity) => {
    if (pActivity.activity_id) {
      // When page is created, redirect to activity page using ID
      goto('/activity');
      return;
    }
    goto(`/plannedActivity?id=${pActivity.id}`);
  };

  function isCompleted(pActivity: PlannedActivity) {
    return pActivity.activity_id !== null;
  }
  
  function addDaysToDate(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function nextWeek() {
    dateFilter = getLastMonday(addDaysToDate(dateFilter, 7));
  }

  function prevWeek() {
    dateFilter = getLastMonday(addDaysToDate(dateFilter, -7));
  }

  // Preparing activities for the next 7 days
  function getDaysWithActivities(): Calendar {
    return Array.from({ length: 7 }).map((_, index) => {
      const day = addDaysToDate(dateFilter, index);
      const activitiesForDay = plannedActivities.filter((activity) => {
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === day.getTime();
      });
      return { day, activities: activitiesForDay };
    });
  }
</script>

<body class="planned-activities">
	<article class="planning-container">
		<h1>Planning this week</h1>
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
        <div class="filter-date">
          <button on:click={prevWeek} on:click={handleFilter} class="no-btn">
              <ChevronLeftIcon size="50" class="arrow" />
          </button>
          <p>{dateFilter.toLocaleDateString()}</p>
          <button on:click={nextWeek} on:click={handleFilter} class="no-btn">
            <ChevronRightIcon size="50" class="arrow" />
          </button>
        </div>
			</div>
		</div>
		{#await plannedActivities}
		  <!-- Make a pretty loader -->
			<h2>Loading...</h2>
		{:then}
      {#if data.error}
          <p class="danger">{data.error}</p>
      {/if}
			{#each daysWithActivities as { day, activities }}
				{#if activities.length > 0}
					{#each activities as activity}
						<div class="activity-card">
              <div>
                <p class="activity-date">{getFormatDate(activity.date)} - {getFormatTime(activity.date)}</p>
							  <p class="activity-title">{activity.name}</p>
                {#if activity.comment}
								  <p class="activity-comment">{activity.comment}</p>
							  {/if}
              </div>
              <div>
                <div>
                  {#if isCompleted(activity)}
                    <div class="activity-done">
                      <CheckCircleIcon class="check"/>
                    </div>
                  {/if}
                  <button class="view-btn" on:click={() => handleActivityClick(activity)}>
                    Details
                  </button>
                </div>
                <p class="activity-duration">{getFormatDuration(activity.duration)}</p>
              </div>
						</div>
					{/each}
				{:else}
					<div class="no-activity-card">
						<div class="activity-date">{getFormatDate(day.toISOString())}</div>
						<div class="no-activity-title">No activity planned today.</div>
					</div>
				{/if}
			{/each}
			<a href="/plannedActivities/new" class="new-activity-button">Plan New Activity</a>
		{:catch error}
			<p>{error.message}</p>
		{/await}
	</article>
</body>

<style>
  /* default style */
  :root {
    /* planning-container */
    --planning-container-margin-top: var(--container-margin-lg);
    --planning-container-max-width: var(--container-max-width-lg);
    --planning-container-padding: var(--container-padding-lg);

    /* activity general */
    --activity-color: var(--text-button-secondary);
    --font-weight: bold;

    /* activity-card */
    --activity-card-height: 70px;
    --activity-card-margin-bottom: 0.5rem;
    --activity-card-max-height: 100px;
    --activity-card-padding-top: 20px;
    --activity-card-padding: 10px;
    --activity-card-width: 90%;

    /* activity-title */
    --activity-title-font-size: var(--font-size-lg);

    /* activity-date */
    --activity-date-font-size: var(--font-size-xl);

    /* activity-duration & activity-comment*/
    --activity-comment-color: var(--text-button-secondary);
    --activity-comment-font-size: var(--font-size-md);

    /* no-activity-card */
    --no-activity-card-background-color:var(--bg-empty-button);
    --no-activity-card-height: auto;
    --no-activity-card-margin-bottom: 0.4rem;
    --no-activity-card-max-height: 80px;
    --no-activity-card-padding-top: var(--padding-md);
    --no-activity-card-padding: var(--padding-sm);
    --no-activity-card-width: 90%;
  }

  @media (max-width: 600px) {
    /* Small screens */
    .planning-container {
      --planning-container-margin-top: var(--container-margin-sm);
      --planning-container-max-width: var(--container-max-width-sm);
      --planning-container-padding: var(--container-padding-sm);
    }

    .activity-card {
      --activity-card-height: auto;
      --activity-card-margin-bottom: 0.2rem;
      --activity-card-max-height: 60px;
      --activity-card-padding-top: var(--padding-sm);
      --activity-card-padding: var(--padding-xxs);
      --activity-card-width: 90%;
    }

    .activity-title {
      --activity-title-font-size: var(--font-size-xs);
    }

    .activity-date {
      --activity-date-font-size: var(--font-size-sm);
    }

    .activity-duration,
    .activity-comment {
      --activity-comment-font-size: var(--font-size-xxs);
    }

    .no-activity-card {
      --no-activity-card-height: auto;
      --no-activity-card-margin-bottom: 0.2rem;
      --no-activity-card-max-height: 60px;
      --no-activity-card-padding-top: var(--padding-sm);
      --no-activity-card-padding: var(--padding-xxs);
      --no-activity-card-width: 90%;
    }
  }

  @media (min-width: 601px) and (max-width: 1024px) {
    /* Medium screens */
    .planning-container {
      --planning-container-margin-top: var(--container-margin-md);
      --planning-container-max-width: var(--container-max-width-md);
      --planning-container-padding: var(--container-padding-md);
    }

    .activity-card {
      --activity-card-height: auto;
      --activity-card-margin-bottom: 0.4rem;
      --activity-card-max-height: 80px;
      --activity-card-padding-top: var(--padding-md);
      --activity-card-padding: var(--padding-sm);
      --activity-card-width: 90%;
    }

    .activity-title {
      --activity-title-font-size: var(--font-size-md);
    }

    .activity-duration,
    .activity-comment {
      --activity-comment-font-size: var(--font-size-xs);
    }

    .no-activity-card {
      --no-activity-card-height: auto;
      --no-activity-card-margin-bottom: 0.4rem;
      --no-activity-card-max-height: 80px;
      --no-activity-card-padding-top: var(--padding-md);
      --no-activity-card-padding: var(--padding-sm);
      --no-activity-card-width: 90%;
    }
  }
  .planning-container {
    align-items: center;
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    margin: auto;
    max-height: calc(90vh - 60px);
    max-width: var(--planning-container-max-width);
    overflow-y: auto;
    padding: var(--planning-container-padding);
  }

  .activity-card {
    height: var(--activity-card-height);
    margin-bottom: var(--activity-card-margin-bottom);
    max-height: var(--activity-card-max-height);
    padding-top: var(--activity-card-padding-top);
    padding: var(--activity-card-padding);
    width: var(--activity-card-width);
    display:flex;
    justify-content: space-between;
  }

  .activity-card:nth-of-type(odd) {
    background: var(--bg-primary-button);
  }

  .activity-card:nth-of-type(even) {
    background: var(--secondary-color);
  }

  .activity-title {
    color: var(--activity-color);
    font-size: var(--activity-title-font-size);
    font-weight: var(--font-weight);
  }

  .activity-date {
    font-size: var(--activity-date-font-size);
    font-weight: var(--font-weight);
    margin-bottom: 0.25rem;
    color: var(--activity-comment-color);
  }

  .activity-duration {
    color: var(--activity-comment-color);
    font-size: var(--activity-comment-font-size);
    text-align: right;
  }

  .activity-comment {
    color: var(--activity-comment-color);
    font-size: var(--activity-comment-font-size);
  }

  .activity-done {
      display: inline-block;
      padding-right: var(--padding-sm);
    }
  :global(.check) {
    color: var(--text-button-secondary);
  }

  .no-activity-card {
    background-color: var(--no-activity-card-background-color);
    height: var(--no-activity-card-height);
    margin-bottom: var(--no-activity-card-margin-bottom);
    max-height: var(--no-activity-card-max-height);
    padding-top: var(--no-activity-card-padding-top);
    padding: var(--no-activity-card-padding);
    width: var(--no-activity-card-width);
  }

  .new-activity-button {
    background-color: var(--bg-primary-button);
    border-radius: 4px;
    color: var(--text-button-secondary);
    cursor: pointer;
    display: inline-block;
    font-size: var(--font-size-md);
    margin: 20px;
    padding: var(--padding-sm) var(--padding-md);
    text-decoration: none;
  }

  .new-activity-button:hover {
    background-color: color-mix(in srgb, var(--bg-primary-button), #000 15%);
  }

	:global(.arrow) {
		color: var(--link);
	}

	.no-btn {
		background-color: rgba(255,255,255,0);
		border: 0px;
		margin: 5px;
		cursor: pointer;
	}

	.no-btn:hover :global(.arrow) {
    color: var(--link-hover);
	}

	.view-btn {
    float: right;
    padding: var(--padding-xxs) var(--padding-xs);
    margin-bottom: 5px;
    background-color: #555;
    color: var(--text-button);
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

	.filters {
		display: flex;
    justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.filter {
		display:block;
	}

  .filter-date {
		display: flex;
    justify-content: space-between;
		align-items: center;
		padding: var(--padding-xxs);
	}

  article {
    font-family: var(--font-family);
  }

  h1 {
    margin: 10px;
  }
</style>
