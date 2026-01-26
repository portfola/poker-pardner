/**
 * Cowboy-themed narration utility for the poker tutorial.
 * Generates personality-filled narration text for game events.
 */

import { Player, GameState, BettingAction, Card, GamePhase, HandEvaluation } from '../types/game';
import { getBestFiveCardHand, getBestHandFromSix, evaluateHand } from './handEvaluator';
import { describeHand, evaluateHandStrength } from './handStrength';

// Cowboy phrases for variety
const GREETINGS = [
  "Howdy, partner!",
  "Well now,",
  "Listen up, pardner.",
  "Here we go!",
  "Alright folks,",
];

const TRANSITIONS = [
  "Now then,",
  "Alrighty,",
  "So,",
  "Well,",
  "Here's the thing:",
];

/**
 * Gets a random element from an array.
 */
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates narration for the start of a new hand.
 */
export function generateHandStartNarration(
  dealerName: string,
  smallBlindName: string,
  bigBlindName: string,
  smallBlindAmount: number,
  bigBlindAmount: number
): string {
  const greeting = randomFrom(GREETINGS);
  return `${greeting} New hand starting! ${dealerName} has the dealer button. ${smallBlindName} posts the small blind of $${smallBlindAmount}, and ${bigBlindName} posts the big blind of $${bigBlindAmount}. Cards are dealt - take a look at your hand!`;
}

/**
 * Generates reasoning for why an AI made a decision.
 * This provides educational insight into poker strategy.
 */
function generateAIReasoning(
  player: Player,
  action: BettingAction,
  gameState: GameState,
  handStrength: number
): string {
  const { communityCards, pot, currentBet } = gameState;
  const amountToCall = currentBet - player.currentBet;
  const isPreFlop = communityCards.length === 0;

  // Strength descriptions
  const strengthDesc =
    handStrength >= 6 ? "a very strong hand" :
    handStrength >= 4 ? "a solid hand" :
    handStrength >= 2 ? "a decent hand" :
    "not much to work with";

  if (action === 'fold') {
    if (amountToCall > player.chips / 4) {
      return `With ${strengthDesc} and a big bet to call, foldin' is the smart play here.`;
    }
    return `With ${strengthDesc}, it ain't worth chasin'. Better to wait for a better spot.`;
  }

  if (action === 'check') {
    if (handStrength >= 4) {
      return `They're playin' it sneaky with ${strengthDesc}. Tryin' to trap someone!`;
    }
    return `No sense bettin' with ${strengthDesc}. A free card never hurt nobody.`;
  }

  if (action === 'call') {
    if (isPreFlop) {
      return `With ${strengthDesc}, they want to see the flop and see what develops.`;
    }
    const potOdds = amountToCall > 0 ? (pot / amountToCall).toFixed(1) : "good";
    if (handStrength >= 4) {
      return `They've got ${strengthDesc} and the pot odds look good. Smart call.`;
    }
    return `The pot's offerin' ${potOdds} to 1, so even with ${strengthDesc}, the price is right.`;
  }

  if (action === 'raise') {
    if (handStrength >= 6) {
      return `They've got ${strengthDesc}! They're lookin' to build that pot.`;
    }
    if (handStrength >= 4) {
      return `With ${strengthDesc}, they're sendin' a message - back off or pay up!`;
    }
    // Bluff
    return `Hmm, raisin' with ${strengthDesc}? Either they know somethin' we don't, or they're bluffin'!`;
  }

  return "Interestin' move there.";
}

/**
 * Generates narration for an AI player's action.
 */
export function generateAIActionNarration(
  player: Player,
  action: BettingAction,
  amount: number | undefined,
  gameState: GameState,
  handStrength: number
): { message: string; reasoning: string } {
  const transition = randomFrom(TRANSITIONS);
  let actionText: string;

  switch (action) {
    case 'fold':
      actionText = `${player.name} throws their cards away - they're out of this hand.`;
      break;
    case 'check':
      actionText = `${player.name} taps the table - checkin' to see what happens next.`;
      break;
    case 'call': {
      const amountToCall = gameState.currentBet - player.currentBet;
      actionText = `${player.name} tosses in $${amountToCall} to stay in the hand.`;
      break;
    }
    case 'raise':
      actionText = `${player.name} raises to $${amount}! Things are heatin' up!`;
      break;
    default:
      actionText = `${player.name} makes their move.`;
  }

  const reasoning = generateAIReasoning(player, action, gameState, handStrength);

  return {
    message: `${transition} ${actionText}`,
    reasoning,
  };
}

/**
 * Generates narration for a phase transition (flop, turn, river).
 */
export function generatePhaseNarration(
  phase: GamePhase,
  cards: Card[]
): string {
  const cardNames = cards.map(c => {
    const suitNames: Record<string, string> = {
      hearts: 'hearts',
      diamonds: 'diamonds',
      clubs: 'clubs',
      spades: 'spades',
    };
    return `${c.rank} of ${suitNames[c.suit]}`;
  }).join(', ');

  switch (phase) {
    case 'flop':
      return `Here comes the flop, partner! Three cards hittin' the felt: ${cardNames}. This is where hands are made or broken!`;
    case 'turn':
      return `The turn card is revealed: ${cardNames}. The plot thickens! Only one more card to come.`;
    case 'river':
      return `And the river shows: ${cardNames}. This is it, folks - last chance to make your hand!`;
    default:
      return `New cards on the board: ${cardNames}.`;
  }
}

/**
 * Evaluates the user's hand and generates advice for their turn.
 */
export function generateUserTurnNarration(
  player: Player,
  gameState: GameState
): { message: string; handStrength: string; advice: string } {
  const { communityCards, currentBet, pot } = gameState;
  const amountToCall = currentBet - player.currentBet;

  // Evaluate hand strength
  let handDescription: string;
  let strengthLevel: 'weak' | 'medium' | 'strong';

  if (communityCards.length === 0) {
    // Pre-flop
    const card1 = player.holeCards[0];
    const card2 = player.holeCards[1];
    const isPair = card1.rank === card2.rank;
    const suited = card1.suit === card2.suit;
    const highRanks = ['A', 'K', 'Q', 'J'];
    const hasHigh = highRanks.includes(card1.rank) || highRanks.includes(card2.rank);

    if (isPair) {
      handDescription = `Pocket ${card1.rank}s`;
      strengthLevel = highRanks.includes(card1.rank) ? 'strong' : 'medium';
    } else if (hasHigh && suited) {
      handDescription = `${card1.rank}-${card2.rank} suited`;
      strengthLevel = 'medium';
    } else if (hasHigh) {
      handDescription = `${card1.rank}-${card2.rank}`;
      strengthLevel = 'weak';
    } else {
      handDescription = `${card1.rank}-${card2.rank}`;
      strengthLevel = 'weak';
    }
  } else {
    // Post-flop - evaluate actual hand
    let evaluation: HandEvaluation;
    const totalCards = player.holeCards.length + communityCards.length;

    if (totalCards === 7) {
      evaluation = getBestFiveCardHand(player.holeCards, communityCards);
    } else if (totalCards === 6) {
      const allCards = [...player.holeCards, ...communityCards];
      evaluation = getBestHandFromSix(allCards);
    } else {
      const allCards = [...player.holeCards, ...communityCards];
      evaluation = evaluateHand(allCards);
    }

    handDescription = describeHand(evaluation);
    strengthLevel = evaluateHandStrength(evaluation);
  }

  // Generate cowboy-style advice
  let advice: string;
  const strengthColors = {
    weak: 'not too strong',
    medium: 'decent',
    strong: 'mighty fine',
  };

  if (amountToCall === 0) {
    // Can check
    if (strengthLevel === 'strong') {
      advice = `Your hand is ${strengthColors[strengthLevel]}! I'd consider raisin' to build that pot. But checkin' ain't bad neither - might rope in some callers.`;
    } else if (strengthLevel === 'medium') {
      advice = `You've got a ${strengthColors[strengthLevel]} hand. Checkin' is safe, but a bet might take down the pot right here.`;
    } else {
      advice = `Your hand is ${strengthColors[strengthLevel]} right now. Check and see if ya can improve on the cheap.`;
    }
  } else {
    // Must call or fold
    const potOdds = pot > 0 ? Math.round((amountToCall / (pot + amountToCall)) * 100) : 0;

    if (strengthLevel === 'strong') {
      advice = `You're sittin' pretty with a ${strengthColors[strengthLevel]} hand! Raisin' would put the pressure on. At minimum, call to keep 'em guessin'.`;
    } else if (strengthLevel === 'medium') {
      advice = `Your hand is ${strengthColors[strengthLevel]}. You're payin' $${amountToCall} for a chance at a $${pot} pot (${potOdds}% pot odds). Callin' seems reasonable if the price is right.`;
    } else {
      if (potOdds < 20) {
        advice = `Your hand is ${strengthColors[strengthLevel]}, but the pot odds ain't bad (${potOdds}%). Might be worth a cheap call.`;
      } else {
        advice = `Partner, your hand is ${strengthColors[strengthLevel]} and the bet is steep. Foldin' ain't shameful - sometimes the smart move is walkin' away.`;
      }
    }
  }

  const strengthEmoji = strengthLevel === 'strong' ? 'strong' : strengthLevel === 'medium' ? 'medium' : 'weak';

  return {
    message: `It's your play now, partner. Take your time and think it through.`,
    handStrength: `${handDescription} (${strengthEmoji} strength)`,
    advice,
  };
}

/**
 * Generates narration for when the user takes an action.
 */
export function generateUserActionNarration(
  action: BettingAction,
  amount?: number
): string {
  switch (action) {
    case 'fold':
      return `You've decided to fold. No shame in livin' to fight another hand, partner.`;
    case 'check':
      return `You check, keepin' your options open. Let's see what the others do.`;
    case 'call':
      return `You toss in the chips to call. Stayin' in the game - smart move if you've got somethin' workin'.`;
    case 'raise':
      return `You raise to $${amount}! Now that's showin' some gumption! Let's see who's got the nerve to call.`;
    default:
      return `You've made your move. Let's see how it plays out.`;
  }
}

/**
 * Generates narration for the showdown.
 */
export function generateShowdownNarration(): string {
  return `Time to show 'em what you got! All cards on the table, folks. Let's see who rides away with the pot!`;
}

/**
 * Generates narration for betting round completion.
 */
export function generateBettingCompleteNarration(): string {
  const phrases = [
    "Bettin's done for this round.",
    "Everyone's had their say.",
    "Alright, bettin' round's over.",
    "That's it for this round of bettin'.",
  ];
  return randomFrom(phrases);
}
