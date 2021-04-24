import { API_V1_1_PREFIX } from '../globals';
import { CustomProfileDmV1Paginator, DmEventsV1Paginator, WelcomeDmV1Paginator } from '../paginators/dm.paginator.v1';
import {
  CreateDMEventV1Args,
  EDirectMessageEventTypeV1,
  SendDMV1Params,
  DirectMessageCreateV1Result,
  ReceivedDMEventV1,
  ReceivedDMEventsV1,
  GetDmListV1Args,
  MessageCreateDataV1,
  CreateWelcomeDMEventV1Args,
  WelcomeDirectMessageCreateV1Result,
  WelcomeDirectMessageListV1Result,
  WelcomeDmRuleV1Result,
  WelcomeDmRuleListV1Result,
  ReceivedDmCustomProfileItemV1,
  ReceivedDmCustomProfileListV1,
} from '../types';
import TwitterApiv1ReadWrite from './client.v1.write';

/**
 * Twitter v1.1 API client with read/write/DMs rights.
 */
export class TwitterApiv1 extends TwitterApiv1ReadWrite {
  protected _prefix = API_V1_1_PREFIX;

  /**
   * Get a client with read/write rights.
   */
  public get readWrite() {
    return this as TwitterApiv1ReadWrite;
  }

  /* Direct messages */
  // Part: Sending and receiving events

  /**
   * Publishes a new message_create event resulting in a Direct Message sent to a specified user from the authenticating user.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/sending-and-receiving/api-reference/new-event
   */
  public sendDm({ recipient_id, ...params }: SendDMV1Params) {
    const args: CreateDMEventV1Args = {
      event: {
        type: EDirectMessageEventTypeV1.Create,
        [EDirectMessageEventTypeV1.Create]: {
          target: { recipient_id },
          message_data: params,
        },
      },
    };

    return this.post<DirectMessageCreateV1Result>('direct_messages/events/new.json', args, {
      forceBodyMode: 'json',
    });
  }

  /**
   * Returns a single Direct Message event by the given id.
   *
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/sending-and-receiving/api-reference/get-event
   */
  public getDmEvent(id: string) {
    return this.get<ReceivedDMEventV1>('direct_messages/events/show.json', { id });
  }

  /**
   * Deletes the direct message specified in the required ID parameter.
   * The authenticating user must be the recipient of the specified direct message.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/sending-and-receiving/api-reference/delete-message-event
   */
  public deleteDm(id: string) {
    return this.delete<void>('direct_messages/events/destroy.json', { id });
  }

  /**
   * Returns all Direct Message events (both sent and received) within the last 30 days.
   * Sorted in reverse-chronological order.
   *
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/sending-and-receiving/api-reference/list-events
   */
  public async listDmEvents(args: Partial<GetDmListV1Args> = {}) {
    const queryParams = { ...args };
    const initialRq = await this.get<ReceivedDMEventsV1>('direct_messages/events/list.json', queryParams, { fullResponse: true });

    return new DmEventsV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit!,
      instance: this,
      queryParams,
    });
  }

  // Part: Welcome messages (events)

  /**
   * Creates a new Welcome Message that will be stored and sent in the future from the authenticating user in defined circumstances.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/welcome-messages/api-reference/new-welcome-message
   */
  public newWelcomeMessage(name: string, data: MessageCreateDataV1) {
    const args: CreateWelcomeDMEventV1Args = {
      [EDirectMessageEventTypeV1.WelcomeCreate]: {
        name,
        message_data: data,
      },
    };

    return this.post<WelcomeDirectMessageCreateV1Result>('direct_messages/welcome_messages/new.json', args, {
      forceBodyMode: 'json',
    });
  }

  /**
   * Returns a Welcome Message by the given id.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/welcome-messages/api-reference/get-welcome-message
   */
  public getWelcomeMessage(id: string) {
    return this.get<WelcomeDirectMessageCreateV1Result>('direct_messages/welcome_messages/show.json', { id });
  }

  /**
   * Deletes a Welcome Message by the given id.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/welcome-messages/api-reference/delete-welcome-message
   */
  public deleteWelcomeMessage(id: string) {
    return this.delete<void>('direct_messages/welcome_messages/destroy.json', { id });
  }

  /**
   * Updates a Welcome Message by the given ID.
   * Updates to the welcome_message object are atomic.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/welcome-messages/api-reference/update-welcome-message
   */
  public updateWelcomeMessage(id: string, data: MessageCreateDataV1) {
    const args = { message_data: data };
    return this.put<WelcomeDirectMessageCreateV1Result>('direct_messages/welcome_messages/update.json', args, {
      forceBodyMode: 'json',
      query: { id },
    });
  }

  /**
   * Returns all Direct Message events (both sent and received) within the last 30 days.
   * Sorted in reverse-chronological order.
   *
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/sending-and-receiving/api-reference/list-events
   */
  public async listWelcomeMessages(args: Partial<GetDmListV1Args> = {}) {
    const queryParams = { ...args };
    const initialRq = await this.get<WelcomeDirectMessageListV1Result>('direct_messages/welcome_messages/list.json', queryParams, { fullResponse: true });

    return new WelcomeDmV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit!,
      instance: this,
      queryParams,
    });
  }

  // Part: Welcome message (rules)

  /**
   * Creates a new Welcome Message Rule that determines which Welcome Message will be shown in a given conversation.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/welcome-messages/api-reference/new-welcome-message-rule
   */
  public newWelcomeMessageRule(welcomeMessageId: string) {
    return this.post<WelcomeDmRuleV1Result>('direct_messages/welcome_messages/rules/new.json', {
      welcome_message_rule: { welcome_message_id: welcomeMessageId },
    }, {
      forceBodyMode: 'json', 
    });
  }

  /**
   * Returns a Welcome Message Rule by the given id.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/welcome-messages/api-reference/get-welcome-message-rule
   */
  public getWelcomeMessageRule(id: string) {
    return this.get<WelcomeDmRuleV1Result>('direct_messages/welcome_messages/rules/show.json', { id });
  }

  /**
   * Deletes a Welcome Message Rule by the given id.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/welcome-messages/api-reference/delete-welcome-message-rule
   */
  public deleteWelcomeMessageRule(id: string) {
    return this.delete<void>('direct_messages/welcome_messages/rules/destroy.json', { id });
  }

  /**
   * Set the current showed welcome message for logged account ; wrapper for Welcome DM rules.
   * Test if a rule already exists, delete if any, then create a rule for current message ID.
   *
   * If you don't have already a welcome message, create it with `.newWelcomeMessage`.
   */
  public async setWelcomeMessage(welcomeMessageId: string) {
    const existingRules = await this.get<WelcomeDmRuleListV1Result>('direct_messages/welcome_messages/rules/list.json');

    if (existingRules.welcome_message_rules.length) {
      await Promise.all(existingRules.welcome_message_rules.map(rule => this.deleteWelcomeMessageRule(rule.id)));
    }

    return this.newWelcomeMessageRule(welcomeMessageId);
  }

  // Part: Custom profiles

  /**
   * Creates a new custom profile.
   * The returned ID should be used with when publishing a new message with POST direct_messages/events/new.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/custom-profiles/api-reference/new-profile
   */
  public newDmCustomProfile(name: string, avatarMediaId: string) {
    return this.post<WelcomeDirectMessageCreateV1Result>('custom_profiles/new.json', {
      custom_profile: {
        name,
        avatar: {
          media: { id: avatarMediaId },
        },
      },
    }, {
      forceBodyMode: 'json',
    });
  }

  /**
   * Returns a custom profile that was created with POST custom_profiles/new.json.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/custom-profiles/api-reference/get-profile
   */
  public getDmCustomProfile(id: string) {
    return this.get<ReceivedDmCustomProfileItemV1>(`custom_profiles/${id}.json`);
  }

  /**
   * Deletes a custom profile that was created with POST custom_profiles/new.json.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/custom-profiles/api-reference/delete-profile
   */
  public deleteDmCustomProfile(id: string) {
    return this.delete<void>('custom_profiles/destroy.json', { id });
  }

  /**
   * Retrieves all custom profiles for the authenticated account.
   * https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/custom-profiles/api-reference/get-profile-list
   */
  public async listDmCustomProfiles(args: Partial<GetDmListV1Args> = {}) {
    const queryParams = { ...args };
    const initialRq = await this.get<ReceivedDmCustomProfileListV1>('custom_profiles/list.json', queryParams, { fullResponse: true });

    return new CustomProfileDmV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit!,
      instance: this,
      queryParams,
    });
  }
}

export default TwitterApiv1;
