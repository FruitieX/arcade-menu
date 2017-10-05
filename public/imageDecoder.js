/*
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export default URL.createObjectURL(
  new Blob(
    [
      `
*/

//console.log('worker started');

//const webFrame = require('electron').webFrame;
//webFrame.registerURLSchemeAsPrivileged('file');

onconnect = e => {
  const port = e.ports[0];
  //console.log('got connection from port', port);
  port.onmessage = e => {
    //console.log('worker got', e.data);
    const blob = new Blob([e.data.buffer]);

    createImageBitmap(blob).then(imageBitmap =>
      port.postMessage({ imageBitmap }, [imageBitmap]),
    );
    /*
    fetch(e.data)
      .then(e => port.postMessage('there'))
      .then(response => response.blob())
      .then(blob => createImageBitmap(blob))
      .then(imageBitmap => port.postMessage({ imageBitmap }, [imageBitmap]))
      .catch(e => port.postMessage('error' + e));
    /*
    */
    /*
    function reqListener() {
      port.postMessage('xhr');
    }

    function errListener() {
      port.postMessage('xhr' + e.data);
      //console.log('xhr error');
    }
    */
    /*

    port.postMessage('asd');
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.addEventListener('load', reqListener);
    xhr.addEventListener('onerror', errListener);
    xhr.open('GET', e.data);
    xhr.send();
    */
  };
};

/*`,
    ],
    { type: 'application/javascript' },
  ),
);

*/
/*
const worker = new SharedWorker(URL.createObjectURL(blob));

export default worker;
*/

/*
worker.onmessage = e => {
  emitter.emit('message', e);
};

worker.onerror = console.log;

const postMessage = message => worker.postMessage(message);

export { postMessage };
export default emitter;
*/
