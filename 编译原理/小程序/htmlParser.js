const htmlparser2 = require("htmlparser2");
const parser = new htmlparser2.Parser({
    onopentag(name, attributes) {
        console.log('onopentag', name, attributes);
        // if (name === "script" && attributes.type === "text/javascript") {
        //     console.log("JS! Hooray!");
        // }
    },
    ontext(text) {
        console.log('ontext', text);
    },
    onclosetag(tagname) {
        console.log('onclosetag', tagname);
        // if (tagname === "script") {
        //     console.log("That's it?!");
        // }
    },
});
parser.write(
    "<view data-qq=111>尤水就下</view>"
);
parser.end();