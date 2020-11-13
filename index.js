const axios = require("axios");
const cheerio = require("cheerio");
const SocksProxyAgent = require("socks-proxy-agent");

(async function () {
    process.title = "디시인사이드 댓글 주작기 Made By green1052";

    const loop = parseInt(process.argv[2]);
    const url = new URL(process.argv[3]);
    const content = process.argv[4];

    if (!loop || !url || !content)
        return console.log(`사용법: node index.js (반복) "(url)" "(내용)"`);

    let overlapCheck = [];

    async function GetProxy() {
        try {
            const response = await axios.get("https://www.proxyscan.io/api/proxy?format=json&type=socks4&country=kr", {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0"
                }
            });

            if (overlapCheck.includes(response.data[0]["Ip"])) {
                console.log("똑같은 아이피가 나와 새로운 아이피를 다시 구합니다.\n계속 알림이 뜬다면 프록시를 다 사용한거니 프로그램을 종료해주세요");
                return await GetProxy();
            } else
                overlapCheck.push(response.data[0]["Ip"]);

            return {
                "ip": response.data[0]["Ip"],
                "port": response.data[0]["Port"]
            };
        } catch (e) {
            throw e;
        }
    }

    function GetCookie(cookies, name) {
        for (const cookie of cookies) {
            if (cookie.includes(name))
                return cookie.split(';')[0].slice(name.length + 1);
        }

        throw "찾지 못함" + name;
    }

    async function FabricationComment() {
        try {
            const response = await axios.get(url.href, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0"
                }
            });

            const $ = cheerio.load(response.data);

            const gall_id = $("#id").val();
            const no = $("#no").val();

            const check_6 = $("#check_6").val();
            const check_7 = $("#check_7").val();
            const check_8 = $("#check_8").val();
            const check_9 = $("#check_9").val();

            const serverCode = GetCookie(response.headers["set-cookie"], "service_code");

            let formData = `&id=${gall_id}&no=${no}`;
            formData += "&name=%E3%85%87%E3%85%87";
            formData += `&password=${Math.random()}`;
            formData += `&memo=${encodeURIComponent(content)}`;
            formData += `&cur_t=${$("#cur_t").val()}`;
            formData += `&check_6=${check_6}&check_7=${check_7}&check_8=${check_8}&check_9=${check_9}`;
            formData += `&recommend=${$("#recommend").val()}`;
            formData += `&user_ip=${$("#user_ip").val()}`;
            formData += `&t_vch2=`;
            formData += `&service_code=${serverCode}`;
            formData += "&g-recaptcha-response=";

            // const proxy = await GetProxy();

            const res = await axios.post("https://gall.dcinside.com/board/forms/comment_submit", formData, {
                headers: {
                    "Host": "gall.dcinside.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0",
                    "Accept": "*/*",
                    "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Referer": url.href,
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest",
                    "Origin": "https://gall.dcinside.com",
                    "Connection": "keep-alive",
                    "Cookie": `ci_c=${GetCookie(response.headers["set-cookie"], "ci_c")}; service_code=${serverCode}; ck_lately_gall=${GetCookie(response.headers["set-cookie"], "ck_lately_gall")}; gallRecom=${GetCookie(response.headers["set-cookie"], "gallRecom")}; _gat_mgall_web=1; alarm_new=1; alarm_popup=1; PHPSESSID=${GetCookie(response.headers["set-cookie"], "PHPSESSID")};`
                },
                //httpsAgent: new SocksProxyAgent(`socks4://${proxy.ip}:${proxy.port}`)
            });

            console.log(res.data);
        } catch (e) {
            console.log(`댓글을 작성 하던 중 오류가 발생했습니다. 오류: ${e}`);
        }
    }

    for (let i = 0; i < loop; i++) {
        console.log(`${i + 1}번째 댓글 작성 중...`);
        await FabricationComment();
    }
})();