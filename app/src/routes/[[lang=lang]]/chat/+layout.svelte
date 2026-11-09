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

<h2 class="text-center font-bold m-2.5">Welcome {username}</h2>

{@render children()}

<div class="flex flex-row w-[85vw] h-[90vh] m-auto">
    <!--Channel list--> 
    <div class="flex flex-col">
        <h3 class="text-xl font-medium -ml-5">Channels:</h3>
        {#each channels as channel}
            <a href={"/" + lang + "/chat/" + channel} class="text-blue-500 underline active:text-blue-700">{channel}</a>
        {/each}
    </div>
    <!--Chat Box-->
    <div class="flex flex-col">
        {#if channelId}
            <p>Current channel: {channelId}</p>
        {#each messages as msg, i}
            {#if messages_ch[i] === channelId}
                <div>
                    <p>{messages_un[i]}</p>
                    <p>{msg}</p>
                </div>
            {/if}
        {/each}
            <form onsubmit={sendMessage}>
                <input minlength="1" maxlength="128" type="text" bind:value={message} class="bg-amber-50">
                <button>Send<!--Replace with send icon--></button>
            </form>
        {/if}
    </div>
</div>