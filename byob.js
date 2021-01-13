chillCat = chrome.extension.getURL("assets/cat.png")

function choice(l) {
    return l[Math.floor(Math.random() * l.length)]
}

function djb2hash(buf) {
    let h = 5381
    for (let c of (new TextEncoder()).encode(buf)) { // Encode as UTF-8 and read in each byte
        // JavaScript converts everything to a signed 32-bit integer when you do bitwise operations.
        // So we have to do "unsigned right shift" by zero to get it back to unsigned.
        h = (((h * 33) + c) & 0xffffffff) >>> 0
    }
    return h
}

function cyrb53hash(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

function fakeUsername(username) {
    let h1 = djb2hash(username)
    let h2 = cyrb53hash(username)

    return englishWords[h1 % englishWords.length] + " " + englishWords[h2 % englishWords.length]
}

/** Issue new usernames in threads with "Spooky" in the title.
 * 
 * Idea suggested by Manifisto.
 * 
 */
function spookify() {
    /* Anonymize the thread lists */
    for (let thread of document.querySelectorAll(".thread")) {
        let title = thread.querySelector(".title")
        if (title.textContent.includes("Spooky") || title.textContent.includes("spooky")) {
            for (let author of thread.querySelectorAll("td.author, .lastpost .author")) {
                let username = author.textContent
                while (author.firstChild) {
                    author.firstChild.remove()
                }
                author.textContent = fakeUsername(username)
                author.classList.add("spooky")
            }
        }
    }

    if (! document.title.includes("Spooky")) {
        return
    }
    for (let userInfo of document.querySelectorAll("td.userinfo")) {
        let userID // We can't use this, because of quote blocks
        for (let c of userInfo.classList) {
            if (c.startsWith("userid-")) {
                userID = c.split("-")[1]
            }
        }

        let author = userInfo.querySelector(".author")
        author.className = "author spooky"
        author.title = "A Forums User"
        author.textContent = fakeUsername(author.textContent)

        let title = userInfo.querySelector(".title")
        while (title.firstChild) {
            title.firstChild.remove()
        }
        let avatar = title.appendChild(document.createElement("img"))
        avatar.classList.add("img")
        avatar.src = chillCat
    }

    for (let quoteLink of document.querySelectorAll(".quote_link")) {
        let txt = quoteLink.textContent
        if (txt.endsWith(" posted:")) {
            let fun = fakeUsername(txt.substr(0, txt.length - 8))
            quoteLink.textContent = fun + " posted:"
        } else {
            quoteLink.textContent = "###ERROR### posted:"
        }
        quoteLink.classList.add("spooky")
    }
    console.log("GO HOG WILD")
}

function init() {
    let inByob = false
    for (let ss of document.styleSheets) {
        if (ss.href && ss.href.includes("byob.css")) {
            inByob = true
        }
    }

    if (!inByob) {
        return
    }

    spookify()
}

if (false && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
} else {
    init()
}
