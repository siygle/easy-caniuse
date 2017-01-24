const caniuse = require('caniuse-api')

const BROWSER_MAPPING = {
  'and_chr': 'Chrome for Android',
  'and_uc': 'UC Browser for Android',
  'android': 'Android Browser',
  'chrome': 'Chrome',
  'edge': 'Edge',
  'firefix': 'Firefox',
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

module.exports = {
  getSupport: function (keyword) {
    let result = caniuse.getSupport(keyword, false)
    let output = []
    if (Object.keys(result).length > 0) {
      for (let k in result) {
        let supports = []
        for (let status in result[k]) {
          if (SUPPORT_KEY.includes(status)) {
            supports.push(`${SUPPORT_MAPPING[status]} ${result[k][status]}`)
          }
        }
        output.push(`${BROWSER_MAPPING[k]}: ${supports.join(', ')}`)
      }
    }
    return output
  }
}
