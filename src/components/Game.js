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

  componentDidMount = () => {
    const blob = new Blob(
      [
        `self.onmessage = e => {
  function reqListener () {
    createImageBitmap(this.response)
    .then(imageBitmap => {
      postMessage({ imageBitmap }, [ imageBitmap ]);
      close();
    });
  }

  const xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.addEventListener("load", reqListener);
  xhr.open("GET", e.data);
  xhr.send();
};`,
      ],
      { type: 'application/javascript' },
    );

    this.worker = new Worker(URL.createObjectURL(blob));
    this.worker.onmessage = e => {
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
    };

    this.loadTimeout = setTimeout(() => {
      this.worker.postMessage(this.props.image);
    }, 100);

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
    this.worker.onmessage = null;
    clearTimeout(this.loadTimeout);
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
