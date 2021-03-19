# gsfdc

```
var sfdc = new (require("gsfdc"))({
    host: "https://test.salesforce.com",
    user: "you@example.com",
    pass: "secret",
});
```
```
sfdc.Update("Case", {
    Id: "5001F000006ZiYXQA0",
    Subject: Math.random()
}, function (err, res) {
    console.log(err, res);
});
```
```
var bulk = [{
    Id: "5001F000006Zm1MQAS",
    Subject: Math.random()
}, {
    // Id: "5001F000006ZicFQAS",
    Id: "5001F000006Zm1MQAS", // dupe testing
    Subject: Math.random()
}];

sfdc.Update("Case", bulk, function (err, res) {
    console.log(err, res);
});
```
```
sfdc.Query("select id from case limit 1000", function (err, res) {
    console.log(err, res);
});
```
