<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/state';
    import { io } from "socket.io-client";
	import { onMount } from 'svelte';

    let channelId = $derived(page.params.channel);

    let { children } = $props();

    const ENDPOINT = 'http://localhost:3000';

    const socket = io(ENDPOINT);
	
    let lang = page.params.lang ? page.params.lang : "en";
    let channels: Array<string> = $state([]);
    let message: string = $state("");
    let messages: Array<string> = $state([]);
    let messages_un: Array<string> = $state([]);
    let messages_ch: Array<string> = $state([]);

    let username: string = $state("")
    let displayname: string = $state("")

	onMount(() => {
        username = localStorage?.getItem("username")
        displayname = localStorage?.getItem("displayname")
        messages = JSON.parse(localStorage.getItem("messages") || "[]")

        socket.emit("getChannels", (response) => {
            if (response.status !== "ok") {return}
            channels = response.channels;
        })
        refreshMessages
    });

    socket.on("new_msg", (un, msg, date) => {
        if (un === username) { return; }
        refreshMessages();
    })

    function sendMessage() {
        if (message.length === 0) { return; }
        if (!browser) { return; }
        socket.emit("msg", username, message, channelId);
        message = "";
        refreshMessages();
    }

    function refreshMessages() {
        if (!browser) { return; }
        socket.emit("getMessageHistory", (response) => {
            if (response.status !== "ok") {return}
            messages = response.messages;
            localStorage?.setItem("messages", JSON.stringify(messages));
            messages_un = response.usernames;
            messages_ch = response.channels;
        })
    }
</script>

<h2 class="text-center m-2.5">Welcome <strong>{username}</strong></h2>

{@render children()}

<div class="flex flex-row w-[85vw] h-[90vh] m-auto">
    <!--Channel list--> 
    <div class="flex flex-col w-48">
        <h3 class="text-xl font-medium -ml-5">Channels:</h3>
        {#each channels as channel}
            <a href={"/" + lang + "/chat/" + channel} class="text-blue-500 underline active:text-blue-700">{channel}</a>
        {/each}
    </div>
    <!--Chat Box-->
    <div class="flex flex-col w-full">
        {#if channelId}
            <p class="text-center font-bold text-lg">{channelId}</p>
            {#each messages as msg, i}
                {#if messages_ch[i] === channelId}
                    <div class={messages_un[i] === username ? "text-right flex flex-col w-full p-0.5 m-0.5" : "flex flex-col w-full p-0.5 m-0.5"}>
                        <p class="text-gray-500 font-bold text-sm">{messages_un[i]}</p>
                        <p class="text-base">{msg}</p>
                    </div>
                {/if}
            {/each}
            <form onsubmit={sendMessage} class="m-auto">
                <input minlength="1" maxlength="128" type="text" bind:value={message} class="bg-amber-50 w-75">
                <button>Send<!--Replace with send icon--></button>
            </form>
        {:else}
        <p>Choose a channel!</p>
        {/if}
    </div>
</div>