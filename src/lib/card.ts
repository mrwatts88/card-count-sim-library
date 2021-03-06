export enum Suit {
  C,
  D,
  H,
  S,
}

export class Card {
  public static Suits = Suit
  public readonly suit: Suit
  public readonly value: number

  constructor(suit: Suit, value: number) {
    this.suit = suit
    this.value = value
  }

  public toString(): string {
    return this.valAsString() + Suit[this.suit]
  }

  public valAsString(): string {
    switch (this.value) {
      case 1:
        return 'A'
      case 2:
        return '2'
      case 3:
        return '3'
      case 4:
        return '4'
      case 5:
        return '5'
      case 6:
        return '6'
      case 7:
        return '7'
      case 8:
        return '8'
      case 9:
        return '9'
      case 10:
        return 'T'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        throw new Error('Not a valid card value.')
    }
  }

  public valAsInt(): number {
    if (this.value > 1 && this.value < 11) return this.value
    else
      switch (this.value) {
        case 1:
          return 11
        case 11:
        case 12:
        case 13:
          return 10
        default:
          throw new Error('Nota valid card value.')
      }
  }
}
