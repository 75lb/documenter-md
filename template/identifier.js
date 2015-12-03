'use strict'
const isTTY = process.stdout.isTTY
const ansi = require('ansi-escape-sequences')
const t = require('typical')
const wrap = require('wordwrapjs')
const gfmt = require('gfmt')

const _i = new WeakMap()
class Identifier {
  constructor (i) {
    _i.set(this, i)
    this.kind = i.kind
  }
  get description () {
    if (_i.get(this).description) {
      return `${wrap(removeLinks(_i.get(this).description), { width: 80 })}\n\n`
    } else {
      return ''
    }
  }
  get isModule () {
    return this.kind === 'module'
  }
}

class TerminalIdentifier extends Identifier {

  get signature () {
    const i = _i.get(this)
    const format = this.isModule ? 'bold underline' : 'bold'
    return clean`[${format}]{${i.sig.name} ${i.sig.symbol}} [underline]{${i.sig.type}}\n`
  }

  get type () {
    const type = _i.get(this).type
    if (type) {
      return `  [bold]{Kind}: ${type.name} of [underline]{${type.parent.name}}\n\n`
    } else {
      return ''
    }

  }

  get params () {
    let params = _i.get(this).params
    if (params) {
      params = params.map(p => {
        p.description = removeLinks(p.description)
        p.type = ansi.format(`[underline]{${p.type}}`)
        return p
      })

      return `  [bold]{Params}:\n${gfmt(params, { wrap: true, width: 80 })}\n`
    } else {
      return ''
    }
  }

  get example () {
    let example = _i.get(this).example
    if (example) {
      example = indent(example)
      return `  [bold]{Example}:\n${example}\n`
    } else {
      return ''
    }

  }

  render () {
    const output = `${this.signature}${this.description}${this.type}${this.params}${this.example}`
    return ansi.format(output)
  }
}

class MarkdownIdentifier extends Identifier {
  get signature () {
    const i = _i.get(this)
    return `MD signature`
  }

  render () {
    return
`## ${this.signature}
${this.description}
`
  }
}

function clean () {
  const args = Array.from(arguments)
  const template = args.shift()
  const values = args
  return template.reduce((prev, curr, index) => {
    const value = t.isDefined(values[index-1]) ?  values[index-1] : ''
    return prev + value + curr
  })
}

function indent (data) {
  return data.split(/\n/).map(l => '  ' + l).join('\n')
}

function removeLinks (str) {
  return str.replace(/\[(\S*)\]\(\S+\)/g, '$1')
}

module.exports = isTTY ? TerminalIdentifier : MarkdownIdentifier
