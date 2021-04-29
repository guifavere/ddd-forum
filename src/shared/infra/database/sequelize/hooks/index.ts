import models from '../models';
import { UniqueEntityID } from '../../../../domain/UniqueEntityID';
import { DomainEvents } from '../../../../domain/events/DomainEvents';

const dispatchEventsCallback = (model: any, primaryKeyField: string) => {
  const aggregateId = new UniqueEntityID(model[primaryKeyField]);

  DomainEvents.dispatchEventsForAggregate(aggregateId);
}

(async function createHooksForAggregateRoots() {
  const { BaseUser, Member, Post } = models;

  BaseUser.addHook('afterCreate', (m: any) => dispatchEventsCallback(m, 'base_user_id'));
  BaseUser.addHook('afterDestroy', (m: any) => dispatchEventsCallback(m, 'base_user_id'));
  BaseUser.addHook('afterUpdate', (m: any) => dispatchEventsCallback(m, 'base_user_id'));
  BaseUser.addHook('afterSave', (m: any) => dispatchEventsCallback(m, 'base_user_id'));
  BaseUser.addHook('afterUpsert', (m: any) => dispatchEventsCallback(m, 'base_user_id'));

  Member.addhook('afterCreate', (m: any) => dispatchEventsCallback(m, 'member_id'));
  Member.addhook('afterDestroy', (m: any) => dispatchEventsCallback(m, 'member_id'));
  Member.addhook('afterUpdate', (m: any) => dispatchEventsCallback(m, 'member_id'));
  Member.addhook('afterSave', (m: any) => dispatchEventsCallback(m, 'member_id'));
  Member.addhook('afterUpsert', (m: any) => dispatchEventsCallback(m, 'member_id'));

  Post.addhook('afterCreate', (m: any) => dispatchEventsCallback(m, 'post_id'));
  Post.addhook('afterDestroy', (m: any) => dispatchEventsCallback(m, 'post_id'));
  Post.addhook('afterUpdate', (m: any) => dispatchEventsCallback(m, 'post_id'));
  Post.addhook('afterSave', (m: any) => dispatchEventsCallback(m, 'post_id'));
  Post.addhook('afterUpsert', (m: any) => dispatchEventsCallback(m, 'post_id'));

  console.log('[Hooks]: Sequelize hooks setup.');
})();
