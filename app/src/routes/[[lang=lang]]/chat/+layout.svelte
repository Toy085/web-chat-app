<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/state';
    import { io } from "socket.io-client";
	import { onMount } from 'svelte';
    import sendIcon from "#lib/assets/send_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"

    import clover from "#lib/assets/music/Clover.mp3"
    let musicList: Array<string> = [clover]

    let channelId = $derived(page.params.channel);

    let { children } = $props();

    const ENDPOINT = 'http://localhost:3000';

    const socket = io(ENDPOINT);

    $effect(() => {
        if (channelId) { socket.emit("joinchannel", channelId); }
        refreshMessages();
    });
	
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

        const Music = new Audio(musicList[0]);

        socket.emit("getChannels", (response) => {
            if (response.status !== "ok") { return; }
            channels = response.channels;
        })

        refreshMessages();

        socket.on('playmusic', (un, mID:  number) => {
            Music.src = musicList[mID];
            Music.volume = 1.0;
            Music.currentTime = 0;
            Music.play();
        });
        socket.on('stopmusic', (un) => {
            Music.currentTime = 0;
            Music.pause();
        })
    });

    socket.on("new_msg", (un, msg, date) => {
        if (un === username) { return; }
        refreshMessages();
    })

    function sendMessage() {
        message = message.trim();
        if (message.length === 0) { return; }
        if (!browser) { return; }
        if (message.at(0) === "/") {
            const token = getCookie("token");
            socket.emit("cmd", token, message, channelId);
            message = "";
            return;
        }
        const token = getCookie("token");
        socket.emit("msg", token, message, channelId);
        message = "";
        refreshMessages();
    }

    function refreshMessages() {
        if (!browser) { return; }
        socket.emit("getMessageHistory", (response) => {
            if (response.status !== "ok") { return; }
            messages = response.messages;
            localStorage?.setItem("messages", JSON.stringify(messages));
            messages_un = response.usernames;
            messages_ch = response.channels;
            let chatBox = document.getElementById("chatBox");
            setTimeout(() => {
                if (chatBox) { chatBox.scrollTop = chatBox.scrollHeight; }
            }, 200);
        })
    }

    function getCookie(cname: string) {
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        let name = cname + "=";
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
</script>

<h2 class="text-center m-2.5">Welcome <strong>{username}</strong></h2>

{@render children()}

<div class="flex flex-row w-[85vw] h-[80vh] m-auto">
    <!--Channel list--> 
    <div class="flex flex-col w-64 gap-2 p-5">
        <h3 class="text-xl font-medium -ml-5">Channels:</h3>
        {#each channels as channel}
            <a href={"/" + lang + "/chat/" + channel} class="text-blue-500 underline active:text-blue-700">{channel}</a>
        {/each}
    </div>
    <!--Chat Box-->
    <div class="flex flex-col w-full">
        {#if channelId}
            <p class="text-center font-bold text-lg">{channelId}</p>
            <div id="chatBox" class="flex flex-col overflow-y-scroll scrollbar-thumb-rose-300 scrollbar-track-mauve-200/25 overflow-x-hidden max-h-full p-7.5 bg-amber-50/25 rounded-3xl">
            {#each messages as msg, i}
                {#if messages_ch[i] === channelId}
                    <div class={messages_un[i] === username ? "text-right flex flex-col w-full p-0.5 m-0.5" : "flex flex-col w-full p-0.5 m-0.5"}>
                        <p class="text-gray-500 font-bold text-sm">{messages_un[i]}</p>
                        <p class="text-base">{msg}</p>
                    </div>
                {/if}
            {/each}
            </div>
            <form onsubmit={sendMessage} class="mt-2 m-auto">
                <input minlength="1" maxlength="5000" type="text" bind:value={message} class="bg-amber-50 rounded p-0.5 w-150 text-2xl h-auto drop-shadow">
                <button><img src={sendIcon} alt="send"></button>
            </form>
        {:else}
        <p>Choose a channel!</p>
        {/if}
    </div>
</div>