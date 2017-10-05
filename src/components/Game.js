import React from 'react';
import ReactDOM from 'react-dom';

import styled from 'styled-components';
import { blue, grey } from 'material-ui/colors';

const Thumb = styled.canvas.attrs(
  {
    //src: props => props.image,
  },
)`
  width: 20vw;
  height: 15vw;
  border-radius: 0.5vw;
  object-fit: cover;
  object-position: 0 0;
  transition: opacity 500ms ease-in-out;
  transform: rotateZ(360deg);
`;

const GameContainerBackground = styled.div`
  padding: 0.5vw;
  margin: 1vw;
  background-color: ${props => (props.selected ? blue[500] : 'transparent')};
  border-radius: 0.5vw;
  transition: background-color 0.2s ease-out, transform 0.2s ease-out;
  transform: ${props => (props.selected ? 'scale(1.1)' : '')};
`;

const GameContainer = styled.div`
  position: relative;
  background-color: ${grey[100]};
  box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.16), 0 0.5vw 1vw rgba(0, 0, 0, 0.23);
  border-radius: 0.5vw;
  width: 20vw;
  height: 15vw;
  margin: 1vw;
  overflow: hidden;
`;

const Title = styled.div`
  background-color: rgba(255, 255, 255, 0.75);
  text-overflow: ellipsis;
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 5vw;
  font-weight: bold;
  font-size: 2vw;
  text-align: center;
  font-family: Roboto Condensed;
  color: #444;
`;

export default class Game extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isScrolling: props.isScrolling,
      imgSrc: null,
      imgOpacity: 0,
    };
  }

  onMessage = e => {
    const ctx = ReactDOM.findDOMNode(this.ref).getContext('2d');
    ctx.drawImage(
      e.data.imageBitmap,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
    );
    this.setState({ imgOpacity: 1 });
    /*
    if (e.data.filename === this.props.image) {
      console.log('got response', e);
      //console.log('Response: ', e.data, typeof e.data);
      const ctx = ReactDOM.findDOMNode(this.ref).getContext('2d');
      ctx.drawImage(
        e.data.imageBitmap,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
      );
      this.setState({ imgOpacity: 1 });
    }
    */
  };
  componentDidMount = async () => {
    this.worker = new SharedWorker('/imageDecoder.js');
    this.worker.port.onmessage = this.onMessage;

    fetch(this.props.image)
      .then(response => response.arrayBuffer())
      .then(buffer => this.worker.port.postMessage({ buffer }, [buffer]));

    // THIS SHIT WORKS
    /*
      .then(buffer => {
        const blob = new Blob([buffer]);

        console.log(blob);

        createImageBitmap(blob).then(imageBitmap => console.log(imageBitmap));
      });
      */
    /*
      .then(blob => createImageBitmap(blob))
      .then(imageBitmap => port.postMessage({ imageBitmap }, [imageBitmap]))
      .catch(e => port.postMessage('error' + e));
      */

    //console.log('postMessage', this.props.image);
    //this.worker.port.postMessage(this.props.image);

    /*
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.addEventListener('load', reqListener);
    xhr.addEventListener('onerror', errListener);
    xhr.open('GET', e.data);
    xhr.send();
    */

    /*
    fetch(this.props.image)
      .then(response => response.arrayBuffer())
      .then(buffer => this.worker.port.postMessage({ buffer }, [buffer]));
      */

    /*
    this.loadTimeout = setTimeout(() => {
      imageDecoder.port.postMessage(this.props.image);
    }, 0);
    */

    // this.image = new Image();
    // this.image.onload = () => {
    //   console.log(this.image);
    //   console.log('foo');
    // };
    // fetch(this.props.image)
    //   .then(response => response.blob())
    //   .then(blob => worker.postMessage(blob));
    //this.image.src = this.props.image;

    /*
    this.image = new Image();
    this.image.onload = () => {
      createImageBitmap(this.image, 0, 0, 300, 240).then(sprite =>
        this.setState({ imgSrc: sprite, imgOpacity: 1 }),
      );
    };
    */
  };

  componentWillUnmount = () => {
    // this.image.onload = null;
    //clearTimeout(this.loadTimeout);
    //imageDecoder.removeListener('message', this.onMessage);
    this.worker.port.onmessage = null;
  };

  componentWillReceiveProps = nextProps => {
    if (this.state.isScrolling && !nextProps.isScrolling) {
      this.setState({
        isScrolling: false,
      });
    }
  };

  storeRef = ref => (this.ref = ref);

  render = () => (
    <GameContainerBackground selected={this.props.selected}>
      <GameContainer selected={this.props.selected}>
        <Thumb
          ref={this.storeRef}
          image={this.state.imgSrc}
          style={{ opacity: this.state.imgOpacity }}
          width={400}
          height={300}
        />
        <Title>{this.props.filename}</Title>
      </GameContainer>
    </GameContainerBackground>
  );
}
