import React from 'react';

import styled from 'styled-components';
import { blue } from 'material-ui/colors';

const Thumb = styled.img`
  width: 20vw;
  height: 15vw;
  background-image: url(${props => props.image});
  background-size: cover;
  border-radius: 0.5vw;
`;

const GameContainerBackground = styled.div`
  margin: 1.5vw;
  background-color: ${props => (props.selected ? blue[500] : 'transparent')};
  border-radius: 0.5vw;
  transition: background-color 0.2s ease-out, transform 0.2s ease-out;
  transform: ${props => (props.selected ? 'scale(1.2)' : '')};
`;

const GameContainer = styled.div`
  position: relative;
  background-color: white;
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
  font-size: 2vw;
  text-align: center;
  font-family: Roboto Condensed;
  color: #444;
`;

export default class Game extends React.PureComponent {
  render = () => (
    <GameContainerBackground selected={this.props.selected}>
      <GameContainer selected={this.props.selected}>
        <Thumb image={this.props.image} />
        <Title>{this.props.title}</Title>
      </GameContainer>
    </GameContainerBackground>
  );
}
