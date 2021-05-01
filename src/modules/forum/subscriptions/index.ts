import { createMember } from '../useCases/members/createMember';
import { AfterUserCreated } from './afterUserCreated';

// subscriptions
new AfterUserCreated(createMember);
