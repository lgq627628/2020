var co = require('co');
var prompt = require('co-prompt');
var program = require('commander');
program
    .arguments('<file>')
    .option('-u, --username <username>', 'The user to authenticate as')
    .option('-p, --password <password>', "The user's password")
    .action(function (file) {
        co(function* () {
            var username = yield prompt('username: ');
            var password = yield prompt.password('password: ');
            console.log('user: %s pass: %s file: %s', username, password, file);
        });
    });
