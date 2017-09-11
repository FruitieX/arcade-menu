import React from 'react';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';

import MenuIcon from 'material-ui-icons/Menu';

import { FormattedMessage, injectIntl } from 'react-intl';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { toggleDrawer } from './NavigationDrawer';
import routes from '../utils/routes';

const getTitle = path => {
  if (path === '/') {
    return routes[0].name;
  }

  const foundRoute = routes.find(
    route => (route.path === path ? route.name : null),
  );

  if (foundRoute) {
    return foundRoute.name;
  }
  console.warn(`No title found for path '${path}'`);
  console.warn('Make sure the title name is defined in src/routes.js');
  return `ERROR: Title not found for path: ${path}`;
};

const mapStateToProps = (state, ownProps) => ({
  path: ownProps.location.pathname,
  user: state.auth.data.decoded,
});

const mapDispatchToProps = dispatch => ({
  doToggleDrawer() {
    dispatch(toggleDrawer());
  },
  preferences() {
    dispatch(push('/preferences'));
  },
});

export class Header extends React.Component {
  static defaultProps = {
    user: null,
  };

  state = {
    rightMenuOpen: false,
    rightMenuAnchorEl: null,
  };

  render() {
    const { path, doToggleDrawer } = this.props;

    return (
      <AppBar>
        <Toolbar>
          <IconButton color="contrast" onClick={() => doToggleDrawer()}>
            <MenuIcon />
          </IconButton>
          <Typography style={{ flex: 1 }} type="title" color="inherit">
            <FormattedMessage id={getTitle(path)} />
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(Header)),
);
