import fs from 'fs'
import RssParser from 'rss-parser'
import site_list  from './config'
import { Article, SiteInformation } from './types'


function feed2article (article: RssParser.Output) : Article {
  return {
    title:      article.title ?? '',
    url:        article.link ?? '',
    publish_at: new Date(article.pubDate)
  }
}

async function fetch_rss (url: string): Promise<Article[]> {
  const parser = new RssParser()
  const now = new Date()
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  
  const feeds = await parser.parseURL(url)
  const articles = feeds.items?.map((article) => feed2article(article)).filter(article => (yesterday <= article.publish_at))
  return articles || []
}

async function main (sites : SiteInformation[]) {
  const now = new Date()
  let markdown = `# 新着技術記事(${now.getMonth()}/${now.getDay()} ${now.getHours()}:${now.getMinutes()} 更新)\n\n`

  for (const site of sites) {
    const articles = await fetch_rss(site.feed_url)
    if (!articles.length) continue

    markdown += `## [${site.name}](${site.url})\n`
    articles.forEach((article: Article) => {
      markdown += `- [${article.title}](${article.url})\n`
    })
    markdown += '\n'
  }
  fs.writeFile('README.md', markdown, (err) => {
    if (err) console.log(err)
    console.log('README.md が更新されました')
  })
}

main(site_list)
