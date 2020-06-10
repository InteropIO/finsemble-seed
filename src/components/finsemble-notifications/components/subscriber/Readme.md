# Fetching and Receiving Notifications

This is an example component using the Notification client to subscribe to Notifications sent into Finsemble

### Subscribe

When use the notification client to subscribe for notifications. The client will receive all new notifications that are sent
after the subscription is successful. All updated statuses to the actions will always be returned.

The first thing you'll need to do is import the NotificationClient and Subscription Classes:

```typescript
import NotificationClient from "../finsemble-notifications/services/notification/notificationClient";
import Subscription from "../finsemble-notifications/types/Notification-definitions/Subscription";
```

Instantiate them:

```typescript
// Setup up the client
const client = new NotificationClient();

// Setup the subscription
const subscription = new Subscription();
subscription.onNotification = notification => {
	// This will run whenever a notification is received.
	// Do something with the notification. Use the notification.id to check
	// if it's an updated notification or new one.
};

// Subscribe for new notifications
let subscriptionId;
client.subscribe(subscription).then(subId => (subscriptionId = subId));
```

### Subscribe with filter

You might want to receive only some of notifications. You can do this by putting a filter on the subscription.

Import and instantiate the filter:

```typescript
import Filter from "../../types/Notification-definitions/Filter";

const subscription = new Subscription();
subscription.filter = new Filter();

// Only return notifications with notification.type == 'chat-notification' and
// notification.source == 'slack' (For an OR match push two objects with the required matchers)
subscription.filter.include.push({
	type: "chat-notification",
	source: "slack"
});

// Subscribe as normal
client.subscribe(subscription);
```

It's also possible to do deep matches:

```typescript
// return only notifications that have notification.meta.customField == 'hello'
subscription.filter.include.push({
	"meta.customField": "hello"
});
```

**Note:** There is also a `filter.exclude` array to exclude certain groups of notifications from
being subscribed to. Exclude rules have precedence over include rules.

#### Additional Filter Matchers

##### Primitives

A primitive is an object with properties that are matched.

- `{name:"John"}` - primitive that checks that the name field is equal to "John"

Multiple fields in a primitive are, by default, joined by logical AND. See under Modifiers to change this.

- `{name:"John",age:30}` - primitive that checks that the name field is equal to "John" AND that the age field is equal to 30

The name of a field in a primitive is _always_ the name of the field to match in the record. The value can be one of:

- Basic types: string, number, date - will match directly against the value in the record. Case is **ignored** in string matches.
- Array: will match against any one of the values in the array. See below.

Primitives will search against individual values and against one or more matches in an array. So the search `{name:"John"}` will match against any of the following objects:

- `{name:"John"}`
- `{name:["John","jim"]}`
- `{name:["jim","John"]}`

##### Deep Searching

You are not limited to searching only at the top level. You also can do deep searching on an object of an object using dot-notation. So if you want to match on the object `{city: {Montreal: true}}` then you can search:

```JavaScript
{"city.Montreal": true}
```

The above is a search primitive that checks that the field "city" has an object as its value, which in turn has a key "Montreal" with a value of `true`. You can go as deep as you want. The following is a completely valid deep-search primitive:

```JavaScript
{"country.province.city.street":"Dorchester Blvd"}
```

Any modifiers that apply to simple primitives apply to deep fields as well.

##### Deep Searching Arrays

Deep searching is not limited to objects embedded in objects. You can have arrays of objects embedded in objects. You even can have arrays of objects embedded in arrays of objects embedded in... (you get the idea!).

Thus, the search primitive `{"name.cars.hp":{from:200}}` will match any of the following:

- `{cars: {brand: 'porsche',hp:450}}`
- `{cars: [{brand: 'bmw',hp:250},{brand: 'lada',hp:10}]}` matches the 'bmw' but not the 'lada', therefore the whole object matches

##### Array Primitive

If the value of a field in a primitive is an array, then it will accept a match of any one of the array values.

```JavaScript
{name:["John","Jack"]} // accepts any record where the name field matches 'John' or 'Jack'
```

Additionally, if the target record also has an array, it will accept a match if _any one_ of the values in the array of the record matches _any one_ of the values in the array of the search term.

```JavaScript
{name:["John","Jack"]}
```

will match any of these:

```JavaScript
{name:"John",phone:"+12125551212"}
{name:"Jack",location:"Canada"}
{name:["John","Jim"],company:"Hot Startup"}
```

### Perform actions

You've received a notification, you now want to perform one of the actions attached to it.

```typescript
// Use the client to perform the action
let actionToPerform = notification.actions[0];

client.performAction(notification, actionToPerform);

// All subscribers will receive the updated action state
```
