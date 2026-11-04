<script lang="ts">
    import { io } from "socket.io-client";
    const ENDPOINT = 'http://localhost:3000';

    const socket = io(ENDPOINT);
    socket.emit("test")

    let username: string = $state("")
    let displayname: string = $state("")

    function join() {
        if (displayname.length === 0) {displayname = username}
    }
</script>

<h1 class="text-center text-4xl m-5">Welcome to <strong>Chat App</strong></h1>

<form onsubmit={join} class="flex flex-col relative items-center w-fit h-fit m-auto p-5 gap-1">
    <label for="username" class="text-2xl">Username:</label>
    <input required maxlength="32" minlength="6" id="username" name="username" bind:value={username} type="text" class="bg-amber-100/25 h-auto text-xl w-75">
    <label for="displayname" class="text-2xl">Display name:</label>
    <input maxlength="32" id="displayname" name="displayname" bind:value={displayname} type="text" class="bg-amber-100/25 h-auto text-xl w-75">
    <button class="bg-blue-800 rounded p-1.5 m-5 font-bold text-xl">Join</button>
    <p class="text-red-300 font-bold"><!--Add error text here--></p>
    <div class="w-full h-full backdrop-blur-md rounded-2xl absolute z-[-1]"></div>
</form>

<style>
    :global(body) {
        background-image: url("src/lib/assets/images/background/robbin-grimm-JBKaUMZxspA-unsplash.jpg");
        background-size: cover;
        color: white;
    }
</style>