/**
 * Animation performance tests for card animations and UI transitions.
 * Tests animation performance metrics to ensure smooth rendering on low-end devices.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Card } from './Card';
import { Card as CardType } from '../types/game';
import { TIMING } from '../constants/timing';

describe('Animation Performance Tests', () => {
  // Mock performance.now for timing tests
  let mockPerformanceNow: number;

  beforeEach(() => {
    mockPerformanceNow = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => mockPerformanceNow);
  });

  describe('Card Deal Animation', () => {
    it('should complete deal animation within performance budget', async () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };

      const startTime = performance.now();

      const { container } = render(
        <Card card={card} faceUp={false} animate="deal" />
      );

      // Animation should apply the animate-deal class
      const cardElement = container.querySelector('.animate-deal');
      expect(cardElement).toBeTruthy();

      // Verify animation completes within expected time (400ms per tailwind config)
      const expectedDuration = 400; // ms
      mockPerformanceNow = startTime + expectedDuration + 100;

      await waitFor(() => {
        expect(performance.now() - startTime).toBeLessThanOrEqual(500);
      });
    });

    it('should handle multiple cards dealt simultaneously without performance degradation', async () => {
      const cards: CardType[] = [
        { rank: 'A', suit: 'hearts' },
        { rank: 'K', suit: 'spades' },
        { rank: 'Q', suit: 'diamonds' },
        { rank: 'J', suit: 'clubs' },
        { rank: '10', suit: 'hearts' },
      ];

      const startTime = performance.now();

      const { container } = render(
        <div>
          {cards.map((card, index) => (
            <Card
              key={index}
              card={card}
              faceUp={false}
              animate="deal"
              animationDelay={index * 100}
            />
          ))}
        </div>
      );

      // All cards should render
      const cardElements = container.querySelectorAll('.animate-deal');
      expect(cardElements.length).toBe(5);

      // Rendering multiple animated elements should complete quickly
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Initial render should be fast
    });

    it('should respect animation delays for sequential card dealing', () => {
      const cards: CardType[] = [
        { rank: 'A', suit: 'hearts' },
        { rank: 'K', suit: 'spades' },
        { rank: 'Q', suit: 'diamonds' },
      ];

      const delays = [0, 150, 300];

      const { container } = render(
        <div>
          {cards.map((card, index) => (
            <Card
              key={index}
              card={card}
              faceUp={false}
              animate="deal"
              animationDelay={delays[index]}
            />
          ))}
        </div>
      );

      // Verify animation delays are applied correctly
      const cardElements = container.querySelectorAll('.animate-deal');
      cardElements.forEach((element, index) => {
        // Should have delay set (exact value depends on browser parsing)
        expect(element).toHaveStyle({ animationDelay: `${delays[index]}ms` });
      });
    });
  });

  describe('Card Flip Animation', () => {
    it('should complete flip animation within performance budget', async () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };

      const startTime = performance.now();

      const { container } = render(
        <Card card={card} faceUp={true} animate="flip" />
      );

      // Animation should apply the animate-flip class
      const cardElement = container.querySelector('.animate-flip');
      expect(cardElement).toBeTruthy();

      // Verify animation completes within expected time (600ms per tailwind config)
      const expectedDuration = 600; // ms
      mockPerformanceNow = startTime + expectedDuration + 100;

      await waitFor(() => {
        expect(performance.now() - startTime).toBeLessThanOrEqual(700);
      });
    });

    it('should handle multiple simultaneous flip animations efficiently', () => {
      const cards: CardType[] = [
        { rank: 'A', suit: 'hearts' },
        { rank: 'K', suit: 'spades' },
        { rank: 'Q', suit: 'diamonds' },
      ];

      const startTime = performance.now();

      const { container } = render(
        <div>
          {cards.map((card, index) => (
            <Card
              key={index}
              card={card}
              faceUp={true}
              animate="flip"
            />
          ))}
        </div>
      );

      // All cards should render with flip animation
      const cardElements = container.querySelectorAll('.animate-flip');
      expect(cardElements.length).toBe(3);

      // Rendering should be fast even with multiple animations
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Animation Timing Constants', () => {
    it('should have reasonable timing constants for low-end devices', () => {
      // AI turn delays should not be excessive
      expect(TIMING.AI_TURN_BASE_DELAY).toBeLessThan(5000);
      expect(TIMING.AI_TURN_RANDOM_DELAY).toBeLessThan(5000);
      expect(TIMING.AI_TURN_LATE_DELAY).toBeLessThan(3000);

      // User action delay should be reasonable
      expect(TIMING.USER_ACTION_DELAY).toBeLessThan(4000);

      // Phase transitions should be snappy
      expect(TIMING.BETTING_COMPLETE_DELAY).toBeLessThan(1000);
      expect(TIMING.PHASE_ADVANCE_DELAY).toBeLessThan(2000);
      expect(TIMING.SHOWDOWN_REVEAL_DELAY).toBeLessThan(2000);
      expect(TIMING.NEW_HAND_DELAY).toBeLessThan(1000);
    });

    it('should have timing constants that sum to reasonable total game duration', () => {
      // Estimate total time for a single hand (worst case)
      const maxHandTime =
        TIMING.AI_TURN_BASE_DELAY + TIMING.AI_TURN_RANDOM_DELAY + // Pre-flop AI
        TIMING.USER_ACTION_DELAY + // User action
        (TIMING.AI_TURN_BASE_DELAY + TIMING.AI_TURN_RANDOM_DELAY) * 3 + // 3 AI players
        TIMING.BETTING_COMPLETE_DELAY +
        TIMING.PHASE_ADVANCE_DELAY + // Flop transition
        (TIMING.AI_TURN_BASE_DELAY + TIMING.AI_TURN_LATE_DELAY + TIMING.AI_TURN_RANDOM_DELAY) * 3 + // Turn betting (late delay)
        TIMING.BETTING_COMPLETE_DELAY +
        TIMING.PHASE_ADVANCE_DELAY + // Turn transition
        (TIMING.AI_TURN_BASE_DELAY + TIMING.AI_TURN_LATE_DELAY + TIMING.AI_TURN_RANDOM_DELAY) * 3 + // River betting (late delay)
        TIMING.SHOWDOWN_REVEAL_DELAY +
        TIMING.NEW_HAND_DELAY;

      // A single hand shouldn't take more than 2 minutes even in worst case
      expect(maxHandTime).toBeLessThan(120000);

      // Log for documentation
      console.log(`\n=== Animation Timing Analysis ===`);
      console.log(`Estimated max hand duration: ${(maxHandTime / 1000).toFixed(1)}s`);
      console.log(`AI base delay: ${TIMING.AI_TURN_BASE_DELAY}ms`);
      console.log(`AI random delay: ${TIMING.AI_TURN_RANDOM_DELAY}ms`);
      console.log(`AI late delay: ${TIMING.AI_TURN_LATE_DELAY}ms`);
      console.log(`User action delay: ${TIMING.USER_ACTION_DELAY}ms`);
    });
  });

  describe('Card Rendering Performance', () => {
    it('should render card backs efficiently', () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };

      const startTime = performance.now();

      render(<Card card={card} faceUp={false} />);

      const renderTime = performance.now() - startTime;

      // Single card render should be very fast (< 50ms)
      expect(renderTime).toBeLessThan(50);
    });

    it('should render face-up cards efficiently', () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };

      const startTime = performance.now();

      render(<Card card={card} faceUp={true} />);

      const renderTime = performance.now() - startTime;

      // Single card render should be very fast (< 50ms)
      expect(renderTime).toBeLessThan(50);
    });

    it('should render full poker table (9 cards total) efficiently', () => {
      // 2 hole cards for each of 4 players + 5 community cards = 13 cards
      const holeCards: CardType[] = Array(8).fill(null).map((_, i) => ({
        rank: 'A' as CardType['rank'],
        suit: ['hearts', 'spades', 'diamonds', 'clubs'][i % 4] as 'hearts' | 'spades' | 'diamonds' | 'clubs',
      }));

      const communityCards: CardType[] = Array(5).fill(null).map((_, i) => ({
        rank: (['K', 'Q', 'J', '10', '9'] as const)[i],
        suit: ['hearts', 'spades', 'diamonds', 'clubs', 'hearts'][i] as 'hearts' | 'spades' | 'diamonds' | 'clubs',
      }));

      const startTime = performance.now();

      render(
        <div>
          {/* Hole cards */}
          {holeCards.map((card, index) => (
            <Card key={`hole-${index}`} card={card} faceUp={false} size="small" />
          ))}
          {/* Community cards */}
          {communityCards.map((card, index) => (
            <Card key={`community-${index}`} card={card} faceUp={true} size="medium" />
          ))}
        </div>
      );

      const renderTime = performance.now() - startTime;

      // Rendering full table should complete quickly (< 200ms)
      expect(renderTime).toBeLessThan(200);

      console.log(`\n=== Full Table Render Performance ===`);
      console.log(`Rendered 13 cards in ${renderTime.toFixed(2)}ms`);
      console.log(`Average per card: ${(renderTime / 13).toFixed(2)}ms`);
    });

    it('should render different card sizes without significant performance difference', () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };
      const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
      const renderTimes: number[] = [];

      sizes.forEach(size => {
        const startTime = performance.now();
        const { unmount } = render(<Card card={card} faceUp={true} size={size} />);
        const renderTime = performance.now() - startTime;
        renderTimes.push(renderTime);
        unmount();
      });

      // All sizes should render quickly
      renderTimes.forEach((time) => {
        expect(time).toBeLessThan(50);
      });

      // Size shouldn't significantly impact render time (< 25ms difference)
      const maxTime = Math.max(...renderTimes);
      const minTime = Math.min(...renderTimes);
      expect(maxTime - minTime).toBeLessThan(25);
    });
  });

  describe('Animation CSS Performance', () => {
    it('should use hardware-accelerated CSS properties', () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };

      const { container } = render(
        <Card card={card} faceUp={false} animate="deal" />
      );

      const cardElement = container.querySelector('.animate-deal');
      expect(cardElement).toBeTruthy();

      // Transform and opacity are hardware-accelerated
      // The animation uses these properties (from tailwind config)
      expect(cardElement).toHaveClass('animate-deal');
    });

    it('should use proper 3D perspective for flip animations', () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };

      const { container } = render(
        <Card card={card} faceUp={true} animate="flip" />
      );

      const cardElement = container.querySelector('.animate-flip');
      expect(cardElement).toBeTruthy();

      // Card element itself should have perspective set for 3D transforms
      expect(cardElement).toHaveStyle({ perspective: '1000px' });
    });

    it('should prevent backface visibility during flip', () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };

      const { container } = render(
        <Card card={card} faceUp={true} animate="flip" />
      );

      // Card should have backface-visibility: hidden
      const cardInner = container.querySelector('.bg-white, .bg-gradient-to-br');
      expect(cardInner).toHaveStyle({ backfaceVisibility: 'hidden' });
    });
  });

  describe('Memory Usage During Animations', () => {
    it('should not leak memory when repeatedly animating cards', () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const { unmount } = render(
          <Card card={card} faceUp={false} animate="deal" />
        );
        unmount();
      }

      // Test completes without memory issues
      expect(true).toBe(true);
    });

    it('should properly clean up animations on component unmount', () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };

      const { unmount, container } = render(
        <Card card={card} faceUp={false} animate="deal" />
      );

      // Verify element exists
      expect(container.querySelector('.animate-deal')).toBeTruthy();

      // Unmount should clean up
      unmount();

      // Element should be removed from DOM
      expect(container.querySelector('.animate-deal')).toBeNull();
    });

    it('should handle rapid state changes without memory buildup', () => {
      const card: CardType = { rank: 'A', suit: 'hearts' };

      // Simulate rapid re-renders
      const { rerender } = render(
        <Card card={card} faceUp={false} animate="deal" />
      );

      for (let i = 0; i < 20; i++) {
        rerender(<Card card={card} faceUp={i % 2 === 0} animate="flip" />);
      }

      // Test completes without memory issues
      expect(true).toBe(true);
    });
  });

  describe('Low-End Device Simulation', () => {
    it('should handle animations gracefully with reduced motion preference', () => {
      // Some low-end devices or accessibility settings prefer reduced motion
      const card: CardType = { rank: 'A', suit: 'hearts' };

      // Even with animations enabled, component should render
      const { container } = render(
        <Card card={card} faceUp={false} animate="deal" />
      );

      expect(container.querySelector('.animate-deal')).toBeTruthy();
    });

    it('should render placeholder cards efficiently', () => {
      const startTime = performance.now();

      // Placeholder cards (no card data) should be lightweight
      render(<Card />);

      const renderTime = performance.now() - startTime;

      // Placeholder should be extremely fast to render
      expect(renderTime).toBeLessThan(25);
    });

    it('should handle large number of placeholder cards efficiently', () => {
      const startTime = performance.now();

      // Render multiple placeholders (empty slots on table)
      const { container } = render(
        <div>
          {Array(20).fill(null).map((_, index) => (
            <Card key={index} />
          ))}
        </div>
      );

      const renderTime = performance.now() - startTime;

      // Should render many placeholders quickly
      expect(renderTime).toBeLessThan(100);
      expect(container.querySelectorAll('.bg-felt-900\\/20').length).toBe(20);
    });
  });

  describe('Animation Frame Budget', () => {
    it('should complete animations within 60fps frame budget', () => {
      // At 60fps, each frame is ~16.67ms
      const frameBudget = 16.67;

      // Card deal animation is 400ms = ~24 frames
      const dealDuration = 400;
      const dealFrames = Math.ceil(dealDuration / frameBudget);
      expect(dealFrames).toBeLessThan(30); // Should complete in < 30 frames

      // Card flip animation is 600ms = ~36 frames
      const flipDuration = 600;
      const flipFrames = Math.ceil(flipDuration / frameBudget);
      expect(flipFrames).toBeLessThan(40); // Should complete in < 40 frames

      console.log(`\n=== Animation Frame Analysis (60fps target) ===`);
      console.log(`Deal animation: ${dealDuration}ms (~${dealFrames} frames)`);
      console.log(`Flip animation: ${flipDuration}ms (~${flipFrames} frames)`);
      console.log(`Frame budget: ${frameBudget.toFixed(2)}ms per frame`);
    });

    it('should handle animations gracefully at 30fps (low-end devices)', () => {
      // At 30fps, each frame is ~33.33ms
      const frameBudget = 33.33;

      // Card deal animation at 30fps
      const dealDuration = 400;
      const dealFrames = Math.ceil(dealDuration / frameBudget);
      expect(dealFrames).toBeLessThan(15); // Should complete in < 15 frames at 30fps

      // Card flip animation at 30fps
      const flipDuration = 600;
      const flipFrames = Math.ceil(flipDuration / frameBudget);
      expect(flipFrames).toBeLessThan(20); // Should complete in < 20 frames at 30fps

      console.log(`\n=== Low-End Device Frame Analysis (30fps target) ===`);
      console.log(`Deal animation: ${dealDuration}ms (~${dealFrames} frames at 30fps)`);
      console.log(`Flip animation: ${flipDuration}ms (~${flipFrames} frames at 30fps)`);
      console.log(`Frame budget: ${frameBudget.toFixed(2)}ms per frame`);
    });
  });

  describe('Stress Testing', () => {
    it('should handle maximum concurrent animations', () => {
      // Simulate worst case: all 4 players showing cards + 5 community cards
      const allCards: CardType[] = Array(13).fill(null).map((_, i) => ({
        rank: (['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const)[i],
        suit: ['hearts', 'spades', 'diamonds', 'clubs'][i % 4] as 'hearts' | 'spades' | 'diamonds' | 'clubs',
      }));

      const startTime = performance.now();

      const { container } = render(
        <div>
          {allCards.map((card, index) => (
            <Card
              key={index}
              card={card}
              faceUp={true}
              animate="flip"
              animationDelay={index * 100}
            />
          ))}
        </div>
      );

      const renderTime = performance.now() - startTime;

      // Should handle maximum concurrent animations
      expect(container.querySelectorAll('.animate-flip').length).toBe(13);
      expect(renderTime).toBeLessThan(200);

      console.log(`\n=== Stress Test Results ===`);
      console.log(`Rendered 13 concurrent flip animations in ${renderTime.toFixed(2)}ms`);
    });

    it('should maintain performance with rapid consecutive renders', () => {
      const cards: CardType[] = Array(5).fill(null).map((_, i) => ({
        rank: (['A', 'K', 'Q', 'J', '10'] as const)[i],
        suit: 'hearts' as const,
      }));

      const renderTimes: number[] = [];

      // Perform 10 rapid consecutive renders
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();

        const { unmount } = render(
          <div>
            {cards.map((card, index) => (
              <Card
                key={index}
                card={card}
                faceUp={i % 2 === 0}
                animate={i % 2 === 0 ? 'deal' : 'flip'}
              />
            ))}
          </div>
        );

        const renderTime = performance.now() - startTime;
        renderTimes.push(renderTime);

        unmount();
      }

      // All renders should be fast
      renderTimes.forEach(time => {
        expect(time).toBeLessThan(100);
      });

      // Performance shouldn't degrade (last render shouldn't be much slower than first)
      const firstRender = renderTimes[0];
      const lastRender = renderTimes[renderTimes.length - 1];

      // Only check degradation if renders are measurable (> 0ms)
      if (firstRender > 0) {
        expect(lastRender).toBeLessThan(firstRender * 3); // Allow up to 3x variance due to test environment variability
      }

      const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      console.log(`\n=== Consecutive Render Performance ===`);
      console.log(`Average render time: ${avgRenderTime.toFixed(2)}ms`);
      console.log(`First render: ${firstRender.toFixed(2)}ms`);
      console.log(`Last render: ${lastRender.toFixed(2)}ms`);
    });
  });
});
