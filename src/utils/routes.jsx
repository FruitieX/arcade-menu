import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';
import { Route, Switch } from 'react-router-dom';

/*
Configure all your app's routes here.

The first route will be aliased to '/' (index route)

Each route contains the following keys:
  - path:
    * URL path of route.
  - name:
    * Name of route as displayed in header.
    * Used as i18n id, remember to add translations to translations/*.js
  - component:
    * Which component to render when route is active.
    * Remember to import it below.
  - icon:
    * Which icon to use in NavigationDrawer for route.
    * Takes icon font string as found on: https://material.io/icons
  - requiresLogin:
    * Does the route require user to be authenticated?
    * Redirects to login screen for unauthenticated users.

Routes may optionally contain the following keys:
  - separator:
    * Whether to show a separator in NavigationDrawer below route
  - hideWhenScope:
    * Array of scopes, if user scope found in array hide route from NavigationDrawer.
    * null scope in array means unauthenticated.
*/

// Icons
import FavoriteIcon from 'material-ui-icons/Star';
import GamesIcon from 'material-ui-icons/VideogameAsset';
import PreferencesIcon from 'material-ui-icons/Settings';

// Components
import Favorites from '../modules/Favorites';
import Preferences from '../modules/Preferences';

// Routes
const routeConfigs = [
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    icon: FavoriteIcon,
  },
  {
    path: '/all',
    name: 'All Games',
    component: Favorites,
    icon: GamesIcon,
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: Preferences,
    icon: PreferencesIcon,
  },
];

export default routeConfigs;

/*
Code below this line configures the routes as given by routeConfigs
*/

// PropTypes "schema" for routeConfig
export const RouteConfigShape = PropTypes.shape({
  path: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired,
  icon: PropTypes.func.isRequired,
  requiresLogin: PropTypes.bool,
  showHeader: PropTypes.bool,
});

const mapStateToProps = state => ({
  loggedIn: !!state.auth.data.token,
});

// Takes a routeConfig and wraps it in react-router's <Route> component.
// If requiresLogin is true, redirect to /login if user has not authenticated

// Must wrap in withRouter here to avoid this:
// https://reacttraining.com/react-router/web/guides/dealing-with-update-blocking
class AuthRedirectRoute extends React.Component {
  static propTypes = {
    loggedIn: PropTypes.bool,
    requiresLogin: PropTypes.bool,
    component: PropTypes.func.isRequired,
  };

  static defaultProps = {
    loggedIn: false,
    requiresLogin: false,
  };

  render() {
    const {
      component: ChildComponent,
      loggedIn,
      requiresLogin,
      ...rest
    } = this.props;

    return (
      <Route
        {...rest}
        render={props =>
          !requiresLogin || loggedIn ? (
            <ChildComponent {...props} />
          ) : (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location },
              }}
            />
          )}
      />
    );
  }
}

const ConnectedAuthRedirectRoute = withRouter(
  connect(mapStateToProps)(AuthRedirectRoute),
);

// AuthRedirectRoute wrapper which mounts routeConfig at '/' regardless of configured path
export const IndexRoute = ({ routeConfig, ...rest }) => {
  const indexRoute = {
    ...routeConfig,
    path: '/',
  };

  return <ConnectedAuthRedirectRoute exact {...rest} {...indexRoute} />;
};

IndexRoute.propTypes = {
  routeConfig: RouteConfigShape.isRequired,
};

// Map all configured routes into AuthRedirectRoute components
export const ConfiguredRoutes = ({ ...rest }) => (
  <Switch>
    {routeConfigs.map(routeConfig => (
      <ConnectedAuthRedirectRoute
        key={routeConfig.path}
        {...routeConfig}
        {...rest}
      />
    ))}
    <Redirect to={{ pathname: '/' }} />
  </Switch>
);

// Check that routeConfigs array is a valid RouteConfigShape
PropTypes.checkPropTypes(
  {
    routeConfigs: PropTypes.arrayOf(RouteConfigShape).isRequired,
  },
  { routeConfigs },
  'prop',
  'routeConfigs',
);
