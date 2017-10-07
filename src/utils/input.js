import EventEmitter from 'event-emitter';
import Mousetrap from 'mousetrap';

const gamepads = {};

const inputEmitter = new EventEmitter();
export default inputEmitter;

const emitEvent = event => () => inputEmitter.emit(event);

const pollGamepad = gamepad => {
  //console.log(gamepad.prevButtonState[0], gamepad.device.buttons[0]);
};

const pollGamepads = () => {
  const navigatorGamepads = navigator.getGamepads();

  Object.keys(gamepads).forEach(gamepadId => {
    pollGamepad({
      ...gamepads[gamepadId],
      device: navigatorGamepads[gamepadId],
    });
  });
  window.requestAnimationFrame(pollGamepads);
};

export const initInput = () => {
  window.addEventListener(
    'keydown',
    function(e) {
      // space and arrow keys
      if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
    },
    false,
  );

  window.onwheel = () => false;

  Mousetrap.bind('up', emitEvent('up'));
  Mousetrap.bind('down', emitEvent('down'));
  Mousetrap.bind('left', emitEvent('left'));
  Mousetrap.bind('right', emitEvent('right'));
  Mousetrap.bind('return', emitEvent('select'));

  const gamepadHandler = (event, connecting) => {
    var gamepad = event.gamepad;

    if (connecting) {
      console.log(`Gamepad connected (id: ${gamepad.id})`);
      console.log(gamepad);
      gamepads[gamepad.index] = {
        prevButtonState: [...gamepad.buttons],
        device: gamepad,
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
