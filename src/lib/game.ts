import Card from "./card"
import Dealer from "./dealer"
import Participant from "./participant"
import Player from "./player"
import Shoe from "./shoe"

export default class Game {
    private activePlayers: Player[]
    private dealer: Dealer
    private shoe: Shoe
    private roundIsOver: boolean
    private bustedPlayers: Player[]

    constructor() {
        this.roundIsOver = true
        this.activePlayers = []
        this.dealer = new Dealer()
        this.shoe = new Shoe(NUMBER_OF_DECKS, CARDS_BEFORE_CUT, hiLoCountMap)
        this.shoe.init()
    }

    public shuffleShoe(): void {
        this.shoe.shuffle()
    }

    public addPlayer(player: Player): void {
        if (!this.roundIsOver)
            throw new Error("Cannot add player during round.")

        this.activePlayers.push(player)
    }

    // This is used only during card counting simulation, not for creating a blackjack playing app
    public placeBets(): void {
        this.roundIsOver = false
        for (const player of this.activePlayers)
            player.placeBet(this.shoe.calcTrueCount())
    }

    public dealRound(): void {
        // TODO: Check that all active players have placed a bet
        for (const player of this.activePlayers)
            player.addCardToHand(this.shoe.dealCard())

        this.dealer.addCardToHand(this.shoe.dealCard())

        for (const player of this.activePlayers)
            player.addCardToHand(this.shoe.dealCard())

        this.dealer.addCardToHand(this.shoe.dealCard())
    }

    // TODO: Split into placeInsuranceBets() and resolveInsuranceBets()
    // placeInsuranceBets() will only be used in simulation, resolve will also be used in game-playing app
    public handleInsurance(): void {
        if (this.dealer.getCardAt(0).value !== 1) return
        for (const player of this.activePlayers)
            if (player.usingIll18() && this.shoe.calcTrueCount() >= Ill18Indices.insurance)
                switch (this.dealer.getCardAt(1).value) {
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                        player.bankroll += player.currentBet
                        break
                    default:
                        player.bankroll -= (player.currentBet / 2)
                        break
                }
    }

    // Only used in simulation
    // TODO: What to do about moving players to bustedPlayers if not using simulation???
    public playersPlayRound(): void {
        for (const player of this.activePlayers) {
            if (player.hasBlackjack()) {
                player.resolveBet(BLACKJACK_MULTIPLIER)
                player.bustedOrDiscarded = true
            } else {
                let takeAction = true
                while (takeAction) {
                    const action: number =
                        player.decideAction(this.shoe.calcTrueCount(), this.dealer.getCardAt(0).value)
                    let newCard: Card
                    switch (action) {
                        case Participant.actions.DOUBLE:
                            player.addCardToHand(this.shoe.dealCard())
                            player.bankroll -= player.currentBet
                            player.currentBet *= 2
                            takeAction = false
                            break
                        case Participant.actions.HIT:
                            newCard = this.shoe.dealCard()
                            player.addCardToHand(newCard)
                            if (player.calcHandTotal() > 21) {
                                player.bustedOrDiscarded = true
                                takeAction = false
                                break
                            }
                            break
                        case Participant.actions.SPLIT:
                            // TODO
                            break
                        case Participant.actions.STAND:
                            takeAction = false
                            break
                    }
                }
            }

            for (let i = this.activePlayers.length - 1; i >= 0; --i)
                if (this.activePlayers[i].bustedOrDiscarded)
                    this.bustedPlayers.push(this.activePlayers.splice(i, 1)[0])
        }
    }

    public dealerPlayRound(): void {
        if (this.activePlayers.length <= 0) return
        let takeAction = true
        while (takeAction) {
            const action: number = this.dealer.decideAction()
            let newCard: Card
            switch (action) {
                case Participant.actions.HIT:
                    newCard = this.shoe.dealCard()
                    this.dealer.addCardToHand(newCard)
                    if (this.dealer.calcHandTotal() > 21) {
                        this.dealer.bustedOrDiscarded = true
                        takeAction = false
                        break
                    }
                    break
                case Participant.actions.STAND:
                    takeAction = false
                    break
            }
        }
    }

    public resolveBets(): void {
        for (const p of this.activePlayers)
            if (this.dealer.bustedOrDiscarded)
                p.resolveBet(1)
            else {
                const diff = p.calcHandTotal() - this.dealer.calcHandTotal()
                if (diff > 0)
                    p.resolveBet(1)
                else if (diff < 0)
                    p.resolveBet(0)
                else
                    p.resolveBet(0.5)
            }
    }

    public numPlayers(): number {
        return this.activePlayers.length
    }

    public getPlayerAt(i: number): Player {
        if (this.activePlayers.length <= i)
            throw new Error("No player here")
        return this.activePlayers[i]
    }

    public getDealer(): Dealer {
        return this.dealer
    }

    public cleanUp(): void {
        // TODO
        this.roundIsOver = true
    }
}

// Constants, enums, etc
const BLACKJACK_MULTIPLIER = 1.5
const NUMBER_OF_DECKS = 6
const CARDS_BEFORE_CUT = 260

const hiLoCountMap = {
    1: -1,
    2: 1,
    3: 1,
    4: 1,
    5: 1,
    6: 1,
    7: 0,
    8: 0,
    9: 0,
    10: -1,
    11: -1,
    12: -1,
    13: -1,
}

const Ill18Indices = {
    insurance: 3,
}