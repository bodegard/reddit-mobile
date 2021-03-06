import Feet from 'feet';

import constants from './constants';

const { BETA, LISTING_REDESIGN } = constants.flags;

const config = {
  [BETA]: true,
  [LISTING_REDESIGN]: { employee: true },
};

const feet = new Feet(config);

function extractUser(ctx) {
  const state = ctx.state;
  if (!state || !state.data || !state.data.user) {
    return {};
  }

  return state.data.user;
}

feet.addRule('loggedin', function(val) {
  return !!this.props.ctx.token === val;
});

feet.addRule('users', function(users) {
  const user = extractUser(this);
  return users.includes(user.name);
});

feet.addRule('employee', function(val) {
  return extractUser(this).is_employee === val;
});

feet.addRule('admin', function(val) {
  return extractUser(this).is_admin === val;
});

feet.addRule('beta', function(val) {
  return extractUser(this).is_beta === val;
});

feet.addRule('url', function(query) {
  // turns { feature_thing: true, wat: 7 } into { thing: true }
  const parsedQuery = Feet.parseConfig(this.props.ctx.query);
  return Object.keys(parsedQuery).includes(query);
});

export default feet;
