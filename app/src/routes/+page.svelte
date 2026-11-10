<script lang="ts">
  import { goto } from "$app/navigation";
  import { redirect } from "@sveltejs/kit";
    import { io } from "socket.io-client";
    const ENDPOINT = 'http://localhost:3000';

    const socket = io(ENDPOINT);

    let username: string = $state("")
    let displayname: string = $state("")

    function join() {
        if (displayname.length === 0) {displayname = username;}
        socket.emit("join", (username), (displayname), (response) => {
            if (response.status === "ok") {
                localStorage.setItem("username", username);
                localStorage.setItem("displayname", displayname);
                const a = document.createElement("a");
                a.href = "/chat";
                a.click();
            } else {
                return response.status;
            }
        })
    }
</script>

<h1 class="text-center text-4xl m-5 fade-in">Welcome to <strong class="font-bold text-red-100">Chat App</strong></h1>

<form onsubmit={join} class="flex flex-col absolute left-[50%] top-[50%] transform-[translate(-50%,-50%)] items-center w-fit h-fit m-auto p-5 gap-1">
    <label for="username" class="text-2xl fade-in mt-5">Username:</label>
    <input required maxlength="16" minlength="6" id="username" name="username" bind:value={username} type="text" class="bg-amber-100/25 h-auto text-xl w-75 fade-in shadow-xl">
    <label for="displayname" class="text-2xl fade-in">Display name:</label>
    <input maxlength="16" id="displayname" name="displayname" bind:value={displayname} type="text" class="bg-amber-100/25 h-auto text-xl w-75 fade-in shadow-xl">
    <button class="bg-blue-800 rounded p-1.5 mt-5 font-bold text-xl fade-in">Join</button>
    <p class="text-red-300 font-bold"><!--Add error text here--></p>
    <div class="w-full h-full backdrop-blur-md rounded-2xl absolute z-[-1]"></div>
</form>

<style>
    :global(body) {
        background-image: url("src/lib/assets/images/background/robbin-grimm-JBKaUMZxspA-unsplash.jpg");
        background-size: cover;
        background-color: black;
        color: white;
    }
</style>