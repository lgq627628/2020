export default class Utils {
  static isAlpha(ch: string): boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
  }
  static isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9'
  }
  static isBlank(ch: string): boolean {
    return ch === ' ' || ch === '\t' || ch === '\n';
  }
}
