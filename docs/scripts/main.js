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

function process(el, ret) {
  if (ret == null || ret == undefined) {
    return
  } else if (Array.isArray(ret)) {
    for (let item of ret) {
      el.appendChild(item)
    }
  } else if (typeof ret == 'string') {
    el.textContent = ret
  } else if (typeof ret == 'function') {
    process(el, ret(el))
  } else if (typeof ret.then == 'function') {
    ret.then(ret => process(el, ret))
  }
}

function ce(name, ...rest) {
  const el = typeof name == 'object' ? name : parseName(name)
  while (el.firstChild) el.removeChild(el.firstChild)
  for (let p of rest)
    process(el, p)
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

function renderRoot() {
  ce(document.body, markLanguage, body => [
    ce('div#root', [
        ce('h1', resolveLanguage({
          'en-US': 'Minecraft Mod Repository',
          'zh-CN': '我的世界基岩版模组仓库'
        })),
        ce('div.list', async () => {
          const mods = await (await fetch('/mods/index.json')).json()
          return mods.list.map(item => ce('div.item', async () => {
            const info = await (await fetch(`/mods/${item}/index.json`)).json()
            console.log(info)
            return [
              ce('h2', resolveLanguage(info.info).name),
              ce('div.version', info.version),
              ce('div.author', [ce('a', info.author, linkHref(`/mods/${item.split("/")[0]}`))]),
              ce('div.contributors', info.contributors.map(contributor => ce('div', contributor))),
              ce('div.description', resolveLanguage(info.info).description),
              ce('div.extra_files', info.extra_files.map(extra_file => ce('div', [
                ce('a.name', extra_file.name, linkHref(`/mods/${item}/${extra_file.name}`)),
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
                ce('a.bugs', linkHref(info.bugs.link)),
                ce('a.bugsEmail', linkHref(`mailto:${info.bugs.email}`)),
              ]),
            ]
          }))
        })
      ]
    )
  ])
}

setTimeout(renderRoot)