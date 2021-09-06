/* tslint:disable */
/* eslint-disable */
/**
*/
export function set_panic_hook(): void;
/**
*/
export enum ChannelType {
  SingleBranch,
  MultiBranch,
  SingleDepth,
}
/**
*/
export enum LedgerInclusionState {
  Conflicting,
  Included,
  NoTransaction,
}
/**
*/
export class Address {
  free(): void;
/**
* @param {string} link
* @returns {Address}
*/
  static from_string(link: string): Address;
/**
* @returns {string}
*/
  to_string(): string;
/**
* @returns {Address}
*/
  copy(): Address;
/**
* @returns {string}
*/
  addr_id: string;
/**
* @returns {string}
*/
  msg_id: string;
}
/**
*/
export class Author {
  free(): void;
/**
* @param {string} seed
* @param {SendOptions} options
* @param {number} implementation
*/
  constructor(seed: string, options: SendOptions, implementation: number);
/**
* @param {Client} client
* @param {string} seed
* @param {number} implementation
* @returns {Author}
*/
  static from_client(client: Client, seed: string, implementation: number): Author;
/**
* @param {Client} client
* @param {Uint8Array} bytes
* @param {string} password
* @returns {Author}
*/
  static import(client: Client, bytes: Uint8Array, password: string): Author;
/**
* @param {string} password
* @returns {Uint8Array}
*/
  export(password: string): Uint8Array;
/**
* @returns {Author}
*/
  clone(): Author;
/**
* @returns {string}
*/
  channel_address(): string;
/**
* @returns {boolean}
*/
  is_multi_branching(): boolean;
/**
* @returns {Client}
*/
  get_client(): Client;
/**
* @param {string} psk_seed_str
* @returns {string}
*/
  store_psk(psk_seed_str: string): string;
/**
* @returns {string}
*/
  get_public_key(): string;
/**
* @returns {any}
*/
  send_announce(): any;
/**
* @param {Address} link
* @returns {any}
*/
  send_keyload_for_everyone(link: Address): any;
/**
* @param {Address} link
* @param {PskIds} psk_ids
* @param {PublicKeys} sig_pks
* @returns {any}
*/
  send_keyload(link: Address, psk_ids: PskIds, sig_pks: PublicKeys): any;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {any}
*/
  send_tagged_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): any;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {any}
*/
  send_signed_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): any;
/**
* @param {Address} link_to
* @returns {any}
*/
  receive_subscribe(link_to: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_tagged_packet(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_signed_packet(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_sequence(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_msg(link: Address): any;
/**
* @param {Address} anchor_link
* @param {number} msg_num
* @returns {any}
*/
  receive_msg_by_sequence_number(anchor_link: Address, msg_num: number): any;
/**
* @returns {any}
*/
  sync_state(): any;
/**
* @returns {any}
*/
  fetch_next_msgs(): any;
/**
* @param {Address} link
* @returns {any}
*/
  fetch_prev_msg(link: Address): any;
/**
* @param {Address} link
* @param {number} num_msgs
* @returns {any}
*/
  fetch_prev_msgs(link: Address, num_msgs: number): any;
/**
* @returns {any}
*/
  gen_next_msg_ids(): any;
/**
* @returns {Array<any>}
*/
  fetch_state(): Array<any>;
}
/**
*/
export class Client {
  free(): void;
/**
* @param {string} node
* @param {SendOptions} options
*/
  constructor(node: string, options: SendOptions);
/**
* @param {Address} link
* @returns {any}
*/
  get_link_details(link: Address): any;
}
/**
*/
export class Cursor {
  free(): void;
}
/**
*/
export class Details {
  free(): void;
/**
* @returns {MessageMetadata}
*/
  get_metadata(): MessageMetadata;
/**
* @returns {MilestoneResponse | undefined}
*/
  get_milestone(): MilestoneResponse | undefined;
}
/**
*/
export class Message {
  free(): void;
/**
* @returns {Message}
*/
  static default(): Message;
/**
* @param {string | undefined} identifier
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {Message}
*/
  static new(identifier: string | undefined, public_payload: Uint8Array, masked_payload: Uint8Array): Message;
/**
* @returns {string}
*/
  get_identifier(): string;
/**
* @returns {Array<any>}
*/
  get_public_payload(): Array<any>;
/**
* @returns {Array<any>}
*/
  get_masked_payload(): Array<any>;
}
/**
*/
export class MessageMetadata {
  free(): void;
/**
* @returns {number | undefined}
*/
  conflict_reason?: number;
/**
* @returns {Array<any>}
*/
  readonly get_parent_message_ids: Array<any>;
/**
* @returns {boolean}
*/
  is_solid: boolean;
/**
* @returns {number | undefined}
*/
  ledger_inclusion_state?: number;
/**
* @returns {string}
*/
  readonly message_id: string;
/**
* @returns {number | undefined}
*/
  milestone_index?: number;
/**
* @returns {number | undefined}
*/
  referenced_by_milestone_index?: number;
/**
* @returns {boolean | undefined}
*/
  should_promote?: boolean;
/**
* @returns {boolean | undefined}
*/
  should_reattach?: boolean;
}
/**
*/
export class MilestoneResponse {
  free(): void;
/**
* Milestone index.
* @returns {number}
*/
  index: number;
/**
* @returns {string}
*/
  readonly message_id: string;
/**
* Milestone timestamp.
* @returns {BigInt}
*/
  timestamp: BigInt;
}
/**
*/
export class NextMsgId {
  free(): void;
/**
* @param {string} identifier
* @param {Address} msgid
* @returns {NextMsgId}
*/
  static new(identifier: string, msgid: Address): NextMsgId;
/**
* @returns {string}
*/
  get_identifier(): string;
/**
* @returns {Address}
*/
  get_link(): Address;
}
/**
*/
export class PskIds {
  free(): void;
/**
* @returns {PskIds}
*/
  static new(): PskIds;
/**
* @param {string} id
*/
  add(id: string): void;
/**
* @returns {Array<any>}
*/
  get_ids(): Array<any>;
}
/**
*/
export class PublicKeys {
  free(): void;
/**
* @returns {PublicKeys}
*/
  static new(): PublicKeys;
/**
* @param {string} id
*/
  add(id: string): void;
/**
* @returns {Array<any>}
*/
  get_pks(): Array<any>;
}
/**
*/
export class SendOptions {
  free(): void;
/**
* @param {string} url
* @param {boolean} local_pow
*/
  constructor(url: string, local_pow: boolean);
/**
* @returns {SendOptions}
*/
  clone(): SendOptions;
/**
* @returns {boolean}
*/
  local_pow: boolean;
/**
* @returns {string}
*/
  url: string;
}
/**
*/
export class Subscriber {
  free(): void;
/**
* @param {string} seed
* @param {SendOptions} options
*/
  constructor(seed: string, options: SendOptions);
/**
* @param {Client} client
* @param {string} seed
* @returns {Subscriber}
*/
  static from_client(client: Client, seed: string): Subscriber;
/**
* @param {Client} client
* @param {Uint8Array} bytes
* @param {string} password
* @returns {Subscriber}
*/
  static import(client: Client, bytes: Uint8Array, password: string): Subscriber;
/**
* @returns {Subscriber}
*/
  clone(): Subscriber;
/**
* @returns {string}
*/
  channel_address(): string;
/**
* @returns {Client}
*/
  get_client(): Client;
/**
* @returns {boolean}
*/
  is_multi_branching(): boolean;
/**
* @param {string} psk_seed_str
* @returns {string}
*/
  store_psk(psk_seed_str: string): string;
/**
* @returns {string}
*/
  get_public_key(): string;
/**
* @returns {string}
*/
  author_public_key(): string;
/**
* @returns {boolean}
*/
  is_registered(): boolean;
/**
*/
  unregister(): void;
/**
* @param {string} password
* @returns {Uint8Array}
*/
  export(password: string): Uint8Array;
/**
* @param {Address} link
* @returns {any}
*/
  receive_announcement(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_keyload(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_tagged_packet(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_signed_packet(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_sequence(link: Address): any;
/**
* @param {Address} link
* @returns {any}
*/
  receive_msg(link: Address): any;
/**
* @param {Address} anchor_link
* @param {number} msg_num
* @returns {any}
*/
  receive_msg_by_sequence_number(anchor_link: Address, msg_num: number): any;
/**
* @param {Address} link
* @returns {any}
*/
  send_subscribe(link: Address): any;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {any}
*/
  send_tagged_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): any;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {any}
*/
  send_signed_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): any;
/**
* @returns {any}
*/
  sync_state(): any;
/**
* @returns {any}
*/
  fetch_next_msgs(): any;
/**
* @param {Address} link
* @returns {any}
*/
  fetch_prev_msg(link: Address): any;
/**
* @param {Address} link
* @param {number} num_msgs
* @returns {any}
*/
  fetch_prev_msgs(link: Address, num_msgs: number): any;
/**
* @returns {Array<any>}
*/
  fetch_state(): Array<any>;
/**
*/
  reset_state(): void;
}
/**
*/
export class UserResponse {
  free(): void;
/**
* @param {Address} link
* @param {Address | undefined} seq_link
* @param {Message | undefined} message
* @returns {UserResponse}
*/
  static new(link: Address, seq_link?: Address, message?: Message): UserResponse;
/**
* @param {string} link
* @param {string | undefined} seq_link
* @param {Message | undefined} message
* @returns {UserResponse}
*/
  static from_strings(link: string, seq_link?: string, message?: Message): UserResponse;
/**
* @returns {UserResponse}
*/
  copy(): UserResponse;
/**
* @returns {Address}
*/
  get_link(): Address;
/**
* @returns {Address}
*/
  get_seq_link(): Address;
/**
* @returns {Message}
*/
  get_message(): Message;
}
/**
*/
export class UserState {
  free(): void;
/**
* @param {string} identifier
* @param {Cursor} cursor
* @returns {UserState}
*/
  static new(identifier: string, cursor: Cursor): UserState;
/**
* @returns {string}
*/
  get_identifier(): string;
/**
* @returns {Address}
*/
  get_link(): Address;
/**
* @returns {number}
*/
  get_seq_no(): number;
/**
* @returns {number}
*/
  get_branch_no(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_sendoptions_free: (a: number) => void;
  readonly __wbg_get_sendoptions_local_pow: (a: number) => number;
  readonly __wbg_set_sendoptions_local_pow: (a: number, b: number) => void;
  readonly sendoptions_new: (a: number, b: number, c: number) => number;
  readonly sendoptions_set_url: (a: number, b: number, c: number) => void;
  readonly sendoptions_url: (a: number, b: number) => void;
  readonly sendoptions_clone: (a: number) => number;
  readonly __wbg_address_free: (a: number) => void;
  readonly address_addr_id: (a: number, b: number) => void;
  readonly address_set_addr_id: (a: number, b: number, c: number) => void;
  readonly address_msg_id: (a: number, b: number) => void;
  readonly address_set_msg_id: (a: number, b: number, c: number) => void;
  readonly address_from_string: (a: number, b: number) => number;
  readonly address_to_string: (a: number, b: number) => void;
  readonly address_copy: (a: number) => number;
  readonly __wbg_userresponse_free: (a: number) => void;
  readonly __wbg_nextmsgid_free: (a: number) => void;
  readonly __wbg_userstate_free: (a: number) => void;
  readonly __wbg_cursor_free: (a: number) => void;
  readonly userstate_new: (a: number, b: number, c: number) => number;
  readonly userstate_get_identifier: (a: number, b: number) => void;
  readonly userstate_get_link: (a: number) => number;
  readonly userstate_get_seq_no: (a: number) => number;
  readonly userstate_get_branch_no: (a: number) => number;
  readonly __wbg_message_free: (a: number) => void;
  readonly __wbg_pskids_free: (a: number) => void;
  readonly pskids_new: () => number;
  readonly pskids_add: (a: number, b: number, c: number) => void;
  readonly pskids_get_ids: (a: number) => number;
  readonly __wbg_publickeys_free: (a: number) => void;
  readonly publickeys_new: () => number;
  readonly publickeys_add: (a: number, b: number, c: number) => void;
  readonly publickeys_get_pks: (a: number) => number;
  readonly message_default: () => number;
  readonly message_new: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly message_get_identifier: (a: number, b: number) => void;
  readonly message_get_public_payload: (a: number) => number;
  readonly message_get_masked_payload: (a: number) => number;
  readonly nextmsgid_new: (a: number, b: number, c: number) => number;
  readonly nextmsgid_get_identifier: (a: number, b: number) => void;
  readonly nextmsgid_get_link: (a: number) => number;
  readonly userresponse_new: (a: number, b: number, c: number) => number;
  readonly userresponse_from_strings: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly userresponse_copy: (a: number) => number;
  readonly userresponse_get_link: (a: number) => number;
  readonly userresponse_get_seq_link: (a: number) => number;
  readonly userresponse_get_message: (a: number) => number;
  readonly __wbg_details_free: (a: number) => void;
  readonly details_get_metadata: (a: number) => number;
  readonly details_get_milestone: (a: number) => number;
  readonly __wbg_messagemetadata_free: (a: number) => void;
  readonly __wbg_get_messagemetadata_is_solid: (a: number) => number;
  readonly __wbg_set_messagemetadata_is_solid: (a: number, b: number) => void;
  readonly __wbg_get_messagemetadata_referenced_by_milestone_index: (a: number, b: number) => void;
  readonly __wbg_set_messagemetadata_referenced_by_milestone_index: (a: number, b: number, c: number) => void;
  readonly __wbg_get_messagemetadata_milestone_index: (a: number, b: number) => void;
  readonly __wbg_set_messagemetadata_milestone_index: (a: number, b: number, c: number) => void;
  readonly __wbg_get_messagemetadata_ledger_inclusion_state: (a: number) => number;
  readonly __wbg_set_messagemetadata_ledger_inclusion_state: (a: number, b: number) => void;
  readonly __wbg_get_messagemetadata_conflict_reason: (a: number) => number;
  readonly __wbg_set_messagemetadata_conflict_reason: (a: number, b: number) => void;
  readonly __wbg_get_messagemetadata_should_promote: (a: number) => number;
  readonly __wbg_set_messagemetadata_should_promote: (a: number, b: number) => void;
  readonly __wbg_get_messagemetadata_should_reattach: (a: number) => number;
  readonly __wbg_set_messagemetadata_should_reattach: (a: number, b: number) => void;
  readonly messagemetadata_message_id: (a: number, b: number) => void;
  readonly messagemetadata_get_parent_message_ids: (a: number) => number;
  readonly __wbg_milestoneresponse_free: (a: number) => void;
  readonly __wbg_get_milestoneresponse_index: (a: number) => number;
  readonly __wbg_set_milestoneresponse_index: (a: number, b: number) => void;
  readonly __wbg_get_milestoneresponse_timestamp: (a: number, b: number) => void;
  readonly __wbg_set_milestoneresponse_timestamp: (a: number, b: number, c: number) => void;
  readonly milestoneresponse_message_id: (a: number, b: number) => void;
  readonly __wbg_subscriber_free: (a: number) => void;
  readonly subscriber_new: (a: number, b: number, c: number) => number;
  readonly subscriber_from_client: (a: number, b: number, c: number) => number;
  readonly subscriber_import: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly subscriber_clone: (a: number) => number;
  readonly subscriber_channel_address: (a: number, b: number) => void;
  readonly subscriber_get_client: (a: number) => number;
  readonly subscriber_is_multi_branching: (a: number) => number;
  readonly subscriber_store_psk: (a: number, b: number, c: number, d: number) => void;
  readonly subscriber_get_public_key: (a: number, b: number) => void;
  readonly subscriber_author_public_key: (a: number, b: number) => void;
  readonly subscriber_is_registered: (a: number) => number;
  readonly subscriber_unregister: (a: number) => void;
  readonly subscriber_export: (a: number, b: number, c: number, d: number) => void;
  readonly subscriber_receive_announcement: (a: number, b: number) => number;
  readonly subscriber_receive_keyload: (a: number, b: number) => number;
  readonly subscriber_receive_tagged_packet: (a: number, b: number) => number;
  readonly subscriber_receive_signed_packet: (a: number, b: number) => number;
  readonly subscriber_receive_sequence: (a: number, b: number) => number;
  readonly subscriber_receive_msg: (a: number, b: number) => number;
  readonly subscriber_receive_msg_by_sequence_number: (a: number, b: number, c: number) => number;
  readonly subscriber_send_subscribe: (a: number, b: number) => number;
  readonly subscriber_send_tagged_packet: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly subscriber_send_signed_packet: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly subscriber_sync_state: (a: number) => number;
  readonly subscriber_fetch_next_msgs: (a: number) => number;
  readonly subscriber_fetch_prev_msg: (a: number, b: number) => number;
  readonly subscriber_fetch_prev_msgs: (a: number, b: number, c: number) => number;
  readonly subscriber_fetch_state: (a: number) => number;
  readonly subscriber_reset_state: (a: number) => void;
  readonly __wbg_author_free: (a: number) => void;
  readonly author_new: (a: number, b: number, c: number, d: number) => number;
  readonly author_from_client: (a: number, b: number, c: number, d: number) => number;
  readonly author_import: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly author_export: (a: number, b: number, c: number, d: number) => void;
  readonly author_clone: (a: number) => number;
  readonly author_channel_address: (a: number, b: number) => void;
  readonly author_is_multi_branching: (a: number) => number;
  readonly author_get_client: (a: number) => number;
  readonly author_store_psk: (a: number, b: number, c: number, d: number) => void;
  readonly author_get_public_key: (a: number, b: number) => void;
  readonly author_send_announce: (a: number) => number;
  readonly author_send_keyload_for_everyone: (a: number, b: number) => number;
  readonly author_send_keyload: (a: number, b: number, c: number, d: number) => number;
  readonly author_send_tagged_packet: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly author_send_signed_packet: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly author_receive_subscribe: (a: number, b: number) => number;
  readonly author_receive_tagged_packet: (a: number, b: number) => number;
  readonly author_receive_signed_packet: (a: number, b: number) => number;
  readonly author_receive_sequence: (a: number, b: number) => number;
  readonly author_receive_msg: (a: number, b: number) => number;
  readonly author_receive_msg_by_sequence_number: (a: number, b: number, c: number) => number;
  readonly author_sync_state: (a: number) => number;
  readonly author_fetch_next_msgs: (a: number) => number;
  readonly author_fetch_prev_msg: (a: number, b: number) => number;
  readonly author_fetch_prev_msgs: (a: number, b: number, c: number) => number;
  readonly author_gen_next_msg_ids: (a: number) => number;
  readonly author_fetch_state: (a: number) => number;
  readonly set_panic_hook: () => void;
  readonly __wbg_client_free: (a: number) => void;
  readonly client_new: (a: number, b: number, c: number) => number;
  readonly client_get_link_details: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h801e58843c6e16dd: (a: number, b: number, c: number) => void;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h85ebf086f28a5177: (a: number, b: number, c: number, d: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
