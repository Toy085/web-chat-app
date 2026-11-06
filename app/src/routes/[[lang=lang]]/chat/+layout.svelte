<script lang="ts">
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
    messages.push("Hello World!")

    let username: string = $state("")
    let displayname: string = $state("")

	onMount(() => {
        username = localStorage?.getItem("username")
        displayname = localStorage?.getItem("displayname")
        messages = JSON.parse(localStorage.getItem("messages"))

        socket.emit("getChannels", (response) => {
            if (response.status !== "ok") {return}
            channels = response.channels;
        })
    });

    socket.on("new_msg", (un, msg, date) => {
        if (un === username) { return; }
        messages.push(msg);
        localStorage.setItem("messages", JSON.stringify(messages));
    })

    function sendMessage(msg: string) {
        if (msg.length === 0) { return; }
        messages.push(msg);
        localStorage.setItem("messages", JSON.stringify(messages));
        socket.emit("msg", username, msg);
        message = "";
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
        {#each messages as msg}
            <p>{msg}</p>
        {/each}
            <form onsubmit={sendMessage(message)}>
                <input minlength="1" maxlength="128" type="text" bind:value={message} class="bg-amber-50">
                <button>Send<!--Replace with send icon--></button>
            </form>
        {/if}
    </div>
</div>