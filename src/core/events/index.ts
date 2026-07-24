import { v4 as uuidv4 } from 'uuid';
import type { EventBus, EventHandler, EventPayload, EventSubscription } from '../types';
import { logger } from '../logger';

class VessieEventBus implements EventBus {
  private static instance: VessieEventBus;
  private subscriptions: Map<string, Set<EventSubscription>> = new Map();
  private eventHistory: Map<string, EventPayload[]> = new Map();
  private maxHistorySize: number = 1000;

  private constructor() {
    logger.info('EventBus initialized');
  }

  static getInstance(): VessieEventBus {
    if (!VessieEventBus.instance) {
      VessieEventBus.instance = new VessieEventBus();
    }
    return VessieEventBus.instance;
  }

  emit(event: string, payload: EventPayload = {}): void {
    const subscriptions = this.subscriptions.get(event);
    if (subscriptions) {
      for (const sub of subscriptions) {
        try {
          Promise.resolve(sub.handler(payload)).catch((error) => {
            logger.error(`Error in event handler for "${event}"`, { error, subscriptionId: sub.id });
          });
        } catch (error) {
          logger.error(`Synchronous error in event handler for "${event}"`, { error, subscriptionId: sub.id });
        }
      }
    }

    // Store in history
    if (!this.eventHistory.has(event)) {
      this.eventHistory.set(event, []);
    }
    const history = this.eventHistory.get(event)!;
    history.push({ ...payload, _event: event, _timestamp: new Date().toISOString() });
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  on(event: string, handler: EventHandler): string {
    const id = uuidv4();
    const subscription: EventSubscription = { event, handler, id };

    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }
    this.subscriptions.get(event)!.add(subscription);

    logger.debug(`Handler registered for event "${event}"`, { subscriptionId: id });
    return id;
  }

  off(event: string, subscriptionId: string): void {
    const subscriptions = this.subscriptions.get(event);
    if (subscriptions) {
      for (const sub of subscriptions) {
        if (sub.id === subscriptionId) {
          subscriptions.delete(sub);
          logger.debug(`Handler removed for event "${event}"`, { subscriptionId });
          break;
        }
      }
      if (subscriptions.size === 0) {
        this.subscriptions.delete(event);
      }
    }
  }

  once(event: string, handler: EventHandler): string {
    const id = uuidv4();
    const wrappedHandler: EventHandler = (payload) => {
      handler(payload);
      this.off(event, id);
    };
    const subscription: EventSubscription = { event, handler: wrappedHandler, id };

    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }
    this.subscriptions.get(event)!.add(subscription);

    logger.debug(`Once handler registered for event "${event}"`, { subscriptionId: id });
    return id;
  }

  removeAllListeners(event?: string): void {
    if (event) {
      const count = this.subscriptions.get(event)?.size ?? 0;
      this.subscriptions.delete(event);
      logger.debug(`Removed ${count} listeners for event "${event}"`);
    } else {
      const total = Array.from(this.subscriptions.values()).reduce((sum, set) => sum + set.size, 0);
      this.subscriptions.clear();
      logger.debug(`Removed all listeners (${total} total)`);
    }
  }

  getEventNames(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  getHistory(event: string, limit: number = 100): EventPayload[] {
    const history = this.eventHistory.get(event) ?? [];
    return history.slice(-limit);
  }

  getSubscriberCount(event: string): number {
    return this.subscriptions.get(event)?.size ?? 0;
  }

  clearHistory(event?: string): void {
    if (event) {
      this.eventHistory.delete(event);
    } else {
      this.eventHistory.clear();
    }
  }
}

export const eventBus = VessieEventBus.getInstance();
export { VessieEventBus };

// Event constants
export const EVENTS = {
  SERVER_STARTED: 'server.started',
  SERVER_STOPPED: 'server.stopped',
  TOOL_EXECUTED: 'tool.executed',
  TOOL_FAILED: 'tool.failed',
  PLUGIN_LOADED: 'plugin.loaded',
  PLUGIN_REMOVED: 'plugin.removed',
  AUTH_SUCCESS: 'auth.success',
  AUTH_FAILED: 'auth.failed',
  CACHE_HIT: 'cache.hit',
  CACHE_MISS: 'cache.miss',
  RESOURCE_ACCESSED: 'resource.accessed',
  PROMPT_EXECUTED: 'prompt.executed',
  CONFIG_CHANGED: 'config.changed',
  ERROR_OCCURRED: 'error.occurred',
} as const;
</arg_value></tool_call>