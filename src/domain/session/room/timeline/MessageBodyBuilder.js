import { linkify } from "./linkify.js";

export class MessageBodyBuilder {

    constructor(message = []) {
        this._root = message;
    }

    fromText(text) {
        const components = text.split("\n");
        components.slice(0, -1).forEach(t => {
            linkify(t, this.insert.bind(this));
            this.insertNewline();
        });
        const [last] = components.slice(-1);
        linkify(last, this.insert.bind(this));
    }

    insert(text, isLink) {
        if (!text.length) return;
        if (isLink)
            this.insertLink(text, text);
        else
            this.insertText(text);
    }

    insertText(text) {
        if (text.length)
            this._root.push({ type: "text", text: text });
    }

    insertLink(link, displayText) {
        this._root.push({ type: "link", url: link, text: displayText });
    }

    insertNewline() {
        this._root.push({ type: "newline" });
    }

    [Symbol.iterator]() {
        return this._root.values();
    }

}

export function tests() {

    function linkify(text) {
        const obj = new MessageBodyBuilder();
        obj.fromText(text);
        return obj;
    }

    function test(assert, input, output) {
        output = new MessageBodyBuilder(output);
        input = linkify(input);
        assert.deepEqual(input, output);
    }

    function testLink(assert, link, expectFail = false) {
        const input = link;
        const output = expectFail ? [{ type: "text", text: input }] :
            [{ type: "link", url: input, text: input }];
        test(assert, input, output);
    }

    return {
        // Tests for text
        "Text only": assert => {
            const input = "This is a sentence";
            const output = [{ type: "text", text: input }];
            test(assert, input, output);
        },

        "Text with newline": assert => {
            const input = "This is a sentence.\nThis is another sentence.";
            const output = [
                { type: "text", text: "This is a sentence." },
                { type: "newline" },
                { type: "text", text: "This is another sentence." }
            ];
            test(assert, input, output);
        },

        "Text with newline & trailing newline": assert => {
            const input = "This is a sentence.\nThis is another sentence.\n";
            const output = [
                { type: "text", text: "This is a sentence." },
                { type: "newline" },
                { type: "text", text: "This is another sentence." },
                { type: "newline" }
            ];
            test(assert, input, output);
        },

        // Tests for links
        "Link with host": assert => {
            testLink(assert, "https://matrix.org");
        },

        "Link with host & path": assert => {
            testLink(assert, "https://matrix.org/docs/develop");
        },

        "Link with host & fragment": assert => {
            testLink(assert, "https://matrix.org#test");
        },

        "Link with host & query": assert => {
            testLink(assert, "https://matrix.org/?foo=bar");
        },

        "Complex link": assert => {
            const link = "https://www.foobar.com/url?sa=t&rct=j&q=&esrc=s&source" +
                "=web&cd=&cad=rja&uact=8&ved=2ahUKEwjyu7DJ-LHwAhUQyzgGHc" +
                "OKA70QFjAAegQIBBAD&url=https%3A%2F%2Fmatrix.org%2Fdocs%" +
                "2Fprojects%2Fclient%2Felement%2F&usg=AOvVaw0xpENrPHv_R-" +
                "ERkyacR2Bd";
            testLink(assert, link);
        },

        "Localhost link": assert => {
            testLink(assert, "http://localhost");
            testLink(assert, "http://localhost:3000");
        },

        "IPV4 link": assert => {
            testLink(assert, "https://192.0.0.1");
            testLink(assert, "https://250.123.67.23:5924");
        },

        "IPV6 link": assert => {
            testLink(assert, "http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]");
            testLink(assert, "http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:7000");
        },

        "Missing scheme must not linkify": assert => {
            testLink(assert, "matrix.org/foo/bar", true);
        },

        "Punctuation at end of link must not linkify": assert => {
            const link = "https://foo.bar/?nenjil=lal810";
            const end = ".,? ";
            for (const char of end) {
                const out = [{ type: "link", url: link, text: link }, { type: "text", text: char }];
                test(assert, link + char, out);
            }
        },

        "Unicode in hostname must not linkify": assert => {
            const link = "https://foo.bar\uD83D\uDE03.com";
            const out = [{ type: "link", url: "https://foo.bar", text: "https://foo.bar" },
            { type: "text", text: "\uD83D\uDE03.com" }];
            test(assert, link, out);
        },

        "Link with unicode only after / must linkify": assert => {
            testLink(assert, "https://foo.bar.com/\uD83D\uDE03");
        }
    };
}
