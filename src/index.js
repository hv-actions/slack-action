const { WebClient } = require('@slack/web-api')
const core = require('@actions/core')

const client = new WebClient(process.env.SLACK_TOKEN)
const eventJson = require(process.env.GITHUB_EVENT_PATH);

function buildDefaults(){
  var customFields = [];
  var branch = "Branch= " + process.env.GITHUB_REF
  var status = "Status= Warning"
  var commit = "Commit= " + "<" + eventJson.repository.html_url + "/commit/" + process.env.GITHUB_SHA + " | " + process.env.GITHUB_SHA + ">"
  customFields.push(branch,status,commit)
  core.debug(`Fields at function: '${customFields}'`)
  return customFields
}

function setColor(){
  var customFields = core.getMultilineInput('custom-fields')
  var color = "warning"
  customFields.forEach(function(item){
    var x = item.split("=")
    if(x[0].toUpperCase().includes("STATUS")){
      if(x[1].toUpperCase().includes("SUCCESS"))
        color = "good"
      else if(x[1].toUpperCase().includes("FAILED") || x[1].toUpperCase().includes("FAILURE"))
        color = "danger"
    } 
  })
  return color
}

function buildPayload(){
  const title = core.getInput('title')
  const channel = core.getInput('channel')
  const message = core.getInput('message')
  var customFields = core.getMultilineInput('custom-fields')

  var args = {};
  var attachment = {};
  var fields =[];

  core.debug(`Custom Fields: '${customFields}'`)
  if(customFields.length == 0){
    customFields = buildDefaults();
    core.debug(`Fields final: '${fields}'`)
  } 
  customFields.forEach(function(item){
    var x = item.split("=")
    fields.push({"title": x[0],"value": x[1]})
  }) 
  attachment.mrkdwn_in = ["text"];
  attachment.color = setColor();
  attachment.title = title;
  attachment.thumb_url = eventJson.organization.avatar_url;
  attachment.title_link = eventJson.repository.html_url + "/actions";
  attachment.fields = fields;

  var attachments = [attachment];
  args.channel = channel;
  args.text = message;
  args.attachments = attachments;
  return args
}

const method = core.getInput('method').split('.')
const rawInput = JSON.parse(core.getInput('raw-input'))


var args ='{}'
if(rawInput ==="{}")
  args = buildPayload()
else
  args = rawInput
  
var payload = JSON.stringify(args, null, 4);
core.debug(`Final payload: '${payload}'`);
let methodFn = client
method.forEach(methodPart => {
  if (methodFn[methodPart]) {
    methodFn = methodFn[methodPart]
  } else {
    core.setFailed(`Method '${method}' does not exist`)
  }
})

methodFn(args).then(
  result => console.log(result),
  error => {
    console.log(error.data)
    core.setFailed(error.message)
  }
)
