import React, { useEffect } from 'react';
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from '@rive-app/react-canvas';

const ROLL_ANIM_MS = 1000; // 1 second animation

function RiveDice({
  rolling,
  onEnd,
  outcome,
  src = '/bgremoveddice.riv',
  size = 200,
}) {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: false,
    stateMachines: 'State Machine 1',
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  const rollTrigger = useStateMachineInput(
    rive,
    'State Machine 1',
    'roll',
    Number(outcome)
  );

  // Keep the die displaying the last outcome when not rolling
  useEffect(() => {
    if (!rive) return;
    try {
      // Set numeric value if available (to hold final face)
      if (rollTrigger && typeof rollTrigger.value !== 'undefined') {
        rollTrigger.value = Number(outcome ?? 1);
      }
      // Keep machine paused when not rolling so face persists
      if (!rolling) {
        try {
          rive.pause();
        } catch (e) {
          console.log('Rive pause error:', e);
        }
      }
    } catch (e) {
      console.log('Rive state error:', e);
    }
  }, [rive, rollTrigger, outcome, rolling]);

  // Trigger rolling animation
  useEffect(() => {
    if (!rive || !rolling) return;
    
    try {
      // Ensure outcome is set before triggering animation
      if (rollTrigger && typeof rollTrigger.value !== 'undefined') {
        rollTrigger.value = Number(outcome ?? 1);
      }
      // Fire trigger if available or play the machine
      if (rollTrigger && typeof rollTrigger.fire === 'function') {
        rollTrigger.fire();
      } else {
        rive.play();
      }
    } catch (e) {
      console.log('Rive play error:', e);
    }

    const timer = setTimeout(() => {
      try {
        rive.pause();
      } catch (e) {
        console.log('Rive pause error:', e);
      }
      if (onEnd) onEnd();
    }, ROLL_ANIM_MS);

    return () => clearTimeout(timer);
  }, [rolling, rive, rollTrigger, outcome, onEnd]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 16,
        }}
      >
        <RiveComponent />
      </div>
    </div>
  );
}

export default RiveDice;

