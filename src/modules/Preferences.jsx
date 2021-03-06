import React from 'react';
import { injectIntl } from 'react-intl';

import List, { ListItem, ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';

import Card, { CardContent } from 'material-ui/Card';

import { connect } from 'react-redux';
import { updateIntl } from 'react-intl-redux';

import { languages, storeLocaleForUser } from '../utils/intl';

import CardGridWrapper from '../components/CardGridWrapper';

const mapStateToProps = state => ({
  activeLanguage: state.intl.locale,
  user: state.auth.data.decoded,
});

const mapDispatchToProps = dispatch => ({
  changeLanguage: (user, locale) => {
    storeLocaleForUser(user.email, locale);
    dispatch(
      updateIntl({
        locale,
        messages: languages[locale].translations,
      }),
    );
  },
});

export class Preferences extends React.Component {
  static defaultProps = {
    user: {
      email: 'Default user',
      scope: 'user',
    },
  };

  state = {
    languageMenuOpen: false,
    languageMenuAnchor: null,
  };

  render() {
    const {
      activeLanguage,
      changeLanguage,
      user,
      intl: { formatMessage },
    } = this.props;

    return (
      <CardGridWrapper>
        <Card>
          <CardContent>
            <Typography type="headline">
              {formatMessage({ id: 'language' })}
            </Typography>
            <List>
              <ListItem
                button
                aria-haspopup="true"
                aria-controls="language-menu"
                aria-label="App language"
                onClick={e =>
                  this.setState({
                    languageMenuOpen: true,
                    languageMenuAnchor: e.currentTarget,
                  })}
              >
                <ListItemText
                  primary={formatMessage({ id: 'selectedLanguage' })}
                  secondary={
                    languages[activeLanguage] ? (
                      languages[activeLanguage].name
                    ) : (
                      'unknown'
                    )
                  }
                />
              </ListItem>
            </List>
            <Menu
              id="language-menu"
              anchorEl={this.state.languageMenuAnchor}
              open={this.state.languageMenuOpen}
              onRequestClose={() => this.setState({ languageMenuOpen: false })}
            >
              {Object.keys(languages).map(language => (
                <MenuItem
                  key={language}
                  selected={language === activeLanguage}
                  onClick={() => {
                    changeLanguage(user, language);
                    this.setState({ languageMenuOpen: false });
                  }}
                >
                  {languages[language].name}
                </MenuItem>
              ))}
            </Menu>
          </CardContent>
        </Card>
      </CardGridWrapper>
    );
  }
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(Preferences),
);
