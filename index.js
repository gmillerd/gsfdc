"use strict";

var async = require("async");
var _ = require("lodash");

class SFDC {
    constructor(args) {

        if (!args.user || !args.pass || !args.host) {
            throw 'bad args';
        }

        this.user = args.user;
        this.pass = args.pass;
        this.sfdc = new (require("jsforce")).Connection({
            loginUrl: args.host
        });
        this.sfdcLoggedin = false;
    }

    _login(cb) {
        var top = this;
        top.sfdc.login(top.user, top.pass,
            function (err, res) {
                if (!err)
                    top.sfdcLoggedin = true;
                cb(err, res);
            });
    }

    Upsert(obj, recs, pk, cb) {
        var top = this;

        if (Array.isArray(recs)) {
	    let uni = _.uniqBy(recs, pk);
	    if (uni.length != recs.length) {
                console.error('duplicates exist in your recs, that is so annoying');
            }
            recs = uni;
        }

	async.waterfall([
            function (cbb) {
                if (top.sfdcLoggedin) {
                    cbb();
                } else {
                    top._login(function (err, res) {
                        cbb(err, res);
                    });
                }
            },
        ], function () {
	    
            top.sfdc.sobject(obj).upset(recs,
					pk,
					{ allowRecursive: true },
					function (err, ret) {
					    cb(err, ret);
					});
        });
    }
    
    Update(obj, recs, cb) {
        var top = this;

        if (Array.isArray(recs)) {
            let uni = _.uniqBy(recs, 'Id');
            if (uni.length != recs.length) {
                console.error('duplicates exist in your recs, that is so annoying');
            }
            recs = uni;
        }

        async.waterfall([
            function (cbb) {
                if (top.sfdcLoggedin) {
                    cbb();
                } else {
                    top._login(function (err, res) {
                        cbb(err, res);
                    });
                }
            },
        ], function () {

            top.sfdc.sobject(obj).update(recs,
                { allowRecursive: true },
                function (err, ret) {
                    cb(err, ret);
                });
        });
    }

    Query(sql, cb) {
        var top = this;

        async.waterfall([
            function (cbb) {
                if (top.sfdcLoggedin) {
                    cbb();
                } else {
                    top._login(function (err, res) {
                        cbb();
                    });
                }
            },
        ], function () {
            var recs = [];
            var query = top.sfdc.query(sql)
                .on("record", function (rec) {
                    delete rec.attributes;
                    recs.push(rec);
                })
                .on("end", function () {
                    if (query.totalSize != query.totalFetched) {
                        cb('missing records', recs);
                    } else {
                        cb(null, recs);
                    }
                })
                .on("error", function (err) {
                    console.log(err);
                    cb(err);
                })
                .run({ autoFetch: true, maxFetch: 1000 * 1000 * 1000 });
        });
    }
}

module.exports = SFDC;
