// @flow

import EventEmitter from 'event-emitter';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';

const gamepads = {};

const inputEmitter = new EventEmitter();
export default inputEmitter;

type ButtonEvent = {
  button: string,
  pressed: boolean,
};

const emitButton = (button, pressed) =>
  inputEmitter.emit(button, ({ button, pressed }: ButtonEvent));

const pollGamepad = (gamepad, gamepadId) => {
  console.log(gamepads);
  console.log(
    gamepads[gamepadId].prevState.buttons[0].value,
    gamepad.buttons[0].value,
  );
};

const pollGamepads = () => {
  //forEach(navigator.getGamepads(), pollGamepad);

  //forEach(gamepads, gamepad => (gamepad.prevState = cloneDeep(gamepad)));

  window.requestAnimationFrame(pollGamepads);
};

export const initInput = () => {
  window.onwheel = () => false;
  window.addEventListener('keydown', event => {
    if (event.repeat) {
      // Ignore auto-repeat presses
      return event.preventDefault();
    }

    console.log('Keyboard keydown:', event.key);

    if (event.key === 'ArrowUp') {
      emitButton('up', true);
    } else if (event.key === 'ArrowDown') {
      emitButton('down', true);
    } else if (event.key === 'ArrowLeft') {
      emitButton('left', true);
    } else if (event.key === 'ArrowRight') {
      emitButton('right', true);
    } else if (event.key === 'Enter') {
      emitButton('select', true);
    } else if (event.key === 'Escape') {
      emitButton('back', true);
    } else if (event.key === 'Control') {
      emitButton('letterscroll', true);
    } else {
      event.preventDefault();
    }
  });
  window.addEventListener('keyup', event => {
    console.log('Keyboard keyup:', event.key);

    if (event.key === 'ArrowUp') {
      emitButton('up', false);
    } else if (event.key === 'ArrowDown') {
      emitButton('down', false);
    } else if (event.key === 'ArrowLeft') {
      emitButton('left', false);
    } else if (event.key === 'ArrowRight') {
      emitButton('right', false);
    } else if (event.key === 'Enter') {
      emitButton('select', false);
    } else if (event.key === 'Escape') {
      emitButton('back', false);
    } else if (event.key === 'Control') {
      emitButton('letterscroll', false);
    } else {
      event.preventDefault();
    }
  });

  const gamepadHandler = (event, connecting) => {
    var gamepad = event.gamepad;

    if (connecting) {
      console.log(`Gamepad connected (id: ${gamepad.id})`);
      gamepads[gamepad.index] = {
        prevState: cloneDeep(gamepad),
      };
    } else {
      delete gamepads[gamepad.index];
    }
  };

  window.addEventListener(
    'gamepadconnected',
    e => gamepadHandler(e, true),
    false,
  );
  window.addEventListener(
    'gamepaddisconnected',
    e => gamepadHandler(e, false),
    false,
  );

  window.requestAnimationFrame(pollGamepads);
};
