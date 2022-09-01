// 发送请求到服务器
var request = require('superagent');
var co = require('co');
var prompt = require('co-prompt');
program.action(function (file) {
    co(function* () {
        var username = yield prompt('username: ');
        var password = yield prompt.password('password: ');
        request
            .post('https://api.bitbucket.org/2.0/snippets/')
            .auth(username, password)
            .attach('file', file)
            .set('Accept', 'application/json')
            .end(function (err, res) {
                var link = res.body.links.html.href;
                console.log('Snippet created: %s', link);
            });
    });
});
