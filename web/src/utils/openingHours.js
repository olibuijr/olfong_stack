// Opening hours configuration
export const OPENING_HOURS = {
  monday: { open: '10:00', close: '22:00' },
  tuesday: { open: '10:00', close: '22:00' },
  wednesday: { open: '10:00', close: '22:00' },
  thursday: { open: '10:00', close: '22:00' },
  friday: { open: '10:00', close: '22:00' },
  saturday: { open: '10:00', close: '22:00' },
  sunday: { open: '10:00', close: '22:00' }
};

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Get opening hours for a specific day
 */
export const getHoursForDay = (dayName) => {
  return OPENING_HOURS[dayName.toLowerCase()];
};

/**
 * Get opening hours for today
 */
export const getTodayHours = () => {
  const today = new Date().getDay();
  const dayName = DAYS_OF_WEEK[today];
  return getHoursForDay(dayName);
};

/**
 * Check if store is currently open
 */
export const isStoreOpen = () => {
  const now = new Date();
  const hours = getTodayHours();

  if (!hours) return false;

  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return currentTime >= hours.open && currentTime < hours.close;
};

/**
 * Get simplified opening hours (groups consecutive days with same hours)
 */
export const getSimplifiedOpeningHours = (language = 'is') => {
  const dayNames = {
    is: {
      monday: 'Mánudagur',
      tuesday: 'Þriðjudagur',
      wednesday: 'Miðvikudagur',
      thursday: 'Fimmtudagur',
      friday: 'Föstudagur',
      saturday: 'Laugardagur',
      sunday: 'Sunnudagur'
    },
    en: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const simplified = [];
  let currentGroup = null;

  days.forEach((day, index) => {
    const hours = OPENING_HOURS[day];
    const hoursString = `${hours.open} - ${hours.close}`;

    if (!currentGroup) {
      currentGroup = {
        days: [day],
        hours: hoursString
      };
    } else if (currentGroup.hours === hoursString) {
      currentGroup.days.push(day);
    } else {
      simplified.push(currentGroup);
      currentGroup = {
        days: [day],
        hours: hoursString
      };
    }

    if (index === days.length - 1) {
      simplified.push(currentGroup);
    }
  });

  return simplified.map(group => {
    const names = dayNames[language] || dayNames.is;
    let dayRange;

    if (group.days.length === 1) {
      dayRange = names[group.days[0]];
    } else if (group.days.length === 7) {
      dayRange = language === 'is' ? 'Alla daga' : 'Every day';
    } else {
      const firstDay = names[group.days[0]];
      const lastDay = names[group.days[group.days.length - 1]];
      dayRange = `${firstDay} - ${lastDay}`;
    }

    return {
      days: dayRange,
      hours: group.hours
    };
  });
};

/**
 * Get current day name in specified language
 */
export const getCurrentDayName = (language = 'is') => {
  const today = new Date().getDay();
  const dayName = DAYS_OF_WEEK[today];

  const dayNames = {
    is: {
      monday: 'Mánudagur',
      tuesday: 'Þriðjudagur',
      wednesday: 'Miðvikudagur',
      thursday: 'Fimmtudagur',
      friday: 'Föstudagur',
      saturday: 'Laugardagur',
      sunday: 'Sunnudagur'
    },
    en: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    }
  };

  return (dayNames[language] || dayNames.is)[dayName];
};
