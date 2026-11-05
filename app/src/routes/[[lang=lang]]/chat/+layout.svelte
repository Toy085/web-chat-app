<script lang="ts">
    import { page } from '$app/state';
	let { children } = $props();
    let lang = page.params.lang ? page.params.lang : "en";
    let channels: Array<string> = $state([]);

    channels.push("minecraft")
    channels.push("T-matte")
    channels.push("General")
    channels.push("Kasane Teto Fan Club")
    channels.push("Lorem Ipsum")
    channels.push("({[minecraft]})")
</script>

<div class="flex flex-row w-[85vw] h-[90vh]">
    <div class="flex flex-col">
        {#each channels as channel}
            <a href={"/" + lang + "/chat/" + channel}>{channel}</a>
        {/each}
    </div>
    <div class="flex flex-col">

    </div>
</div>

{@render children()}