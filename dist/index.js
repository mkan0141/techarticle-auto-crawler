"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const config_1 = __importDefault(require("./config"));
function feed2article(article) {
    var _a, _b;
    return {
        title: (_a = article.title) !== null && _a !== void 0 ? _a : '',
        url: (_b = article.link) !== null && _b !== void 0 ? _b : '',
        publish_at: new Date(article.pubDate)
    };
}
async function fetch_rss(url) {
    var _a;
    const parser = new rss_parser_1.default();
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const feeds = await parser.parseURL(url);
    const articles = (_a = feeds.items) === null || _a === void 0 ? void 0 : _a.map((article) => feed2article(article)).filter(article => (yesterday <= article.publish_at));
    return articles || [];
}
async function main(sites) {
    const now = new Date();
    let markdown = `# 新着技術記事(${now.getMonth()}/${now.getDay()} ${now.getHours()}:${now.getMinutes()} 更新)\n\n`;
    for (const site of sites) {
        const articles = await fetch_rss(site.feed_url);
        if (!articles.length)
            continue;
        markdown += `## [${site.name}](${site.url})\n`;
        articles.forEach((article) => {
            markdown += `- [${article.title}](${article.url})\n`;
        });
        markdown += '\n';
    }
    fs_1.default.writeFile('README.md', markdown, (err) => {
        if (err)
            console.log(err);
        console.log('README.md が更新されました');
    });
}
main(config_1.default);
//# sourceMappingURL=index.js.map