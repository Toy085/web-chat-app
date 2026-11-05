<script lang="ts">
    import { page } from '$app/state';

    let channelId = $derived(page.params.channel);
</script>

<p>Current channel: {channelId}</p>