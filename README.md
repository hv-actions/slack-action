# Slack API Action
This action wraps the [Slack Web API](https://api.slack.com/web) in an action to facilitate usage within workflows.

## Setup
This actions performs it's actions using a slack bot token. To acquire one you need to create a Slack App, add the Bot token scope permissions required for the api calls you intend to perform and install it into your workspace. Once this is done the workspace token is available on the permissions page of your app and you can start using this action. 

### Invite Github App

The Github Actions app must be invited to the Slack channel that is going to receive notifications. You do this  via `/invite @Github` in the channel. 

This is the error you will receive if the app isn’t added:

```
(node:30785) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
...
Error: An API error occurred: not_in_channel
```

There are 2 Github apps in the HV Slack instance. It is hard to discern which is which in the Slack UI until you add one. Invite both if necessary.

## Usage
Send a basic text message to a channel.
```
- name: Slack Message                     
  uses: hv-actions/slack-action@v2
  env:
    SLACK_TOKEN: ${{ secrets.SLACK_TOKEN }}   
  with:
    title: "testing slack messaging"
    channel: "development"
```

The `SLACK_TOKEN` environment variable must be present and have the necessary permissions for the method being used.

By default the api method is [chat.postMessage](https://api.slack.com/methods/chat.postMessage) but you can define any other method suported by the [`@slack/web-api`](https://slack.dev/node-slack-sdk/web-api) package provided by the [Node Slack SDK](https://slack.dev/node-slack-sdk/).

```
- name: Slack Message                     
  uses: hv-actions/slack-action@v2   
  with:
    method: conversations.list
```

### Advanced Usage
Custom fields are optional and can be any number with any values.
```
- name: Slack notification on success
  uses: hv-actions/slack-action@v2
  env:
    SLACK_TOKEN: ${{ secrets.SLACK_TOKEN }}
  with:
    title: "testing slack messaging"
    channel: "development"
    message: "testing slack messaging"
    custom-fields: |
      Status=:sunglasses: SUCCESS
      Branch=${{ github.ref }}
```

The raw-input parameter expects a string in the JSON format with any parameter that the method accepts. This way any custom message formatting is allowed.

A more complex message:
```
- name: Slack Message                     
  uses: hv-actions/slack-action@v2   
  with:
    raw-input: |
      {
        "channel": "development",
        "attachments": [
          {
            "mrkdwn_in": ["text"],
            "color": "#36a64f",
            "pretext": "Built branch ${{ github.ref }}",
            "author_name": "${{ github.actor }}",
            "author_link": "http://flickr.com/bobby/",
            "author_icon": "https://placeimg.com/16/16/people",
            "title": "${{ github.workflow }}",
            "title_link": "https://api.slack.com/",
            "text": "Optional `text` that appears within the attachment",
            "thumb_url": "http://placekitten.com/g/200/200",
            "footer": "Github Actions",
            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
            "ts": 123456789
          }
        ]
      }
```
For more info about the available fields: [https://api.slack.com/reference/messaging/attachments#legacy_fields](https://api.slack.com/reference/messaging/attachments#legacy_fields)

## Development
To build the action simply run:
```
npm run package
```

## ToDo
Custom predefined message formats might be added in the future if needed. 
