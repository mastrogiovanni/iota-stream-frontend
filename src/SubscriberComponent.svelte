<script>
  import { onMount } from "svelte";
import { make_seed, to_bytes } from "./libs/utils";

  export let streams;

  let seed2;

  let sub;

  let announceLink;
  let subscriptionMessage;
  let startState;

  let keyloadLink;
  
  let publicPayload;
  let maskedPayload;

  // IDLE = 0
  // LOADING = 1
  // LOADED = 2

  let status = 0

  onMount(() => {
    seed2 = make_seed(81);
  });

  async function receiveAnnounce() {

    status = 1;

    let node = "http://localhost:14265/";
    let options = new streams.SendOptions(node, true);
    sub = new streams.Subscriber(seed2, options.clone());
    await sub.clone().receive_announcement(streams.Address.from_string(announceLink));

    // copy state for comparison after reset later
    startState = sub.fetch_state();
    console.log(startState)

    console.log("Subscribing...");
    let response = await sub.clone().send_subscribe(streams.Address.from_string(announceLink));
    let sub_link = response.get_link();
    console.log("Subscription message at: ", sub_link.to_string());
    subscriptionMessage = sub_link.to_string()

    status = 2;

  }

  let sending = false;

  async function syncState() {

    if (status === 2) {

      console.log("Subscriber syncing...");
      await sub.clone().sync_state();
      status = 3;

    }

    sending = true;

    let public_payload = to_bytes(publicPayload);
    let masked_payload = to_bytes(maskedPayload);

    console.log("Subscriber Sending tagged packet");
    let response = await sub
        .clone()
        .send_tagged_packet(streams.Address.from_string(keyloadLink), public_payload, masked_payload);
    let tag_link = response.get_link();
    console.log("Tag packet at: ", tag_link.to_string());

    sending = false;

    /*
    let last_link = tag_link;
    console.log("Subscriber Sending multiple signed packets");

    for (var x = 0; x < 10; x++) {
        response = await sub
            .clone()
            .send_signed_packet(last_link, public_payload, masked_payload);
        last_link = response.get_link();
        console.log("Signed packet at: ", last_link.to_string());
    }
    */

  } 
</script>

<h1>Subscriber</h1>

<form>
  <div class="form-group">
    <label for="announceLink">Announce Link</label>
    <input
      bind:value={announceLink}
      type="text"
      class="form-control"
      id="announceLink"
      aria-describedby="announceLink"
    />
    <small id="announceLink" class="form-text text-muted">
      Link to receive from Author in order to join the channel
    </small>
  </div>

  <div class="form-group">
    <label for="subscriptionMessage">Subscription Message</label>
    <input
      type="text"
      class="form-control"
      id="subscriptionMessage"
      aria-describedby="subscriptionMessage"
      readonly={true}
      value={subscriptionMessage ? subscriptionMessage : ""}
    />
    <small id="channelAddress" class="form-text text-muted">
      Subscription Message
    </small>
  </div>

  

  <!--
  <div class="form-group">
    <label for="exampleInputPassword11">Password</label>
    <input
      type="password"
      class="form-control"
      id="exampleInputPassword11"
      placeholder="Password"
    />
  </div>
  <div class="form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck11" />
    <label class="form-check-label" for="exampleCheck11">Check me out</label>
  </div>
  -->

  {#if status < 2}
    <button disabled={!announceLink} type="button" on:click={receiveAnnounce} class="btn btn-primary">Receive Announce</button>
  {/if}

</form>

{#if status === 1}
<div class="spinner-grow" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
{/if}

{#if status >= 2}

<p>Click Here to synchronize state and send some messages</p>

<form>

  <div class="form-group">
    <label for="keyloadLink">Keyload Link</label>
    <input
      bind:value={keyloadLink}
      type="text"
      class="form-control"
      id="keyloadLink"
      aria-describedby="keyloadLink"
    />
    <small id="keyloadLink" class="form-text text-muted">
      Keyload link: used to send/receive messages
    </small>
  </div>

  <div class="form-group">
    <label for="maskedPayload">Masked Payload</label>
    <input
      bind:value={maskedPayload}
      type="text"
      class="form-control"
      id="maskedPayload"
      aria-describedby="maskedPayload"
    />
    <small id="maskedPayload" class="form-text text-muted">
      Masked payload
    </small>
  </div>

  <div class="form-group">
    <label for="publicPayload">Public Payload</label>
    <input
      bind:value={publicPayload}
      type="text"
      class="form-control"
      id="publicPayload"
      aria-describedby="publicPayload"
    />
    <small id="publicPayload" class="form-text text-muted">
      Public payload
    </small>
  </div>

  {#if !sending}
    <button disabled={!keyloadLink} type="button" on:click={syncState} class="btn btn-primary">Send Message</button>
  {:else}
    <div class="spinner-grow" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  {/if}

</form>

{/if}