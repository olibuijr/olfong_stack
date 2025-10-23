import { useLanguage } from "../../contexts/LanguageContext";
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSimplifiedOpeningHours } from '../../utils/openingHours';

const Footer = () => {
  const { t, currentLanguage } = useLanguage();
  const [openingHours, setOpeningHours] = useState(null);

  useEffect(() => {
    fetchOpeningHours();
  }, []);

  const fetchOpeningHours = async () => {
    try {
      const response = await fetch('/api/settings/opening-hours');
      if (response.ok) {
        const data = await response.json();
        if (data.data?.openingHours) {
          setOpeningHours(formatOpeningHoursForDisplay(data.data.openingHours, currentLanguage));
        } else {
          // Fallback to hardcoded values
          setOpeningHours(getSimplifiedOpeningHours(currentLanguage));
        }
      }
    } catch (error) {
      console.error('Error fetching opening hours:', error);
      // Fallback to hardcoded values
      setOpeningHours(getSimplifiedOpeningHours(currentLanguage));
    }
  };

  const formatOpeningHoursForDisplay = (hours, language) => {
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
      const dayHours = hours[day];
      const hoursString = dayHours.closed ? 'Closed' : `${dayHours.open} - ${dayHours.close}`;

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

    const names = dayNames[language] || dayNames.is;

    return simplified.map(group => {
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

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/logo_black-web.webp" 
                alt="Ölföng Logo" 
                className="h-16 w-auto dark:invert"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              {t('footer.aboutUs')}
            </p>
            <div className="flex space-x-4">
              <span className="text-gray-600 dark:text-gray-300">📞 +354 555 1234</span>
              <span className="text-gray-600 dark:text-gray-300">✉️ info@olfong.is</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation.products')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=WINE" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation.wine')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=BEER" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation.beer')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=SPIRITS" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation.spirits')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=NON_ALCOHOLIC" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation.nonAlcoholic')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {currentLanguage === 'is' ? 'Opnunartímar' : 'Opening Hours'}
            </h3>
            <ul className="space-y-2">
              {(openingHours || getSimplifiedOpeningHours(currentLanguage)).map((item, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{item.days}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{item.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">© 2025 Ölföng. {t('footer.copyright')}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{t('footer.legal')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
