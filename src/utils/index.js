export const formatDateWithI18n = (date, t) => {
  const moment = require('moment');
  const today = moment();
  const yesterday = moment().subtract(1, 'day');
  const messageDate = moment(date);

  if (messageDate.isSame(today, 'day')) {
    return t('today');
  } else if (messageDate.isSame(yesterday, 'day')) {
    return t('yesterday');
  } else {
    return messageDate.format('DD/MM/YYYY');
  }
};
