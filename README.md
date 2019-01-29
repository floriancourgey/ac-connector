# ac-connector
Adobe Campaign Classic Connector for NodeJS

This module provides some classes and multi environments management for Adobe Campaign (ex Neolane) in node JS

## Install
```bash
$ npm install ac-connector
```

## Connections Manager
First when install, you have to add connection(s) to your plateform localy.
In this purpose, launch the command
```bash
$ ACCManager # located in node_modules/bin/ACCManager
```

This will open a Web page (on `http://localhost:4545/`) that allows to configure severals connections

Those connections are stored in the local user directory (under the ".ac-connector/" folder)

Interface let you define basics and mandatory fields, like server url, user name, password. But you can add your own fields in order to use them in your project.

The field `name` (Name) is the one to identify a connection (must be unique) and use the connection in your project.

## Installing the library
Load the library and the class needed
```js
> var ACC = require('ac-connector');
> var ACCLogManager = ACC.ACCLogManager;
> ACCLogManager.listConnections(); // list connections
[ 'My Connection Name' ]
```

Then you have to get your connection using `ACCLogManager` class
```js
var login = ACCLogManager.getLogin('My Connection Name');
```

When you get your `ACCLogin` object, you can instanciate standard class, passing an object with your login with 'accLogin' name. Every method return a Promise.

## Using the library (with XML-String)
Create a `./index.js` file with the following:
```js
var xtkQueryDef = ACC.xtkQueryDef;
var queryDef = new xtkQueryDef({ 'accLogin' : login });
var soap =
  '<query operation="select" schema="nms:recipient">'+
    '<select><node expr="@id"/></select>'+
    '<where><condition expr="@email=\'user@domain.com\'"/></where>'+
  '</query>';
var request = queryDef.ExecuteQuery(soap);
request.then( (result) => {
  console.log('result:', result);
  var recipients = result['recipient-collection']['recipient'];
  console.log(recipients.length+' recipients found:', recipients);
})
.catch( (e) => {console.log('Error !', e );});
```

## Using the library (with JXON)
Create a `./index.js` file with the following:
```js
var jxon = require('jxon');
var xtkQueryDef = ACC.xtkQueryDef;
var queryDef = new xtkQueryDef({ 'accLogin' : login });
var js = {
  query: {
    select: {
      node: [
        { '$expr': '@namespace' },
        { '$expr': '@name' },
        { '$expr': 'data' }
      ]
    },
    where: {
      condition: { '$expr': '@namespace=\'acx\'' }
    },
    '$operation': 'select',
    '$schema': 'xtk:jssp'
  }
};
var request = queryDef.ExecuteQuery(jxon.jsToString(js));
request.then( (result) => {
  console.log('result:', result);
  var recipients = result['recipient-collection']['recipient'];
  console.log(recipients.length+' recipients found:', recipients);
})
.catch( (e) => {console.log('Error !', e );});
```

and start it with `node index.js`:
```bash
$ node index.js
7 recipients found: [
  { attributes: { id: 'xxx' } },
  { attributes: { id: 'xxx' } },
  { attributes: { id: 'xxx' } },
  { attributes: { id: 'xxx' } },
  { attributes: { id: 'xxx' } },
  { attributes: { id: 'xxx' } },
  { attributes: { id: 'xxx' } } ]
```

## Download all JSSP in folders
```js
const fs = require('fs-extra');
var jxon = require('jxon');
var ACC = require('ac-connector');
var ACCLogManager = ACC.ACCLogManager;
var xtkQueryDef = ACC.xtkQueryDef;
var login = ACCLogManager.getLogin('');
var queryDef = new xtkQueryDef({ 'accLogin' : login });

var js = {
  query: {
    select: {
      node: [
        { '$expr': '@namespace' },
        { '$expr': '@name' },
        { '$expr': 'data' }
      ]
    },
    '$operation': 'select',
    '$schema': 'xtk:jssp'
  }
};

var request = queryDef.ExecuteQuery(jxon.jsToString(js));
request.then( (result) => {
  var objects = result['jssp-collection']['jssp'];
  console.log(objects.length+' JSSP found:');
  for(var object of objects){
    var name = object['attributes']['name'].replace(/[\:\/\\]/g, '_');
    var namespace = object['attributes']['namespace'].replace(/[\:\/\\]/g, '_');
    console.log(' - '+namespace+' '+name);
    var path = "download/xtk_jssp/"+namespace+'/'+name;
    var content = objects[0].data;
    fs.outputFile(path, content, function (err) {
      if(err) console.log(err); // => null
    });
  }
}).catch( (e) => {console.log('Error ! ', e );});
```
