/**
 * Tests for side pot calculation and distribution logic.
 * Covers various scenarios with multiple all-ins and folded players.
 */

import { describe, it, expect } from 'vitest';
import { calculateSidePots, distributePot, Pot } from './sidePots';
import { Player } from '../types/game';

/**
 * Helper function to create a test player.
 */
function createPlayer(
  id: string,
  name: string,
  chips: number,
  totalBet: number,
  isFolded: boolean = false,
  isAllIn: boolean = false
): Player {
  return {
    id,
    name,
    chips,
    holeCards: [],
    isFolded,
    isUser: id === 'user',
    position: parseInt(id.replace(/\D/g, '')) || 0,
    currentBet: 0,
    totalBet,
    hasActed: true,
    isAllIn,
  };
}

describe('calculateSidePots', () => {
  describe('Basic scenarios', () => {
    it('should return empty array when no players have bets', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 100, 0),
        createPlayer('p2', 'Player 2', 100, 0),
      ];

      const pots = calculateSidePots(players);

      expect(pots).toEqual([]);
    });

    it('should create single pot when all players bet same amount', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 50, 50),
        createPlayer('p2', 'Player 2', 50, 50),
        createPlayer('p3', 'Player 3', 50, 50),
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(150); // 50 × 3
      expect(pots[0].eligiblePlayerIds).toHaveLength(3);
      expect(pots[0].eligiblePlayerIds).toContain('p1');
      expect(pots[0].eligiblePlayerIds).toContain('p2');
      expect(pots[0].eligiblePlayerIds).toContain('p3');
    });

    it('should exclude folded players from eligibility but include their bets', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 80, 20, true), // folded after betting 20
        createPlayer('p2', 'Player 2', 50, 50),
        createPlayer('p3', 'Player 3', 50, 50),
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(2);

      // Main pot: 20 from each of 3 players = 60
      expect(pots[0].amount).toBe(60);
      expect(pots[0].eligiblePlayerIds).toHaveLength(2); // p2, p3 (p1 folded)
      expect(pots[0].eligiblePlayerIds).not.toContain('p1');

      // Side pot: remaining 30 from p2 and p3 = 60
      expect(pots[1].amount).toBe(60);
      expect(pots[1].eligiblePlayerIds).toHaveLength(2);
      expect(pots[1].eligiblePlayerIds).toContain('p2');
      expect(pots[1].eligiblePlayerIds).toContain('p3');
    });
  });

  describe('Two-player all-in scenarios', () => {
    it('should handle 2 players all-in at different amounts', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 0, 30, false, true), // all-in for 30
        createPlayer('p2', 'Player 2', 20, 50),             // called with 50
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(2);

      // Main pot: 30 from each player = 60
      expect(pots[0].amount).toBe(60);
      expect(pots[0].eligiblePlayerIds).toContain('p1');
      expect(pots[0].eligiblePlayerIds).toContain('p2');

      // Side pot: remaining 20 from p2 = 20
      expect(pots[1].amount).toBe(20);
      expect(pots[1].eligiblePlayerIds).toHaveLength(1);
      expect(pots[1].eligiblePlayerIds).toContain('p2');
    });

    it('should handle very unequal all-in amounts', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 0, 5, false, true),  // all-in for 5
        createPlayer('p2', 'Player 2', 0, 100, false, false), // bet 100
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(2);

      // Main pot: 5 from each = 10
      expect(pots[0].amount).toBe(10);
      expect(pots[0].eligiblePlayerIds).toHaveLength(2);

      // Side pot: remaining 95 from p2 = 95
      expect(pots[1].amount).toBe(95);
      expect(pots[1].eligiblePlayerIds).toEqual(['p2']);
    });
  });

  describe('Three-player all-in scenarios', () => {
    it('should handle 3 players all-in at different amounts', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 0, 20, false, true),  // all-in for 20
        createPlayer('p2', 'Player 2', 0, 50, false, true),  // all-in for 50
        createPlayer('p3', 'Player 3', 0, 100, false, false), // bet 100
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(3);

      // Main pot: 20 from each of 3 players = 60
      expect(pots[0].amount).toBe(60);
      expect(pots[0].eligiblePlayerIds).toHaveLength(3);
      expect(pots[0].eligiblePlayerIds).toContain('p1');
      expect(pots[0].eligiblePlayerIds).toContain('p2');
      expect(pots[0].eligiblePlayerIds).toContain('p3');

      // Side pot 1: (50-20) from p2 and p3 = 30 × 2 = 60
      expect(pots[1].amount).toBe(60);
      expect(pots[1].eligiblePlayerIds).toHaveLength(2);
      expect(pots[1].eligiblePlayerIds).toContain('p2');
      expect(pots[1].eligiblePlayerIds).toContain('p3');

      // Side pot 2: (100-50) from p3 = 50
      expect(pots[2].amount).toBe(50);
      expect(pots[2].eligiblePlayerIds).toEqual(['p3']);
    });

    it('should handle 3 players with 2 at same all-in level', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 0, 20, false, true),  // all-in for 20
        createPlayer('p2', 'Player 2', 0, 50, false, true),  // all-in for 50
        createPlayer('p3', 'Player 3', 0, 50, false, true),  // all-in for 50
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(2);

      // Main pot: 20 from each of 3 players = 60
      expect(pots[0].amount).toBe(60);
      expect(pots[0].eligiblePlayerIds).toHaveLength(3);

      // Side pot: (50-20) from p2 and p3 = 30 × 2 = 60
      expect(pots[1].amount).toBe(60);
      expect(pots[1].eligiblePlayerIds).toHaveLength(2);
      expect(pots[1].eligiblePlayerIds).toContain('p2');
      expect(pots[1].eligiblePlayerIds).toContain('p3');
    });

    it('should handle complex scenario with one folded player', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 80, 20, true),        // folded after 20
        createPlayer('p2', 'Player 2', 0, 50, false, true),  // all-in for 50
        createPlayer('p3', 'Player 3', 0, 100, false, false), // bet 100
        createPlayer('p4', 'Player 4', 0, 100, false, false), // bet 100
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(3);

      // Main pot: 20 from each of 4 players = 80 (eligible: p2, p3, p4)
      expect(pots[0].amount).toBe(80);
      expect(pots[0].eligiblePlayerIds).toHaveLength(3);
      expect(pots[0].eligiblePlayerIds).not.toContain('p1');

      // Side pot 1: (50-20) from p2, p3, p4 = 30 × 3 = 90 (eligible: p2, p3, p4)
      expect(pots[1].amount).toBe(90);
      expect(pots[1].eligiblePlayerIds).toHaveLength(3);
      expect(pots[1].eligiblePlayerIds).toContain('p2');
      expect(pots[1].eligiblePlayerIds).toContain('p3');
      expect(pots[1].eligiblePlayerIds).toContain('p4');

      // Side pot 2: (100-50) from p3, p4 = 50 × 2 = 100 (eligible: p3, p4)
      expect(pots[2].amount).toBe(100);
      expect(pots[2].eligiblePlayerIds).toHaveLength(2);
      expect(pots[2].eligiblePlayerIds).toContain('p3');
      expect(pots[2].eligiblePlayerIds).toContain('p4');
    });
  });

  describe('Four-player scenarios', () => {
    it('should handle 4 players with cascading all-ins', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 0, 10, false, true),   // all-in for 10
        createPlayer('p2', 'Player 2', 0, 30, false, true),   // all-in for 30
        createPlayer('p3', 'Player 3', 0, 60, false, true),   // all-in for 60
        createPlayer('p4', 'Player 4', 0, 100, false, false), // bet 100
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(4);

      // Main pot: 10 × 4 = 40
      expect(pots[0].amount).toBe(40);
      expect(pots[0].eligiblePlayerIds).toHaveLength(4);

      // Side pot 1: (30-10) × 3 = 60
      expect(pots[1].amount).toBe(60);
      expect(pots[1].eligiblePlayerIds).toHaveLength(3);
      expect(pots[1].eligiblePlayerIds).not.toContain('p1');

      // Side pot 2: (60-30) × 2 = 60
      expect(pots[2].amount).toBe(60);
      expect(pots[2].eligiblePlayerIds).toHaveLength(2);
      expect(pots[2].eligiblePlayerIds).toContain('p3');
      expect(pots[2].eligiblePlayerIds).toContain('p4');

      // Side pot 3: (100-60) × 1 = 40
      expect(pots[3].amount).toBe(40);
      expect(pots[3].eligiblePlayerIds).toEqual(['p4']);
    });

    it('should handle all players folding except one', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 90, 10, true),  // folded
        createPlayer('p2', 'Player 2', 90, 10, true),  // folded
        createPlayer('p3', 'Player 3', 90, 10, true),  // folded
        createPlayer('p4', 'Player 4', 60, 40),        // won by default
      ];

      const pots = calculateSidePots(players);

      // Main pot: 10 from each of 4 = 40, but only p4 eligible
      expect(pots).toHaveLength(2);
      expect(pots[0].amount).toBe(40);
      expect(pots[0].eligiblePlayerIds).toEqual(['p4']);

      // Side pot: remaining 30 from p4
      expect(pots[1].amount).toBe(30);
      expect(pots[1].eligiblePlayerIds).toEqual(['p4']);
    });
  });

  describe('Edge cases', () => {
    it('should handle player with 0 bet correctly', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 100, 0, true),  // folded pre-flop
        createPlayer('p2', 'Player 2', 50, 50),
        createPlayer('p3', 'Player 3', 50, 50),
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(100);
      expect(pots[0].eligiblePlayerIds).toHaveLength(2);
      expect(pots[0].eligiblePlayerIds).not.toContain('p1');
    });

    it('should handle single player with bet (everyone else folded)', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 90, 10, true),
        createPlayer('p2', 'Player 2', 90, 10, true),
        createPlayer('p3', 'Player 3', 60, 40, false),
      ];

      const pots = calculateSidePots(players);

      expect(pots).toHaveLength(2);

      // Main pot level where all contributed
      expect(pots[0].amount).toBe(30);
      expect(pots[0].eligiblePlayerIds).toEqual(['p3']);

      // Side pot for additional amount
      expect(pots[1].amount).toBe(30);
      expect(pots[1].eligiblePlayerIds).toEqual(['p3']);
    });

    it('should calculate correct pot total matching sum of all bets', () => {
      const players: Player[] = [
        createPlayer('p1', 'Player 1', 0, 25, false, true),
        createPlayer('p2', 'Player 2', 0, 50, false, true),
        createPlayer('p3', 'Player 3', 0, 75, false, false),
      ];

      const pots = calculateSidePots(players);
      const totalPotAmount = pots.reduce((sum, pot) => sum + pot.amount, 0);
      const totalBets = players.reduce((sum, p) => sum + p.totalBet, 0);

      expect(totalPotAmount).toBe(totalBets);
      expect(totalPotAmount).toBe(150); // 25 + 50 + 75
    });
  });
});

describe('distributePot', () => {
  let players: Player[];

  beforeEach(() => {
    players = [
      createPlayer('p1', 'Player 1', 100, 0),
      createPlayer('p2', 'Player 2', 100, 0),
      createPlayer('p3', 'Player 3', 100, 0),
    ];
  });

  it('should give entire pot to single winner', () => {
    const pot: Pot = {
      amount: 150,
      eligiblePlayerIds: ['p1', 'p2', 'p3'],
    };

    distributePot(pot, ['p1'], players);

    expect(players[0].chips).toBe(250); // 100 + 150
    expect(players[1].chips).toBe(100);
    expect(players[2].chips).toBe(100);
  });

  it('should split pot evenly between two winners', () => {
    const pot: Pot = {
      amount: 100,
      eligiblePlayerIds: ['p1', 'p2'],
    };

    distributePot(pot, ['p1', 'p2'], players);

    expect(players[0].chips).toBe(150); // 100 + 50
    expect(players[1].chips).toBe(150); // 100 + 50
    expect(players[2].chips).toBe(100);
  });

  it('should split pot evenly between three winners', () => {
    const pot: Pot = {
      amount: 150,
      eligiblePlayerIds: ['p1', 'p2', 'p3'],
    };

    distributePot(pot, ['p1', 'p2', 'p3'], players);

    expect(players[0].chips).toBe(150); // 100 + 50
    expect(players[1].chips).toBe(150); // 100 + 50
    expect(players[2].chips).toBe(150); // 100 + 50
  });

  it('should give remainder to first winner when pot doesnt divide evenly', () => {
    const pot: Pot = {
      amount: 100,
      eligiblePlayerIds: ['p1', 'p2', 'p3'],
    };

    distributePot(pot, ['p1', 'p2', 'p3'], players);

    // 100 / 3 = 33 remainder 1
    expect(players[0].chips).toBe(134); // 100 + 33 + 1 (remainder)
    expect(players[1].chips).toBe(133); // 100 + 33
    expect(players[2].chips).toBe(133); // 100 + 33
  });

  it('should handle pot with remainder of 2', () => {
    const pot: Pot = {
      amount: 101,
      eligiblePlayerIds: ['p1', 'p2', 'p3'],
    };

    distributePot(pot, ['p1', 'p2', 'p3'], players);

    // 101 / 3 = 33 remainder 2
    // Only first winner gets remainder
    expect(players[0].chips).toBe(135); // 100 + 33 + 2 (remainder)
    expect(players[1].chips).toBe(133); // 100 + 33
    expect(players[2].chips).toBe(133); // 100 + 33
  });

  it('should throw error when no winners provided', () => {
    const pot: Pot = {
      amount: 100,
      eligiblePlayerIds: ['p1', 'p2'],
    };

    expect(() => distributePot(pot, [], players)).toThrow('Cannot distribute pot with no winners');
  });

  it('should throw error when winner not found in players array', () => {
    const pot: Pot = {
      amount: 100,
      eligiblePlayerIds: ['p1', 'p2'],
    };

    expect(() => distributePot(pot, ['p99'], players)).toThrow('Winner not found: p99');
  });

  it('should handle distributing to player not in eligible list (showdown logic handles eligibility)', () => {
    const pot: Pot = {
      amount: 100,
      eligiblePlayerIds: ['p1', 'p2'], // p3 not eligible
    };

    // But we can still award to p3 if showdown logic determines they won
    // distributePot doesn't validate eligibility, just distributes
    distributePot(pot, ['p3'], players);

    expect(players[2].chips).toBe(200); // 100 + 100
  });

  it('should preserve chip totals across multiple pot distributions', () => {
    const mainPot: Pot = {
      amount: 60,
      eligiblePlayerIds: ['p1', 'p2', 'p3'],
    };

    const sidePot: Pot = {
      amount: 40,
      eligiblePlayerIds: ['p2', 'p3'],
    };

    // p1 wins main pot
    distributePot(mainPot, ['p1'], players);
    expect(players[0].chips).toBe(160);

    // p2 wins side pot
    distributePot(sidePot, ['p2'], players);
    expect(players[1].chips).toBe(140);

    expect(players[2].chips).toBe(100);

    // Total chips should be preserved (3 × 100 initial + pots)
    const totalChips = players.reduce((sum, p) => sum + p.chips, 0);
    expect(totalChips).toBe(400); // 300 initial + 100 in pots
  });
});
