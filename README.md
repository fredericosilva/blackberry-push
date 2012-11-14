blackberry-push
===============

Blackberry push API for node.js

```js
var bbp  = require('blackberry-push'),
	push = bbpush(url, appID, user, password);

push('pin', 'hello world', function(err, result) {
	console.log(result); 
});
```

```js
{ code: '1001', desc: 'The request has been accepted for processing.' }
```