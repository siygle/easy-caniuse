const caniuse = require('caniuse-api')
const smb = require('slack-message-builder')
const debug = require('debug')('easy-caniuse')

const BROWSER_MAPPING = {
  'and_chr': 'Chrome for Android',
  'and_uc': 'UC Browser for Android',
  'android': 'Android Browser',
  'chrome': 'Chrome',
  'edge': 'Edge',
  'firefox': 'Firefox',
  'ie': 'IE',
  'ie_mob': 'IE Mobile',
  'ios_saf': 'iOS Safari',
  'op_mini': 'Opear Mini',
  'opera': 'Opear',
  'safari': 'Safari',
  'samsung': 'Samsung Internet'
}

const SUPPORT_MAPPING = {
  'y': '>=',
  'n': 'Not support',
  'a': 'Partially support',
  'X': 'Prefix'
}
const SUPPORT_KEY = Object.keys(SUPPORT_MAPPING)

function _accurateFind (keyword) {
  let terms = keyword.split(' ')
  let search

  try {
    search = caniuse.find(terms[0])
    debug('Search %s %o', keyword, search)
  } catch (e) {
    return false
  }

  if (!Array.isArray(search)) {
    return [search]
  } else {
    if (terms.length > 1) {
      let restTerms = terms.slice(1).join('|')
      let filter = []
      search.forEach((data) => {
        if (data.match(new RegExp(restTerms, 'i'))) {
          filter.push(data)
        }
      })
      return filter
    } else {
      return search
    }
  }
}

function _genResultBtn (data) {
  if (Array.isArray(data)) {
    return data.map(suggest => {
      return {
        name: 'term',
        text: suggest,
        type: 'button',
        value: suggest
      }
    })
  } else {
    return [{
      name: 'term',
      text: data,
      type: 'button',
      value: data
    }]
  }
}

module.exports = {
  find: function (keyword) {
    let suggests = _accurateFind(keyword)
    if (Array.isArray(suggests) && suggests.length > 0) {
      let message = (suggests.length > 5)
        ? `There are ${suggests.length} matching result, please use more accurate keyword`
        : 'Which one you want to search?'

      let output = smb()
        .text('')
        .attachments([{
          title: message,
          callback_id: 'caniuse_find',
          actions: _genResultBtn(suggests)
        }])
        .json()

      return output
    } else {
      return smb().text(`Do not support ${keyword}`).json()
    }
  },
  getSupport: function (keyword) {
    let output = []
    let result = caniuse.getSupport(keyword, false)
    debug('getSupport %s %o', keyword, result)

    if (Object.keys(result).length > 0) {
      for (let k in result) {
        let supports = []
        for (let status in result[k]) {
          if (SUPPORT_KEY.includes(status)) {
            supports.push(`${SUPPORT_MAPPING[status]} ${result[k][status]}`)
          }
        }

        if (supports.length > 0) {
          output.push({
            browser: BROWSER_MAPPING[k],
            status: supports.join(', ')
          })
        }
      }
    }

    let fields = output.map(info => {
      return {
        title: info.browser,
        value: info.status
      }
    })
    console.log(fields)

    return smb()
    .text('')
    .attachment()
      .title(`Can I use...${keyword}`)
      .titleLink(`http://caniuse.com/#feat=${keyword}`)
      .text('Browser support')
      .fields(fields)
    .end()
    .json()
  }
}
