'use strict'

function parseName(name) {
  const [s1, r1] = name.split('#')
  if (r1) {
    const ret = document.createElement(s1)
    const [s2, ...r2] = r1.split('.')
    ret.id = s2
    for (let clazz of r2)
      ret.classList.add(clazz)
    return ret
  } else {
    const [s2, ...r2] = s1.split('.')
    const ret = document.createElement(s2)
    for (let clazz of r2)
      ret.classList.add(clazz)
    return ret
  }
}

async function process(el, ret) {
  if (ret == null || ret == undefined) {
    return
  } else if (Array.isArray(ret)) {
    for (let item of ret) {
      el.appendChild(item)
    }
  } else if (typeof ret == 'string') {
    el.textContent = ret
  } else if (typeof ret.then == 'function') {
    await process(el, await ret);
  } else if (typeof ret == 'function') {
    await process(el, ret(el))
  }
}

function ce(name, ...rest) {
  const el = typeof name == 'object' ? name : parseName(name)
  while (el.firstChild) el.removeChild(el.firstChild);
  (async () => {
    for (let p of rest) {
      await process(el, await p)
    }
  })()
  return el;
}

function resolveLanguage(obj) {
  const language = navigator.language
  if (language in obj) {
    return obj[language]
  }
  return obj['en-US']
}

function downloadableLink(name) {
  return link => {
    link.download = name
    return null
  }
}

function linkHref(href) {
  return link => {
    link.href = href
    return null
  }
}

function markLanguage(el) {
  el.classList.add(navigator.language)
}

function onClick(fn) {
  return x => {
    x.onclick = fn
    return null;
  }
}

function nextTick(time) {
  return new Promise((r) => setTimeout(r, time))
}

function renderRoot() {
  let preview, grid;
  let items = []

  async function resizeGridItem(item) {
    let rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    let rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
    let rowSpan = Math.ceil((item.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
    item.parentElement.style.gridRowEnd = "span " + rowSpan;
  }

  window.onhashchange = event => {
    event.preventDefault()
  }

  window.onresize = () => {
    console.log(items)
    items.forEach(resizeGridItem)
  }

  ce(document.body, markLanguage, body => [
    ce('div#root', [
      ce('h1', resolveLanguage({
        'en-US': 'My Minecraft Bedrock Edition Server Mod Repository',
        'zh-CN': '我的世界基岩版服务器模组仓库'
      })),
      ce('div.list', g => (grid = g), async () => {
        const mods = await (await fetch('/mods/index.json')).json()
        return mods.list.map(item => ce(`div#${item}.item`,
          p => [ce('div.content', async x => {
            const info = await (await fetch(`/mods/${item}/index.json`)).json()
            p.tabIndex = 0
            if (location.hash == `#${item}`) {
              setTimeout(() => x.scrollIntoView())
              p.focus();
            }
            p.onfocus = () => {
              location.replace(`#${item}`)
            }
            return [
              ce('h2', resolveLanguage(info.info).name),
              ce('div.version', info.version),
              ce('div.author', [ce('a', info.author, linkHref(`/mods/${item.split("/")[0]}`))]),
              ce('div.contributors', info.contributors.map(contributor => ce('div', contributor))),
              ce('div.description', resolveLanguage(info.info).description),
              ce('div.extra_files', info.extra_files.map(extra_file => ce('div', [
                ce('a.name', extra_file.name, linkHref(`/mods/${item}/${extra_file.name}`), !extra_file.gfm ? undefined : onClick(e => {
                  e.preventDefault();
                  ce(preview, [
                    ce('div.title', extra_file.name),
                    ce('div.close', onClick(() => {
                      ce(preview, [])
                    })),
                    ce('iframe', async frame => {
                      const content = await (await fetch(`/mods/${item}/${extra_file.name}`)).text()
                      frame.srcdoc = await (await fetch('https://api.github.com/markdown', {
                        method: 'POST', body: JSON.stringify({ text: content, mode: 'gfm', context: extra_file.gfm })
                      })).text()
                      return null
                    })
                  ])
                })),
                ce('div.info', resolveLanguage(extra_file.info).name)
              ]))),
              ce('div.generated_files', info.generated_files.map(generated_file => ce('div', [
                ce('div.name', generated_file.name),
                ce('div.info', resolveLanguage(generated_file.info).name)
              ]))),
              ce('div.dependencies', Object.entries(info.dependencies).map(([key, value]) => ce('div', [
                ce('span.key', key),
                ce('span.value', value),
              ]))),
              ce('div.keywords', info.keywords.map(word => ce('span', word))),
              ce('div.license', info.license),
              ce('div.download', [
                ce('a.main', info.main, downloadableLink(info.main), linkHref(`/mods/${item}/${info.main}`))
              ]),
              ce('div.links', [
                ce('a.homepage', linkHref(info.homepage)),
                ce('a.bugs', linkHref(info.bugs.url)),
                ce('a.bugsEmail', linkHref(`mailto:${info.bugs.email}`)),
              ]),
            ]
          }, resizeGridItem, x => {
            console.log(x, items.push(x));
          })]))
      }),
      ce('div#preview', x => {
        preview = x;
        return null;
      }),
      ce('footer', [
        ce('p', resolveLanguage({
          'en-US': "Wants to host your Minecraft BE Server? Please click the link below.",
          'zh-CN': "想要运行自己的我的世界基岩版服务器？请点击如下链接："
        })),
        ce('a', linkHref('https://github.com/codehz/mcpeserver'), 'mcpeserver')
      ])
    ]
    )
  ])
}

setTimeout(renderRoot)