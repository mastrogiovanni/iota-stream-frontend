<script>
  import { onMount } from "svelte";
import { from_bytes, make_seed } from "./libs/utils";

  export let streams;

  let seed;
  let auth;
  let channelAddress;
  let branchType;
  let announceLink;
  let announceMessageId;

  let subscription;
  let keyloadLink;

  // IDLE = 0
  // LOADING = 1
  // LOADED = 2

  let status = 0;

  let messages = [];

  onMount(() => {
    seed = make_seed(81);
  });

  async function announce() {

    status = 1;

    let node = "http://localhost:14265/";
    let options = new streams.SendOptions(node, true);
    auth = new streams.Author(seed, options.clone(), streams.ChannelType.SingleBranch);

    console.log("channel address: ", auth.channel_address());
    channelAddress = auth.channel_address();
    console.log("multi branching: ", auth.is_multi_branching());

    let response = await auth.clone().send_announce();
    let ann_link = response.get_link();
    console.log("announced at: ", ann_link.to_string());
    announceLink = ann_link.to_string()

    let details = await auth.clone().get_client().get_link_details(ann_link.copy());
    console.log("Announce message id: " + details.get_metadata().message_id)
    announceMessageId = details.get_metadata().message_id

    status = 2;

  }

  async function receiveSubscription() {

    status = 3;

    await auth.clone().receive_subscribe(streams.Address.from_string(subscription));
    console.log("Subscription processed");

    console.log("Sending Keyload");
    let response = await auth.clone().send_keyload_for_everyone(streams.Address.from_string(announceLink));
    let keyload_link = response.get_link();
    console.log("Keyload message at: ", keyload_link.to_string());
    keyloadLink = keyload_link.to_string();

    status = 4;

      setInterval(fetchMessages, 1000);

  }

  async function fetchMessages() {

    console.log("\nAuthor fetching next messages");
    let exists = true;
    while (exists) {
        let next_msgs = await auth.clone().fetch_next_msgs();

        if (next_msgs.length === 0) {
            exists = false;
        }

        for (var i = 0; i < next_msgs.length; i++) {

          let _publicPayload = from_bytes(next_msgs[i].get_message().get_public_payload());
          let _maskedPayload = from_bytes(next_msgs[i].get_message().get_masked_payload());

          console.log("Found a message...");
          console.log(JSON.stringify(next_msgs[i].get_message(), null, 2));
          console.log(
              "Public: ",
              _publicPayload,
              "\tMasked: ",
              _maskedPayload
          );
          messages.push({
            public: _publicPayload,
            masked: _maskedPayload,
            ptr: next_msgs[i].get_message().ptr
          });

          messages = messages;

        }
    }

  }

</script>

<h1>Author</h1>

<form>
  <div class="form-group">
    <label for="branch">Branch Type</label>
    <select bind:value={branchType} id="branch" class="form-select" aria-label="Branch Type">
      <option value={undefined} selected>-</option>
      <option value="1">Single Branch</option>
      <option value="2">Multiple Branch</option>
    </select>
  </div>

  <div class="form-group">
    <label for="channelAddress">Channel Address</label>
    <input
      type="text"
      class="form-control"
      id="channelAddress"
      aria-describedby="channelAddress"
      readonly={true}
      value={channelAddress ? channelAddress : ""}
    />
    <small id="channelAddress" class="form-text text-muted">
      Unique channel address
    </small>
  </div>

  <div class="form-group">
    <label for="announceLink">Announce Link</label>
    <input
      type="text"
      class="form-control"
      id="announceLink"
      aria-describedby="announceLink"
      readonly={true}
      value={announceLink ? announceLink : ""}
    />
    <small id="announceLink" class="form-text text-muted">
      Here will be the link to share with subscribers
    </small>
  </div>

  <!--
  <div class="form-group">
    <label for="exampleInputPassword1">Password</label>
    <input
      type="password"
      class="form-control"
      id="exampleInputPassword1"
      placeholder="Password"
    />
  </div>
  
  <div class="form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck1" />
    <label class="form-check-label" for="exampleCheck1">Check me out</label>
  </div>
  -->

  {#if status <= 1}
  <button disabled={!branchType} type="button" on:click={announce} class="btn btn-primary">Announce</button>
  {/if}

</form>

{#if status === 1}
<div class="spinner-grow" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
{/if}

{#if status >= 2}

<p>
  This section is used to receive subscriptions
</p>

<form>

  <div class="form-group">
    <label for="subscription">Subscription</label>
    <input
      bind:value={subscription}
      type="text"
      class="form-control"
      id="subscription"
      aria-describedby="subscription"
    />
    <small id="subscription" class="form-text text-muted">
      Subscription is used to join a subscriber in the Author branch
    </small>
  </div>

  <div class="form-group">
    <label for="keyloadLink">Keyload Link</label>
    <input
      type="text"
      class="form-control"
      id="keyloadLink"
      aria-describedby="keyloadLink"
      readonly={true}
      value={keyloadLink ? keyloadLink : ""}
    />
    <small id="keyloadLink" class="form-text text-muted">
      Here will be the keyload link
    </small>
  </div>

  {#if status <= 3}
    <button disabled={!subscription} type="button" on:click={receiveSubscription} class="btn btn-primary">Receive Subscription</button>
  {/if}
</form>

{/if}

{#if status === 3}
<div class="spinner-grow" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
{/if}

{#if status >= 4}

<p>
  Fetching messages (poll every second)
</p>

<form>

  <div class="spinner-grow" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>

  <!--
  <button type="button" on:click={fetchMessages} class="btn btn-primary">Fetch Messages</button>
  -->

  <table class="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Public</th>
        <th scope="col">Masked</th>
      </tr>
    </thead>
    <tbody>

      {#each messages as message (message.ptr)}

      <tr>
        <th scope="row">{message.ptr}</th>
        <td>{message.public}</td>
        <td>{message.masked}</td>
      </tr>
  
      {/each}
  
    </tbody>
  </table>
  
</form>

{/if}
