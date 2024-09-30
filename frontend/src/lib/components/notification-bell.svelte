<script lang="ts">
    import { API_URL } from '../../constants';
    import { getFormatTime} from '$lib/plannedActivity/activity';
    import Modal from '$lib/components/informative-modal.svelte';
    import { BellIcon } from 'svelte-feather-icons';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    type Notification = {
        plannedActivityID: number,
        date: string,
        name: string,
        isRead: boolean
    }

    let unreadNotificationCount : number = 0;
    let notifications : Notification[] = [];
    let dialog;

    function toggleDialog() {
      if (dialog.open) {
        dialog.close();
      } else {
        dialog.show();
      }
    }
    
    async function markAsRead(id: number) {
      const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
    }

    async function handleNotifClick(id: number, isRead: boolean) {
      dialog.close();
        
      await goto(`/plannedActivity?id=${id}`);

      if (!isRead) {
        await markAsRead(id);
        await loadNotifications();
      }
    }

    async function markAllAsRead() {
      for (const notification of notifications) {
        if (!notification.isRead) {
          await markAsRead(notification.plannedActivityID);
        } 
      }

      await loadNotifications();
    }

    function getFormattedDescription(dateString: string) {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      return `${formattedDate} at ${getFormatTime(date)}`;
    }
    
    async function loadNotifications() {

      const res = await fetch(`${API_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
        
      const json = await res.json();

      notifications = json.notifications;
      notifications.sort((a,b) => a.isRead - b.isRead);

      unreadNotificationCount = 0;
      notifications.forEach(notification => {
        if (!notification.isRead) unreadNotificationCount++;
      });
    }

    onMount(async () => {
      await loadNotifications();
    });

</script>


<div class="notification-container">
    <Modal info="Notifications" {unreadNotificationCount}>
        <button class="nav-item" on:click={toggleDialog}>
            <span class="notification">
                <BellIcon class="icon" />
            </span>
            {#if unreadNotificationCount > 0}
                <div class="notification-badge">{unreadNotificationCount}</div>
            {/if}
            <p>Notifications</p>
        </button>

    </Modal>

    <dialog class="dialog-left" bind:this={dialog}>
        {#if notifications.length === 0}
            <h1>No notifications</h1>
        {:else if unreadNotificationCount > 0}
            <button on:click={markAllAsRead} class="mark-all-button">Mark all as read</button>
        {/if}
        {#each notifications as notification}
        <button class = "notif-element-read" class:notif-element-unread={!notification.isRead} on:click={() => handleNotifClick(notification.plannedActivityID, notification.isRead)}>
            <h2>{notification.name}</h2>
            <p>{getFormattedDescription(notification.date)}</p>
        </button>
        {/each}
    </dialog>
</div>

<style>
    .nav-item {
        position: relative;
        padding: 1rem;
        color: var(--text);
        background-color: var(--bg-3);
        display: flex;
        border: none;
        font: inherit;
    }

    .nav-item:hover{
        cursor: pointer;
    }

    .notification-container {
        position: relative;
    }

    p {
        display: none;
    }

    .dialog-left {
        position: absolute;
        left: auto;
        border-color: var(--bg-3);
        border-radius: 5px;
    }

    .notif-element-read{
        border: 2px solid var(--bg-3);
        background-color: transparent;
        padding: 10px;
        margin-bottom: 2px;
        border-radius: 5px;
        width: 14vw;
        cursor: pointer;
        text-align: start;
        font: inherit;
    }

    .notif-element-read p{
        display: block;
    }

    .notif-element-read:hover{
        background-color: var(--bg-2);
    }

    .notif-element-unread{
        border: 2px solid var(--link);
    }
    
    span {
        max-height: 1.5rem;
    }

    .nav-item:hover > .notification {
        animation-name: vertical-wiggle;
        animation-duration: 0.5s;
    }

    .notification-badge {
        position: absolute;
        bottom: 5px;
        right: 5px;
        background-color: red;
        color: white;
        width: 1.2rem;
        height: 1.2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.90rem;
    }

    @media (max-width: 680px) {
        p {
            display: block;
            margin-left: 1rem;
        }
    }
</style>

