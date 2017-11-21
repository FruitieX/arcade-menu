// @flow

import React from 'react';
import ReactDOM from 'react-dom';

import styled from 'styled-components';
import { blue, grey } from 'material-ui/colors';

const Thumb = styled.canvas`
  width: 20vw;
  height: 15vw;
  border-radius: 0.5vw;
  object-fit: cover;
  object-position: 0 0;
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

type Props = {
  image: string,
  selected: boolean,
};

type WorkerReply = {
  data: {
    imageBitmap: ImageBitmap,
  },
};

export default class GameThumbnail extends React.PureComponent<Props> {
  worker: SharedWorker;
  ref: ?HTMLCanvasElement;

  onMessage = (e: WorkerReply) => {
    const domNode = ReactDOM.findDOMNode(this.ref);
    if (!domNode) return;

    const ctx = domNode.getContext('2d');
    ctx.drawImage(
      e.data.imageBitmap,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
    );
  };
  componentDidMount = () => {
    // Decode images in separate thread to avoid jank due to image decoding
    this.worker = new SharedWorker('/imageDecoder.js');
    this.worker.port.onmessage = this.onMessage;

    this.worker.port.postMessage(this.props.image);
  };

  componentWillUnmount = () => {
    this.worker.port.postMessage('cancel');
    this.worker.port.onmessage = null;
  };

  storeRef = ref => (this.ref = ref);

  render = () => (
    <GameContainerBackground selected={this.props.selected}>
      <GameContainer selected={this.props.selected}>
        <Thumb ref={this.storeRef} width={400} height={300} />
        <Title>{this.props.filename}</Title>
      </GameContainer>
    </GameContainerBackground>
  );
}
