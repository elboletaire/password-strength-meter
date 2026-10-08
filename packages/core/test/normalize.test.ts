import { describe, expect, it } from 'vitest'
import { normalize, normalizeChar, toChars, tokenize } from '../src/normalize'

describe('toChars', () => {
  it('splits into code points', () => {
    expect(toChars('🔒a')).toEqual(['🔒', 'a'])
  })
})

describe('normalize', () => {
  it('lowercases', () => {
    expect(normalize('PassWord')).toBe('password')
    expect(normalize('ÑANDÚ')).toBe('ñandú')
  })

  it('undoes leetspeak', () => {
    expect(normalize('P@ssw0rd')).toBe('password')
    expect(normalize('7357')).toBe('test')
    expect(normalize('$41')).toBe('sai')
    expect(normalizeChar('4')).toBe('a')
  })
})

describe('tokenize', () => {
  it('splits user inputs on non-alphanumerics', () => {
    expect(tokenize(['john.doe@example.com'])).toEqual(['john', 'doe', 'example', 'com'])
  })

  it('drops tokens shorter than 3 characters and duplicates', () => {
    expect(tokenize(['Jo', 'Ana Li', 'ana'])).toEqual(['ana'])
  })

  it('normalizes tokens', () => {
    expect(tokenize(['J0hn'])).toEqual(['john'])
  })
})
