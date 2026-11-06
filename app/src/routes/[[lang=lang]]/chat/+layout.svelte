<script lang="ts">
    import { page } from '$app/state';
    import { io } from "socket.io-client";
    const ENDPOINT = 'http://localhost:3000';

    const socket = io(ENDPOINT);

	let { children } = $props();
    let lang = page.params.lang ? page.params.lang : "en";
    let channels: Array<string> = $state([]);

    let username: string = $state(localStorage.getItem("username"))
    let displayname: string = $state(localStorage.getItem("displayname"))

    channels.push("minecraft")
    channels.push("T-matte")
    channels.push("General")
    channels.push("Kasane Teto Fan Club")
    channels.push("Lorem Ipsum")
    channels.push("({[minecraft]})")
</script>

<h2 class="text-center font-bold m-2.5">Welcome {username}</h2>

{@render children()}

<div class="flex flex-row w-[85vw] h-[90vh] m-auto">  
    <div class="flex flex-col">
        <h3 class="text-xl font-medium -ml-5">Channels:</h3>
        {#each channels as channel}
            <a href={"/" + lang + "/chat/" + channel} class="text-blue-500 underline active:text-blue-700">{channel}</a>
        {/each}
    </div>
    <div class="flex flex-col">

    </div>
</div>